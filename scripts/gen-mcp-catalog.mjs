// Generates packages/mcp/src/catalog.json — a machine-readable index of every
// @nucleux package (description, exports, Props source, import + install) plus
// the example compositions. Consumed by the @nucleux/mcp server so AI coding
// agents can discover and correctly use the library. Run on `pnpm build` (the
// mcp package's build script) and committed so typecheck works without it.
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgsDir = join(root, "packages");

/** Packages that are infrastructure, not components. */
const NON_COMPONENT = new Set(["mcp", "react", "tokens", "utils", "hooks"]);

/** Match the matching `}` for the `{` at `open` in `src`. */
function matchBrace(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) return i;
  }
  return src.length;
}

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

/** Full source of every `export interface *Props { ... }` (with leading JSDoc). */
function extractProps(src) {
  const out = [];
  for (const m of src.matchAll(/export\s+interface\s+([A-Za-z0-9_]+Props)\b/g)) {
    const nameIdx = m.index;
    const open = src.indexOf("{", nameIdx);
    if (open === -1) continue;
    const close = matchBrace(src, open);
    // Pull a leading JSDoc block if one sits directly above the interface.
    const before = src.slice(0, nameIdx);
    const jsdoc = before.match(/\/\*\*[\s\S]*?\*\/\s*$/);
    const body = src.slice(nameIdx, close + 1);
    out.push({ name: m[1], source: ((jsdoc ? jsdoc[0].trimEnd() + "\n" : "") + body).trim() });
  }
  return out;
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

function readEntry(dir) {
  for (const f of ["src/index.tsx", "src/index.ts"]) {
    const p = join(dir, f);
    if (existsSync(p)) return readFileSync(p, "utf8");
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
  const components = exportsList.filter(
    (n) => /^[A-Z]/.test(n) && !/(Props|Variant|Data|Context|Ref)$/.test(n),
  );
  const readme = existsSync(join(dir, "README.md")) ? readFileSync(join(dir, "README.md"), "utf8") : "";

  packages.push({
    name,
    package: pkg.name,
    kind: NON_COMPONENT.has(name) ? "infrastructure" : "component",
    description: (leadDescription(src) || pkg.description || "").trim(),
    summary: pkg.description ?? "",
    keywords: pkg.keywords ?? [],
    exports: exportsList,
    components,
    import: components.length ? `import { ${components.slice(0, 4).join(", ")} } from "${pkg.name}";` : "",
    installSingle: `pnpm add ${pkg.name}${NON_COMPONENT.has(name) ? "" : " @nucleux/tokens"}`,
    props: extractProps(src),
    readme: readme.trim(),
    peerDependencies: pkg.peerDependencies ?? {},
  });
}

packages.sort((a, b) => a.name.localeCompare(b.name));

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
    theme: [
      'Import the theme once at your app root: import "@nucleux/tokens/styles.css";',
      "Add the Tailwind preset: presets: [require('@nucleux/tokens/preset')] in tailwind.config.",
      "react and react-dom are peer dependencies (>=18).",
    ],
    note: "Every component is also re-exported from the @nucleux/react umbrella.",
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
