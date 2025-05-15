import React, { useState, useRef } from "react";
// Import from our new TypeScript implementation
import {
  initializeWasmDecoder,
  reconstructOriginalBytes,
  WasmDecoderInstance
} from "../../utils/decoder";

export const HexDecoder: React.FC = () => {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<
    "utf8" | "base64" | "png" | "jpeg" | "pdf"
  >("utf8");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wasmInstance = useRef<WasmDecoderInstance | null>(null);
  const lastHexInput = useRef<string>("");
  const lastBase64 = useRef<string>("");

  const initWasm = async () => {
    if (!wasmInstance.current) {
      try {
        // No need for wasmPath parameter anymore
        const { wasmInstance: inst } = await initializeWasmDecoder();
        wasmInstance.current = inst;
        console.log("WASM decoder initialized successfully");
      } catch (err: any) {
        console.warn("Failed to initialize WASM decoder, will use JS fallback:", err);
        // We'll continue without a WASM instance and use the JS fallback
      }
    }
    return wasmInstance.current; // This might be null, but our implementation can handle it
  };

  const decode = async () => {
    setError(null);
    setResult(null);
    if (!input.trim()) {
      setError("Please paste some hexadecimal strings first.");
      return;
    }
    setLoading(true);
    try {
      // Initialize WASM (might return null if initialization fails)
      const inst = await initWasm();
      
      // Parse lines or JSON array
      let hexs: string[];
      const txt = input.trim();
      
      if (txt.startsWith("[") && txt.endsWith("]")) {
        try {
          const arr = JSON.parse(txt);
          hexs = Array.isArray(arr) ? arr : [String(arr)];
        } catch {
          hexs = txt.split("\n").filter((l) => l.trim());
        }
      } else {
        hexs = txt
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
      }
      
      // Only process if input has changed
      if (txt !== lastHexInput.current) {
        console.log("Processing new hex input");
        // Our reconstructOriginalBytes function can now handle a null WASM instance
        lastBase64.current = await reconstructOriginalBytes(inst, hexs);
        lastHexInput.current = txt;
      } else {
        console.log("Using cached result");
      }
      
      // Format the output based on the selected format
      let out: string;
      if (format === "utf8") {
        try {
          out = atob(lastBase64.current);
          console.log("Converted base64 to UTF-8 text");
        } catch (err) {
          console.warn("Failed to decode base64 as UTF-8, using raw base64:", err);
          out = lastBase64.current;
        }
      } else {
        // For binary formats we still hold base64; user can download or preview elsewhere
        out = lastBase64.current;
      }
      
      setResult(out);
    } catch (e: any) {
      console.error("Decoding error:", e);
      setError("Decoding error: " + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: typeof format; label: string }[] = [
    { key: "utf8", label: "Text (UTF‑8)" },
    { key: "base64", label: "Base64" },
    { key: "png", label: "PNG" },
    { key: "jpeg", label: "JPEG" },
    { key: "pdf", label: "PDF" },
  ];

  return (
    <div className="bg-white/10 rounded-4xl backdrop-blur-[10px] p-8 max-w-5xl w-full mx-auto text-white">
      <h2 className="text-2xl font-bold text-white mb-4">Metadata:</h2>
      <div className="mb-6">
        <div className="rounded-3xl bg-white/10 backdrop-blur-[10px] flex flex-col gap-2 relative">
          {input.trim() === "" && (
            <div className="font-mono text-base text-[#C3D5F7] mb-1 absolute inset-0 p-8 flex flex-col pointer-events-none">
              <span className="block mb-1">
                Paste your hex strings here, one per line or as an array:
              </span>
              <span className="italic mt-6">Example (line by line):</span>
              <pre className="mb-1">
                48656C6C6F20576F726C64{`\n`}4D756C74694C696E65
              </pre>
              <span className="italic mt-6">Or (array format):</span>
              <pre>["48656C6C6F", "576F726C64"]</pre>
            </div>
          )}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[20rem] p-8 font-mono text-sm text-gray-200 bg-transparent rounded-lg resize-y focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="text-white font-medium mb-2">Output:</div>
        <div className="inline-flex rounded-lg p-1 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFormat(tab.key)}
              className={`px-2 py-1 text-sm font-medium rounded-lg transition ${
                format === tab.key
                  ? "bg-[#051023] bg-opacity-50 text-white"
                  : "text-gray-200 bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={decode}
        disabled={loading}
        className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Decoding…" : "Decode"}
      </button>

      {(result || error) && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-2">
            {error ? "Error" : "Decoded Result"}
          </h3>
          <div className="mt-4 bg-white/10 rounded-4xl backdrop-blur-[10px] border-l-4 border-blue-500 p-5 font-mono text-sm text-gray-100 max-h-64 overflow-y-auto whitespace-pre-wrap">
            {error ? (
              error
            ) : format === "png" || format === "jpeg" ? (
              <div className="flex flex-col items-center">
                <img 
                  src={`data:image/${format};base64,${result}`} 
                  alt="Decoded image" 
                  className="max-w-full max-h-56 object-contain"
                />
                <a 
                  href={`data:image/${format};base64,${result}`} 
                  download={`decoded.${format}`}
                  className="mt-3 text-blue-400 hover:text-blue-300 underline text-sm"
                >
                  Download Image
                </a>
              </div>
            ) : format === "pdf" ? (
              <div className="flex flex-col items-center">
                <iframe
                  src={`data:application/pdf;base64,${result}`}
                  className="w-full h-56 border-0"
                  title="PDF Viewer"
                ></iframe>
                <a 
                  href={`data:application/pdf;base64,${result}`} 
                  download="decoded.pdf"
                  className="mt-3 text-blue-400 hover:text-blue-300 underline text-sm"
                >
                  Download PDF
                </a>
              </div>
            ) : (
              result
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HexDecoder;
