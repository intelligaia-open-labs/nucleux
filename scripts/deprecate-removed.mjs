#!/usr/bin/env node
// Marks the 0.5.x versions of packages that 0.6.0 renamed or removed as
// deprecated on npm, each with a message naming its replacement. The list is
// scripts/deprecations.json (checked by src/test/docs.test.ts).
//
//   node scripts/deprecate-removed.mjs          # dry run: print the commands
//   node scripts/deprecate-removed.mjs --run    # run them (needs npm login with publish rights)
//
// Deprecation is reversible: `npm deprecate <pkg>@"<range>" ""` clears it.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { range, packages } = JSON.parse(readFileSync(join(root, "scripts/deprecations.json"), "utf8"));
const run = process.argv.includes("--run");

for (const { name, message } of packages) {
  const args = ["deprecate", `${name}@${range}`, message];
  if (!run) {
    console.log(`npm ${args.map((a) => JSON.stringify(a)).join(" ")}`);
    continue;
  }
  execFileSync("npm", args, { stdio: "inherit" });
}
console.log(`${run ? "Deprecated" : "Would deprecate"} ${packages.length} packages (${range}).`);
