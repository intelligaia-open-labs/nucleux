import { defineConfig } from "tsup";

// Self-contained Node outputs (SDK, zod and the generated catalog bundled; shared code in one chunk):
// - dist/index.js: the stdio CLI (`nucleux-mobile-mcp`).
// - dist/lib.js: createServer, registerMobileTools and the pure query functions, for tests and for embedding the
//   mobile tools in another MCP server (e.g. @nucleux/mcp).
export default defineConfig({
  entry: { index: "src/index.ts", lib: "src/lib.ts" },
  format: ["esm"],
  platform: "node",
  target: "node18",
  dts: false,
  sourcemap: false,
  clean: true,
  banner: { js: "#!/usr/bin/env node" },
});
