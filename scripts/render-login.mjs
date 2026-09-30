// Renders the LoginPage component to a self-contained HTML artifact:
// SSR the real component (esbuild bundle, @nucleux/* aliased to source, React
// external) -> static HTML -> Tailwind build (preset + tokens + md3-theme) ->
// inline the CSS into examples/e2e/login.artifact.html for publishing.
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "examples", "e2e");
const aliasMap = JSON.parse(readFileSync(join(root, "scripts", "alias-map.json"), "utf8"));
const alias = Object.fromEntries(Object.entries(aliasMap).map(([k, v]) => [k, resolve(root, v)]));
const tmp = join(outDir, ".login.bundle.mjs");

async function main() {
  mkdirSync(outDir, { recursive: true });

  // 1) Bundle + SSR the LoginPage
  await build({
    entryPoints: [join(root, "packages", "react", "src", "examples", "login-page.tsx")],
    outfile: tmp,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node18",
    jsx: "automatic",
    banner: { js: 'import { createRequire as __cr } from "module"; const require = __cr(import.meta.url);' },
    external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime", "react/jsx-dev-runtime", "lucide-react", "react-hook-form"],
    alias,
    logLevel: "silent",
  });
  const [{ LoginPage }, { renderToStaticMarkup }, React] = await Promise.all([
    import(pathToFileURL(tmp).href),
    import("react-dom/server"),
    import("react"),
  ]);
  const markup = renderToStaticMarkup(React.createElement(LoginPage))
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'");
  rmSync(tmp, { force: true });

  // 2) Scannable page + Tailwind build (reuses examples/e2e config/input)
  writeFileSync(join(outDir, "login.html"), `<!doctype html>\n<html lang="en" class="nx-theme-mui"><head><meta charset="utf-8"/><link rel="stylesheet" href="./output.css"/></head><body>${markup}</body></html>\n`);
  execSync(
    "pnpm exec tailwindcss -c examples/e2e/tailwind.config.cjs -i examples/e2e/input.css -o examples/e2e/output.css --minify",
    { cwd: root, stdio: "inherit" },
  );

  // 3) Inline for a self-contained artifact
  const css = readFileSync(join(outDir, "output.css"), "utf8");
  const artifact = `<style>\n${css}\n</style>\n<div class="nx-theme-mui">${markup}</div>\n`;
  writeFileSync(join(outDir, "login.artifact.html"), artifact);
  console.log(`login artifact ready — ${artifact.length} bytes -> examples/e2e/login.artifact.html`);
}

main().catch((err) => {
  rmSync(tmp, { force: true });
  console.error("render-login failed:", err);
  process.exit(1);
});
