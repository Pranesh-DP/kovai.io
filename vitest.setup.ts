import * as zlib from "node:zlib";

// Polyfill missing zstd decompress in environments where undici decompressor expects it
if (typeof (zlib as Record<string, unknown>).createZstdDecompress !== "function") {
  (zlib as Record<string, unknown>).createZstdDecompress = () => {};
}
