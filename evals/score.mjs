#!/usr/bin/env node
// Scores one generated app: `node evals/score.mjs <app-dir> [session-transcript.jsonl]`.
// Prints JSON. Metrics are mechanical (counts, build exit code), not judgments:
//   build            `npm run build` exit code (tsc + vite build)
//   nucleux          distinct @nucleux exports imported, and any not in the catalog
//   handRolled       raw <button>/<input>/<select>/<textarea>/<table>/<dialog> in src
//                    (Nucleux ships all of these; some raw use can still be legitimate)
//   offTokenColors   hex colors and Tailwind palette colors (bg-blue-500…) instead of
//                    semantic tokens
//   responsive       sm:/md:/lg:/xl: class prefixes
//   mcp              nucleux MCP tool calls by name, from the session transcript
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const [appDir, transcript] = process.argv.slice(2);
if (!appDir) {
  console.error("usage: node evals/score.mjs <app-dir> [transcript.jsonl]");
  process.exit(1);
}
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(root, "packages/mcp/src/catalog.json"), "utf8"));
const known = new Set(catalog.packages.flatMap((p) => p.exports));

function files(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|css)$/.test(f) ? [p] : [];
  });
}
const src = files(join(appDir, "src"));
const text = src.map((f) => readFileSync(f, "utf8")).join("\n");
const tsx = src.filter((f) => /\.tsx?$/.test(f)).map((f) => readFileSync(f, "utf8")).join("\n");

const imported = new Set();
for (const m of tsx.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["']@nucleux\/[^"']+["']/g)) {
  for (const raw of m[1].split(",")) {
    const n = raw.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
    if (n) imported.add(n);
  }
}
const count = (re) => (tsx.match(re) ?? []).length;

const build = spawnSync("npm", ["run", "build"], { cwd: appDir, encoding: "utf8" });

const mcp = {};
if (transcript && existsSync(transcript)) {
  for (const line of readFileSync(transcript, "utf8").split("\n")) {
    for (const m of line.matchAll(/"name":"mcp__nucleux__([a-z_]+)"/g)) mcp[m[1]] = (mcp[m[1]] ?? 0) + 1;
  }
}

const result = {
  app: appDir,
  files: src.length,
  lines: text.split("\n").length,
  build: { ok: build.status === 0, tail: (build.stdout + build.stderr).trim().split("\n").slice(-4) },
  nucleux: {
    distinctImports: imported.size,
    unknownImports: [...imported].filter((n) => !known.has(n)),
    imports: [...imported].sort(),
  },
  handRolled: {
    button: count(/<button[\s>]/g),
    input: count(/<input[\s>]/g),
    select: count(/<select[\s>]/g),
    textarea: count(/<textarea[\s>]/g),
    table: count(/<table[\s>]/g),
    dialog: count(/<dialog[\s>]|role="dialog"/g),
  },
  offTokenColors: {
    hex: (text.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) ?? []).length,
    palette: count(/\b(?:bg|text|border|ring|fill|stroke|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g),
  },
  responsive: count(/\b(?:sm|md|lg|xl):[a-z-[]/g),
  mcp,
};
console.log(JSON.stringify(result, null, 2));
