import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const root = dirname(fileURLToPath(import.meta.url));
const aliasMap: Record<string, string> = JSON.parse(
  readFileSync(resolve(root, "scripts/alias-map.json"), "utf8"),
);
const alias = Object.entries(aliasMap).map(([find, rel]) => ({
  find,
  replacement: resolve(root, rel),
}));

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/test/**/*.{test,spec}.{ts,tsx}"],
    css: false,
  },
});
