// Generates packages/mcp/src/knowledge.json from knowledge/ — the curated design
// patterns (pattern.json + a typechecked example.tsx each) and the shared agent
// workflow. Every pattern is checked against the generated component catalog:
// an unknown component, related pattern or @nucleux import fails the build, so
// the MCP server can never serve a pattern that references something Nucleux
// does not export. Run after gen-mcp-catalog.mjs (the mcp prebuild does both).
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const knowledgeDir = join(root, "knowledge");
const patternsDir = join(knowledgeDir, "patterns");
const catalog = JSON.parse(readFileSync(join(root, "packages", "mcp", "src", "catalog.json"), "utf8"));

const exportsOf = new Map(); // export name -> package
for (const p of catalog.packages) for (const e of p.exports) exportsOf.set(e, p.package);

const STRING = ["id", "name", "status", "since", "summary", "description", "example"];
const STRING_LISTS = [
  "useCases", "whenToUse", "whenNotToUse", "keywords", "layout", "responsive",
  "tokens", "accessibility", "antiPatterns", "related",
];
const STATUSES = new Set(["curated", "proposed"]);

const errors = [];
const fail = (id, msg) => errors.push(`${id}: ${msg}`);

function walk(nodes, id, visit) {
  for (const n of nodes ?? []) {
    visit(n);
    walk(n.children, id, visit);
  }
}

/** Named imports from "@nucleux/*" in a TSX source (type-only specifiers included). */
function nucleuxImports(src) {
  const out = [];
  for (const m of src.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["'](@nucleux\/[^"']+)["']/g)) {
    for (const raw of m[1].split(",")) {
      const name = raw.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
      if (name) out.push({ name, from: m[2] });
    }
  }
  return out;
}

const patterns = [];
for (const dir of readdirSync(patternsDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const file = join(patternsDir, dir.name, "pattern.json");
  if (!existsSync(file)) continue;
  const p = JSON.parse(readFileSync(file, "utf8"));
  const id = p.id ?? dir.name;

  if (p.id !== dir.name) fail(id, `id must match its directory name "${dir.name}"`);
  for (const k of STRING) if (typeof p[k] !== "string" || !p[k].trim()) fail(id, `"${k}" must be a non-empty string`);
  for (const k of STRING_LISTS) {
    if (!Array.isArray(p[k]) || p[k].some((v) => typeof v !== "string")) fail(id, `"${k}" must be a string array`);
  }
  if (!STATUSES.has(p.status)) fail(id, `status must be one of ${[...STATUSES].join(", ")}`);
  if (!Array.isArray(p.components?.required) || !Array.isArray(p.components?.optional)) {
    fail(id, `components.required and components.optional must be arrays`);
  }

  // Every component the pattern names must be a real export.
  const named = new Set([...(p.components?.required ?? []), ...(p.components?.optional ?? [])]);
  walk(p.composition, id, (n) => {
    if (n.component) {
      named.add(n.component);
      if (!p.components.required.includes(n.component) && !p.components.optional.includes(n.component)) {
        fail(id, `composition uses ${n.component}, which is not listed in components.required/optional`);
      }
    } else if (!n.element) fail(id, `composition node needs "component" or "element"`);
  });
  for (const c of named) if (!exportsOf.has(c)) fail(id, `unknown component "${c}" (not exported by any @nucleux package)`);

  // The example must exist, import only real exports, and use every required component.
  const exPath = join(patternsDir, dir.name, p.example ?? "");
  let example = "";
  if (!p.example || !existsSync(exPath)) fail(id, `example file "${p.example}" not found`);
  else {
    example = readFileSync(exPath, "utf8").trim();
    const imports = nucleuxImports(example);
    for (const { name, from } of imports) {
      if (!exportsOf.has(name)) fail(id, `example imports unknown "${name}" from ${from}`);
    }
    const imported = new Set(imports.map((i) => i.name));
    for (const c of p.components?.required ?? []) {
      if (!imported.has(c)) fail(id, `required component ${c} is not used by the example`);
    }
  }

  // Resolve each named component to its package so consumers know what to install.
  const packages = [...new Set([...named].map((c) => exportsOf.get(c)).filter(Boolean))].sort();
  patterns.push({ ...p, packages, exampleSource: example });
}

const ids = new Set(patterns.map((p) => p.id));
for (const p of patterns) {
  for (const r of p.related) if (!ids.has(r)) fail(p.id, `related pattern "${r}" does not exist`);
}

if (errors.length) {
  console.error(`knowledge validation failed (${errors.length}):\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}

patterns.sort((a, b) => a.id.localeCompare(b.id));

const knowledge = {
  version: catalog.version,
  generatedFrom: "knowledge/ (do not edit — run scripts/gen-mcp-knowledge.mjs)",
  workflow: readFileSync(join(knowledgeDir, "workflow.md"), "utf8").trim(),
  patterns,
};

writeFileSync(join(root, "packages", "mcp", "src", "knowledge.json"), JSON.stringify(knowledge, null, 2) + "\n");
console.log(`knowledge.json → ${patterns.length} patterns (${patterns.filter((p) => p.status === "curated").length} curated)`);
