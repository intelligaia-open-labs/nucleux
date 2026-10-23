// Generates packages/mcp/src/catalog.json — a machine-readable index of every
// @nucleux package (description, exports, structured Props, import + install) plus
// the example compositions. Consumed by the @nucleux/mcp server so AI coding
// agents can discover and correctly use the library. Run on `pnpm build` (the
// mcp package's build script) and committed so typecheck works without it.
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { extractProps } from "./lib/extract-props.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgsDir = join(root, "packages");

/** Packages that are infrastructure, not components. */
const NON_COMPONENT = new Set(["mcp", "react", "tokens", "utils", "hooks", "md3-theme"]);


/** Strip `/** ... *\/` decoration into a one-line-ish description. */
function cleanJsdoc(block) {
  return block
    .replace(/^\s*\/\*\*/, "")
    .replace(/\*\/\s*$/, "")
    .split("\n")
    .map((l) => l.replace(/^\s*\*?\s?/, "").trimEnd())
    .join("\n")
    .trim();
}

function extractExports(src) {
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:const|function|class)\s+([A-Za-z0-9_]+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s+(?:interface|type)\s+([A-Za-z0-9_]+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]*)\}(?!\s*from)/g)) {
    for (const raw of m[1].split(",")) {
      const name = raw.trim().split(/\s+as\s+/).pop()?.trim();
      if (name && /^[A-Za-z0-9_]+$/.test(name)) names.add(name);
    }
  }
  return [...names];
}

/** JSDoc block sitting directly above the primary exported component. */
function leadDescription(src) {
  const re = /\/\*\*[\s\S]*?\*\//g;
  let m;
  while ((m = re.exec(src))) {
    if (/^\s*export\s+(?:const|function)\s+[A-Z]/.test(src.slice(re.lastIndex))) {
      return cleanJsdoc(m[0]);
    }
  }
  return "";
}

/** Resolve a relative module specifier to a .ts/.tsx file next to `fromFile`. */
function resolveLocal(fromFile, spec) {
  for (const ext of ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    const p = join(dirname(fromFile), spec + ext);
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return undefined;
}

/**
 * The package entry's source, with local re-exports inlined: `export * from "./x"`
 * is replaced by x's source, so barrels such as @nucleux/utils (`cn`, shared
 * types) expose what they re-export. Named local re-exports are rewritten to a
 * plain `export { … }` list after inlining the file.
 */
function readSource(file, seen = new Set()) {
  if (seen.has(file)) return "";
  seen.add(file);
  return readFileSync(file, "utf8").replace(
    /export\s+(\*|\{[^}]*\})\s+from\s+["'](\.{1,2}\/[^"']+)["'];?/g,
    (stmt, what, spec) => {
      const target = resolveLocal(file, spec);
      if (!target) return stmt;
      const inlined = readSource(target, seen).replace(/^import\s[^;]*;?$/gm, "");
      return what === "*" ? inlined : `${inlined}\nexport ${what};`;
    },
  );
}

function readEntry(dir) {
  for (const f of ["src/index.tsx", "src/index.ts"]) {
    const p = join(dir, f);
    if (existsSync(p)) return readSource(p);
  }
  return "";
}

const packages = [];
for (const name of readdirSync(pkgsDir)) {
  const dir = join(pkgsDir, name);
  if (!statSync(dir).isDirectory()) continue;
  const pkgJsonPath = join(dir, "package.json");
  if (!existsSync(pkgJsonPath)) continue;
  const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
  if (name === "mcp") continue;

  const src = readEntry(dir);
  const exportsList = extractExports(src);
  // Type-only exports (`export type/interface`) can't be value-imported, so
  // they never count as components.
  const typeOnly = new Set([...src.matchAll(/export\s+(?:interface|type)\s+([A-Za-z0-9_]+)/g)].map((m) => m[1]));
  // Infrastructure packages (utils, hooks, tokens, the umbrella) have no
  // components of their own, even when they export a PascalCase helper (Slot).
  const components = NON_COMPONENT.has(name)
    ? []
    : exportsList.filter((n) => /^[A-Z]/.test(n) && !typeOnly.has(n) && !/(Props|Variant|Data|Context|Ref)$/.test(n));
  // Lead with the package's main component (Nudge, not NudgeAction): the export
  // named after the package, else the shortest name that prefixes the others.
  const pascal = name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("").replace(/^Md3/, "Md3");
  const main =
    components.find((c) => c.toLowerCase() === pascal.toLowerCase()) ??
    components.find((c) => c.toLowerCase() === pascal.toLowerCase().replace(/s$/, "")) ??
    [...components].sort((x, y) => x.length - y.length).find((c) => components.every((o) => o === c || o.startsWith(c)));
  if (main) components.splice(components.indexOf(main), 1), components.unshift(main);
  const readme = existsSync(join(dir, "README.md")) ? readFileSync(join(dir, "README.md"), "utf8") : "";
  // The composition nucleux.in's live preview shows, as copyable code: the
  // package's own imports point at its published name.
  const previewPath = join(dir, "src", "site-preview.tsx");
  const sitePreview = existsSync(previewPath)
    ? readFileSync(previewPath, "utf8").replace(/from "\.\/index"/g, `from "${pkg.name}"`).trim()
    : undefined;

  packages.push({
    name,
    package: pkg.name,
    kind: NON_COMPONENT.has(name) ? "infrastructure" : "component",
    description: ((NON_COMPONENT.has(name) ? "" : leadDescription(src)) || pkg.description || "").trim(),
    summary: pkg.description ?? "",
    keywords: pkg.keywords ?? [],
    exports: exportsList,
    components,
    // Utilities/hooks have no PascalCase components; show their value exports instead.
    import: (() => {
      const shown = components.length ? components : exportsList.filter((n) => !typeOnly.has(n));
      return shown.length ? `import { ${shown.slice(0, 4).join(", ")} } from "${pkg.name}";` : "";
    })(),
    installSingle: `pnpm add ${pkg.name}${NON_COMPONENT.has(name) ? "" : " @nucleux/tokens"}`,
    props: extractProps(src),
    readme: readme.trim(),
    peerDependencies: pkg.peerDependencies ?? {},
    ...(sitePreview ? { sitePreview } : {}),
  });
}

packages.sort((a, b) => a.name.localeCompare(b.name));

// Twins across the two families: <name> (shadcn) ↔ md3-<name> (Material 3).
// Agentic twins share one props API (the md3 package depends on its twin and
// re-exports its types); basic pairs like button/md3-button differ.
const byName = new Map(packages.map((p) => [p.name, p]));
const depsOf = (name) => {
  const pj = JSON.parse(readFileSync(join(pkgsDir, name, "package.json"), "utf8"));
  return pj.dependencies ?? {};
};
for (const p of packages) {
  if (p.kind !== "component") continue;
  const twinName = p.name.startsWith("md3-") ? p.name.slice(4) : `md3-${p.name}`;
  const twin = byName.get(twinName);
  if (!twin || twin.kind !== "component") continue;
  const md3 = p.name.startsWith("md3-") ? p.name : twinName;
  const shadcn = p.name.startsWith("md3-") ? twinName : p.name;
  p.twin = { name: twin.name, package: twin.package, component: twin.components[0], sharesApi: `@nucleux/${shadcn}` in depsOf(md3) };
}

// Example compositions live in the umbrella package.
const examples = [];
const exDir = join(pkgsDir, "react", "src", "examples");
if (existsSync(exDir)) {
  for (const f of readdirSync(exDir)) {
    if (!f.endsWith(".stories.tsx")) continue;
    const source = readFileSync(join(exDir, f), "utf8");
    const title = source.match(/title:\s*["'`]([^"'`]+)["'`]/);
    examples.push({
      name: basename(f, ".stories.tsx"),
      title: title ? title[1] : basename(f, ".stories.tsx"),
      source: source.trim(),
    });
  }
}
examples.sort((a, b) => a.name.localeCompare(b.name));

const umbrella = JSON.parse(readFileSync(join(pkgsDir, "react", "package.json"), "utf8"));

const catalog = {
  library: "@nucleux/react",
  version: umbrella.version,
  generatedFrom: "packages/* (do not edit — run scripts/gen-mcp-catalog.mjs)",
  setup: {
    installFull: "pnpm add @nucleux/react @nucleux/tokens",
    installSingle: "pnpm add @nucleux/<component> @nucleux/tokens",
    requirements: [
      "React and react-dom >= 18 (peer dependencies).",
      "Tailwind CSS v3 (3.4.x) with PostCSS. The preset is a Tailwind v3 JS config; Tailwind v4 is untested.",
    ],
    tailwindDev: "tailwindcss@3 postcss autoprefixer",
    tailwindConfigEsm: [
      'import nucleux from "@nucleux/tokens/preset";',
      "",
      "/** @type {import('tailwindcss').Config} */",
      "export default {",
      "  presets: [nucleux],",
      "  content: [",
      '    "./index.html",',
      '    "./src/**/*.{js,ts,jsx,tsx}",',
      "    // Required: Nucleux components ship Tailwind classes that your build must generate.",
      '    "./node_modules/@nucleux/*/dist/**/*.{js,cjs}",',
      "  ],",
      "};",
    ].join("\n"),
    tailwindConfigCjs: [
      "/** @type {import('tailwindcss').Config} */",
      "module.exports = {",
      '  presets: [require("@nucleux/tokens/preset").default],',
      '  content: ["./src/**/*.{js,ts,jsx,tsx}", "./node_modules/@nucleux/*/dist/**/*.{js,cjs}"],',
      "};",
    ].join("\n"),
    postcssConfig: "export default { plugins: { tailwindcss: {}, autoprefixer: {} } };",
    css: "@tailwind base;\n@tailwind components;\n@tailwind utilities;",
    theme: [
      'Import the theme once at your app root, before your own CSS: import "@nucleux/tokens/styles.css"; (CSS variables for light and .dark, plus the base reset).',
      "Your Tailwind build generates the component classes: the content globs must include ./node_modules/@nucleux/*/dist/**/*.{js,cjs}, or components render unstyled.",
      'Dark mode: add class="dark" to <html> (the preset sets darkMode: "class").',
      'Fonts (as on nucleux.in): the tokens set Inter on html/body (font-sans), JetBrains Mono for code (font-mono) and Roboto on every Material 3 component (font-md). Load them in your HTML head: <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Roboto:wght@400;500;700&display=swap" /> (or self-host them); without them the stacks fall back to system fonts.',
    ],
    note: "Every component is also re-exported from the @nucleux/react umbrella. Icons in the examples come from lucide-react (optional; any icon set works).",
  },
  counts: {
    components: packages.filter((p) => p.kind === "component").length,
    packages: packages.length,
    examples: examples.length,
  },
  packages,
  examples,
};

const outPath = join(pkgsDir, "mcp", "src", "catalog.json");
writeFileSync(outPath, JSON.stringify(catalog, null, 2) + "\n");
console.log(
  `catalog.json → ${catalog.counts.components} components, ${catalog.counts.packages} packages, ${catalog.counts.examples} examples`,
);
