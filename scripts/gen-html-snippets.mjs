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

  // React useId() emits render-specific ids like `:R0:` / `:r1:` (and derived
  // ids such as `:R0:-support`). Replace each distinct base id with a stable
  // placeholder `__NX_ID_n__` so the MCP server can hand out fresh, unique ids
  // per response (or a `{{id_n}}` template) — reusing a snippet no longer
  // collides. Returns { html, idCount }.
  const parameterizeIds = (html) => {
    const bases = [...new Set(html.match(/:[Rr][0-9a-z]*:/g) ?? [])];
    let out = html;
    bases.forEach((base, i) => {
      out = out.split(base).join(`__NX_ID_${i}__`);
    });
    return { html: out, idCount: bases.length };
  };

  // Visible example text an agent will likely swap (labels, button text, etc.).
  const editableText = (html) => {
    const out = [];
    for (const m of html.matchAll(/>([^<>{}]+)</g)) {
      const t = m[1].trim();
      if (t && /[A-Za-z]/.test(t) && t.length <= 40) out.push(t);
    }
    return [...new Set(out)];
  };

  const snippets = {};
  const failures = [];
  for (const { name, ui } of cases) {
    try {
      const raw = unescapeForTailwind(renderToStaticMarkup(ui));
      const { html, idCount } = parameterizeIds(raw);
      snippets[name.toLowerCase()] = { name, html, idCount, text: editableText(raw) };
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
