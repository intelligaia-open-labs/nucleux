#!/usr/bin/env node
// Regenerates the "Component catalog" section of llms.txt from
// packages/mcp/src/catalog.json, so the list agents read always matches what
// ships. Everything above the section marker is hand-written and kept as is.
//
//   node scripts/gen-llms.mjs          # rewrite llms.txt
//   node scripts/gen-llms.mjs --check  # exit 1 if llms.txt is out of date
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const llmsPath = join(root, "llms.txt");
const catalog = JSON.parse(readFileSync(join(root, "packages/mcp/src/catalog.json"), "utf8"));

const MARKER = "## Component catalog";
const current = readFileSync(llmsPath, "utf8");
const at = current.indexOf(MARKER);
if (at < 0) throw new Error(`llms.txt has no "${MARKER}" section`);

const MAX_EXPORTS = 8;
const entry = (p) => {
  const shown = p.exports.slice(0, MAX_EXPORTS).join(", ") + (p.exports.length > MAX_EXPORTS ? ", …" : "");
  return `- **${p.name}** (\`${p.package}\`) — ${p.summary.replace(/ — Nucleux agentic UI for React\.$/, ".")}\n  Exports: \`${shown}\``;
};
const components = catalog.packages.filter((p) => p.kind === "component");
const shadcn = components.filter((p) => !p.name.startsWith("md3-"));
const md3 = components.filter((p) => p.name.startsWith("md3-"));
const infra = catalog.packages.filter((p) => p.kind !== "component");

const section = [
  `${MARKER} (${catalog.packages.length} packages)`,
  "",
  "Generated from `packages/mcp/src/catalog.json` by `scripts/gen-llms.mjs` — do not edit by hand.",
  "",
  `### shadcn family (${shadcn.length})`,
  "",
  ...shadcn.map(entry),
  "",
  `### Material 3 family (${md3.length})`,
  "",
  ...md3.map(entry),
  "",
  `### Infrastructure (${infra.length})`,
  "",
  ...infra.map(entry),
  "",
].join("\n");

const next = current.slice(0, at) + section;
if (process.argv.includes("--check")) {
  if (next !== current) {
    console.error("llms.txt is out of date: run node scripts/gen-llms.mjs");
    process.exit(1);
  }
  console.log("llms.txt is up to date");
} else {
  writeFileSync(llmsPath, next);
  console.log(`llms.txt → ${components.length} components (${shadcn.length} shadcn, ${md3.length} md3), ${infra.length} infrastructure`);
}
