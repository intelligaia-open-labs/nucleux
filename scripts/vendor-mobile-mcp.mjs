// Vendors the Nucleux Mobile MCP module into packages/mcp/src/mobile/ from a checkout of intelligaia/nucleux-mobile
// (a private repo, so CI cannot build it; the copy is committed). The mobile repo generates the catalog from its own
// sources (`npm run mcp:catalog` there) and owns the tool logic (mcp/src/mobile.ts); this script only copies them.
//
//   node scripts/vendor-mobile-mcp.mjs [path to nucleux-mobile]          copy (default: $NUCLEUX_MOBILE or ../nucleux-mobile)
//   node scripts/vendor-mobile-mcp.mjs [path to nucleux-mobile] --check  fail if the copy differs from that checkout
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const check = args.includes("--check");
const from = resolve(args.find((a) => !a.startsWith("--")) ?? process.env.NUCLEUX_MOBILE ?? join(root, "..", "nucleux-mobile"));
const src = join(from, "mcp", "src");
const dest = join(root, "packages", "mcp", "src", "mobile");

const FILES = ["mobile.ts", "validate.ts", "catalog-types.ts", "mobile-catalog.json"];
const HEADER = (f) => `// Vendored from intelligaia/nucleux-mobile mcp/src/${f} by scripts/vendor-mobile-mcp.mjs. Do not edit here.\n`;

if (!existsSync(join(src, "mobile-catalog.json"))) {
  console.error(`No Nucleux Mobile MCP sources at ${src}. Pass the path to a nucleux-mobile checkout (or set NUCLEUX_MOBILE).`);
  process.exit(1);
}
const stale = [];
mkdirSync(dest, { recursive: true });
for (const f of FILES) {
  const body = readFileSync(join(src, f), "utf8");
  const content = f.endsWith(".ts") ? HEADER(f) + body : body;
  const target = join(dest, f);
  if (check) {
    if (!existsSync(target) || readFileSync(target, "utf8") !== content) stale.push(f);
  } else writeFileSync(target, content);
}
if (check) {
  if (stale.length) {
    console.error(`packages/mcp/src/mobile is out of date with ${from}: ${stale.join(", ")}. Run node scripts/vendor-mobile-mcp.mjs ${from}`);
    process.exit(1);
  }
  console.log("packages/mcp/src/mobile matches the nucleux-mobile checkout.");
} else {
  const catalog = JSON.parse(readFileSync(join(dest, "mobile-catalog.json"), "utf8"));
  console.log(`Vendored Nucleux Mobile ${catalog.version} (${catalog.counts.components} components, ${catalog.counts.examples} examples) into packages/mcp/src/mobile/.`);
}
