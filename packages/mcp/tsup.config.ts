import { defineConfig } from "tsup";

// Self-contained Node CLI: bundle the MCP SDK + zod + the generated catalog so
// `npx @nucleux/mcp` runs standalone. Emits an executable ESM entry with a
// shebang; no .d.ts (this package ships a binary, not a type surface).
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  platform: "node",
  target: "node18",
  dts: false,
  sourcemap: false,
  clean: true,
  banner: { js: "#!/usr/bin/env node" },
});
