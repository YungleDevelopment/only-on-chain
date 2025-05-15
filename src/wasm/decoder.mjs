export async function initializeWasmDecoder(wasmModuleUrl) {
    try {
        console.log("Loading WASM from URL:", wasmModuleUrl);
        
        // First try the streaming approach
        try {
            const response = await fetch(wasmModuleUrl);
            
            // Check if the response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Try compileStreaming first (more efficient)
            const compiledWasmDecoder = await WebAssembly.compileStreaming(response);
            const wasmInstance = await WebAssembly.instantiate(compiledWasmDecoder, {});
            console.log("WASM initialized successfully via streaming");
            return { wasmInstance };
        } catch (streamingError) {
            console.warn("Streaming compilation failed, falling back to ArrayBuffer approach:", streamingError);
            
            // Fallback to ArrayBuffer approach if streaming fails
            const response = await fetch(wasmModuleUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const wasmBytes = await response.arrayBuffer();
            const wasmModule = await WebAssembly.compile(wasmBytes);
            const wasmInstance = await WebAssembly.instantiate(wasmModule, {});
            console.log("WASM initialized successfully via ArrayBuffer");
            return { wasmInstance };
        }
    } catch (error) {
        console.error("WASM initialization failed:", error);
        throw error;
    }
}



export async function reconstructOriginalBytes(wInstance, hexStringArray) {

    let hexStringPtrs = [];
    let hexStringArrayPtrAddr = 0;
    let base64Ptr = 0;
    const exports = wInstance.exports;
    try {
        // Initialize the haskell runtime
        exports.hs_init(0, 0);

        // Allocate and write each hex string to WASM memory
        hexStringPtrs = hexStringArray.map(str => writeCString(str, wInstance));


        // Allocate the Pointer Array
        // Reserves a block of WASM memory to hold pointers.
        // Each pointer is 4 bytes (32-bit) in size
        // Raw byte offset
        hexStringArrayPtrAddr = exports.malloc_bytes_hs(hexStringPtrs.length * 4);  // 4 bytes per pointer (32-bit)

        // Create a Uint32Array View
        // Creates a "lens" to view WASM memory as 32-bit numbers.
        const arrayMemory32 = new Uint32Array(exports.memory.buffer);

        //  Write Pointers to the Array
        // To find the right "slot" in the Uint32Array, we convert byte offsets to 4-byte indices

        const dataView = new DataView(exports.memory.buffer);
        hexStringPtrs.forEach((ptr, i) => {
            dataView.setUint32(hexStringArrayPtrAddr + i * 4, ptr, true);
        });

        // Call Haskell from WASM module 
        // Call Haskell (returns a pointer to the Base64 string)
        base64Ptr = exports.reconstructOriginalBytesC(
            hexStringArray.length,  // Number of hex strings
            hexStringArrayPtrAddr   // Pointer to array of hex strings
        );

        if (base64Ptr === 0) {
            throw new Error("Failed to reconstruct bytes.");
        }

        // Read the Base64 string from WASM memory
        const base64Str = readCString(exports.memory.buffer, base64Ptr);
        console.log("Base64 result:", base64Str);


        // Decode Base64 string to unicode bytes
        const utf8String = new TextDecoder().decode(
            base64ToBytes(base64Str)
        );
        console.log("UTF-8 result:", utf8String);

        return base64Str;

    } finally {


        if (base64Ptr !== 0) {
            exports.free_hs(base64Ptr);

        }
        // Free the array of pointers

        if (hexStringArrayPtrAddr !== 0) {
            exports.free_hs(hexStringArrayPtrAddr);
        }

        // Free individual hex strings
        hexStringPtrs.forEach(ptr => {
            if (ptr !== 0) exports.free_hs(ptr);
        });

        // Shut down the Haskell runtime
        exports.hs_exit();

    }

}


// Helpers 

// Helper: Read a null-terminated C string from WASM memory
function readCString(memory, ptr) {
    const mem = new Uint8Array(memory);
    let end = ptr;
    const memLength = mem.length
    // Check for out-of-bounds access
    if (ptr >= memLength) {
        throw new Error(`readCString: Pointer ${ptr} is outside WASM memory bounds.`);
    }

    // Find null terminator, but stop at memory boundary
    while (end < memLength && mem[end] !== 0) {
        end++;
    }    
    if (end >= mem.length) {
        throw new Error("readCString: Unterminated string (no null byte found).");
    }

    // Find null terminator
    return new TextDecoder().decode(mem.subarray(ptr, end));
}

// Helper: Write a JS string to WASM memory (returns pointer)
function writeCString(str, wInstance) {
    const lengthNeeded = str.length + 1;
    const ptr = wInstance.exports.malloc_bytes_hs(str.length + 1);  // +1 for null terminator
    const mem = new Uint8Array(wInstance.exports.memory.buffer);


    // Check if pointer is valid and space is sufficient
    if (ptr + lengthNeeded >= mem.length) {
        wInstance.exports.free_hs(ptr);  // Avoid leaking memory
        throw new Error(`writeCString: String '${str}' exceeds allocated WASM memory.`);
    }


    for (let i = 0; i < str.length; i++) {
        mem[ptr + i] = str.charCodeAt(i);
    }
    mem[ptr + str.length] = 0;  // Null-terminate. ptr is the first byte so we add str.length to get the byte after the last string byte
    return ptr;
}


function base64ToBytes(base64) {
    const binStr = atob(base64);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    return bytes;
  }