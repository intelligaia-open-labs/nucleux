import { defineConfig } from "tsup";

// Shared build config for every @nucleux package. All @nucleux/* siblings,
// React, and lucide-react are external — each package bundles only its own code.
export default defineConfig({
  entry: { index: "src/index.tsx" },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [/^@nucleux\//, "react", "react-dom", "react/jsx-runtime", "lucide-react", "tailwindcss"],
});
