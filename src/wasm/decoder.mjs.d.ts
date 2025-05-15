// src/wasm/decoder.mjs.d.ts

// Define un tipo para la instancia WASM si sabes cuál es, si no, 'any' es un inicio.
// Podría ser WebAssembly.Instance si usas la API estándar.
type WasmInstance = any; // O WebAssembly.Instance

/**
 * Inicializa el módulo WASM.
 * @param wasmPath La ruta al archivo .wasm.
 * @returns Una promesa que resuelve con la instancia WASM.
 */
export function initializeWasmDecoder(wasmPath: string): Promise<{ wasmInstance: WasmInstance }>;

/**
 * Reconstruye los bytes originales a partir de cadenas hexadecimales usando WASM.
 * @param wasmInstance La instancia WASM inicializada.
 * @param hexStrings Un array de cadenas hexadecimales.
 * @returns Una promesa que resuelve con la cadena resultante (probablemente Base64).
 */
export function reconstructOriginalBytes(wasmInstance: WasmInstance, hexStrings: string[]): Promise<string>;
