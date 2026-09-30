// Generates packages/mcp/src/html-snippets.json — a map of component name to a
// server-rendered static HTML snippet. Consumed by the @nucleux/mcp server so AI
// agents can request HTML markup (Tailwind-classed) instead of React/TSX.
//
// It bundles the shared fixtures (packages/mcp/gen/fixtures.tsx, which mirror the
// test render cases) with esbuild — aliasing @nucleux/* to source and keeping
// React + heavy libs external — then renders each fixture with
// react-dom/server's renderToStaticMarkup. Runs in the mcp package's prebuild.
import { build } from "esbuild";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const aliasMap = JSON.parse(readFileSync(join(root, "scripts", "alias-map.json"), "utf8"));

// Exact-name aliases: @nucleux/* -> absolute source entry.
const alias = Object.fromEntries(
  Object.entries(aliasMap).map(([k, v]) => [k, resolve(root, v)]),
);

const tmp = join(root, "packages", "mcp", "gen", ".fixtures.bundle.mjs");

async function main() {
  await build({
    entryPoints: [join(root, "packages", "mcp", "gen", "fixtures.tsx")],
    outfile: tmp,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node18",
    jsx: "automatic",
    // Some deps (react-day-picker) are CommonJS and `require()` externals; provide
    // a real `require` so esbuild's shim resolves them at runtime in this ESM bundle.
    banner: { js: 'import { createRequire as __cr } from "module"; const require = __cr(import.meta.url);' },
    // Externalize only what's installed at the workspace root (so a single React
    // instance is shared at runtime). Everything else — @nucleux source (via
    // alias), clsx/tailwind-merge, recharts, embla, react-day-picker,
    // @tanstack/react-table — is bundled in from each package's node_modules.
    external: [
      "react",
      "react-dom",
      "react-dom/server",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "lucide-react",
      "react-hook-form",
    ],
    alias,
    logLevel: "silent",
  });

  const [{ cases }, { renderToStaticMarkup }] = await Promise.all([
    import(pathToFileURL(tmp).href),
    import("react-dom/server"),
  ]);

  // renderToStaticMarkup escapes & and ' inside class attributes (e.g.
  // `[&_svg]:size-5` -> `[&amp;_svg]`, `content-['']` -> `content-[&#x27;&#x27;]`).
  // That's valid HTML, but Tailwind's class scanner won't match the escaped form
  // when the snippet is pasted into a project. Decode those two so the utilities
  // resolve; everything else stays escaped.
  const unescapeForTailwind = (html) => html.replace(/&amp;/g, "&").replace(/&#x27;/g, "'");

  const snippets = {};
  const failures = [];
  for (const { name, ui } of cases) {
    try {
      const html = unescapeForTailwind(renderToStaticMarkup(ui));
      snippets[name.toLowerCase()] = { name, html };
    } catch (err) {
      failures.push(`${name}: ${err?.message ?? err}`);
    }
  }

  rmSync(tmp, { force: true });

  const out = {
    generatedFrom: "packages/mcp/gen/fixtures.tsx (do not edit — run scripts/gen-html-snippets.mjs)",
    count: Object.keys(snippets).length,
    snippets,
  };
  writeFileSync(join(root, "packages", "mcp", "src", "html-snippets.json"), JSON.stringify(out, null, 2) + "\n");
  console.log(`html-snippets.json → ${out.count} snippets${failures.length ? `, ${failures.length} skipped` : ""}`);
  if (failures.length) console.error("  skipped:\n  - " + failures.join("\n  - "));
}

main().catch((err) => {
  rmSync(tmp, { force: true });
  console.error("gen-html-snippets failed:", err);
  process.exit(1);
});
