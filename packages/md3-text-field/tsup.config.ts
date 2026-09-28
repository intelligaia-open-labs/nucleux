import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.tsx" },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [/^@nucleux\//, "react", "react-dom", "react/jsx-runtime", "lucide-react", "tailwindcss"],
});
