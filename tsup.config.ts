import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    preset: "src/preset.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: ["react", "react-dom", "tailwindcss"],
  // The `"use client"` directive is added post-build (see scripts/add-use-client.mjs)
  // because esbuild strips leading module directives from bundled output. Only the
  // component entry (index) needs it — the Tailwind preset is Node config, not a
  // client boundary.
});
