import { defineConfig } from "tsup";

// One self-contained file for the private distribution repo (intelligaia/nucleux-mobile-mcp): the server, the MCP SDK,
// zod and the generated catalog, so `npx -y github:intelligaia/nucleux-mobile-mcp` needs no install step.
// Built by scripts/publish-mcp-repo.mjs; not part of this package's own dist/.
export default defineConfig({
  entry: { "nucleux-mobile-mcp": "src/index.ts" },
  outDir: "../.mcp-bundle",
  format: ["cjs"],
  platform: "node",
  target: "node18",
  noExternal: [/.*/],
  minify: false,
  sourcemap: false,
  clean: true,
  dts: false,
  banner: { js: "#!/usr/bin/env node" },
});
