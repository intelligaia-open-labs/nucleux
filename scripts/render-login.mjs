// Renders the login page components to self-contained HTML artifacts:
// SSR each real component (esbuild bundle, @nucleux/* aliased to source, React
// external) -> static HTML -> one Tailwind build (preset + tokens + md3-theme)
// -> inline the CSS per page into examples/e2e/<name>.artifact.html.
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "examples", "e2e");
const exDir = join(root, "packages", "react", "src", "examples");
const aliasMap = JSON.parse(readFileSync(join(root, "scripts", "alias-map.json"), "utf8"));
const alias = Object.fromEntries(Object.entries(aliasMap).map(([k, v]) => [k, resolve(root, v)]));

const PAGES = [
  { entry: "login-page.tsx", exportName: "LoginPage", out: "login", wrap: true },
  { entry: "login-page-shadcn.tsx", exportName: "LoginPageShadcn", out: "login-shadcn", wrap: false },
  { entry: "login-mui3.tsx", exportName: "LoginMui3", out: "login-mui3", wrap: true },
];

const external = ["react", "react-dom", "react-dom/server", "react/jsx-runtime", "react/jsx-dev-runtime", "lucide-react", "react-hook-form"];

async function ssr(entry, exportName) {
  const tmp = join(outDir, `.${exportName}.bundle.mjs`);
  await build({
    entryPoints: [join(exDir, entry)],
    outfile: tmp,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node18",
    jsx: "automatic",
    banner: { js: 'import { createRequire as __cr } from "module"; const require = __cr(import.meta.url);' },
    external,
    alias,
    logLevel: "silent",
  });
  const [mod, { renderToStaticMarkup }, React] = await Promise.all([
    import(pathToFileURL(tmp).href),
    import("react-dom/server"),
    import("react"),
  ]);
  const html = renderToStaticMarkup(React.createElement(mod[exportName]))
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'");
  rmSync(tmp, { force: true });
  return html;
}

async function main() {
  mkdirSync(outDir, { recursive: true });

  // 1) SSR every page and write a scannable .html
  const rendered = [];
  for (const p of PAGES) {
    const markup = await ssr(p.entry, p.exportName);
    const cls = p.wrap ? ' class="nx-theme-mui"' : "";
    writeFileSync(
      join(outDir, `${p.out}.html`),
      `<!doctype html>\n<html lang="en"${cls}><head><meta charset="utf-8"/><link rel="stylesheet" href="./output.css"/></head><body>${markup}</body></html>\n`,
    );
    rendered.push({ ...p, markup });
  }

  // 2) One Tailwind build scanning all e2e pages
  execSync(
    "pnpm exec tailwindcss -c examples/e2e/tailwind.config.cjs -i examples/e2e/input.css -o examples/e2e/output.css --minify",
    { cwd: root, stdio: "inherit" },
  );
  const css = readFileSync(join(outDir, "output.css"), "utf8");

  // 3) Inline per page
  for (const p of rendered) {
    const inner = p.wrap ? `<div class="nx-theme-mui">${p.markup}</div>` : p.markup;
    writeFileSync(join(outDir, `${p.out}.artifact.html`), `<style>\n${css}\n</style>\n${inner}\n`);
    console.log(`  ${p.out}.artifact.html ready`);
  }
}

main().catch((err) => {
  console.error("render-login failed:", err);
  process.exit(1);
});
