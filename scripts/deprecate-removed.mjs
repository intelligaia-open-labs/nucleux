#!/usr/bin/env node
// Marks the 0.5.x versions of packages that 0.6.0 renamed or removed as
// deprecated on npm, each with a message naming its replacement. The list is
// scripts/deprecations.json (checked by src/test/docs.test.ts).
//
//   node scripts/deprecate-removed.mjs          # dry run: print the commands
//   node scripts/deprecate-removed.mjs --run    # run them (needs npm login with publish rights)
//   node scripts/deprecate-removed.mjs --run --otp=123456   # when the account requires 2FA
//
// Packages that already carry their message are skipped, so a run that stops
// (e.g. an expired one-time code) can simply be repeated with a fresh code.
//
// Deprecation is reversible: `npm deprecate <pkg>@"<range>" ""` clears it.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { range, packages } = JSON.parse(readFileSync(join(root, "scripts/deprecations.json"), "utf8"));
const run = process.argv.includes("--run");
const otp = process.argv.find((a) => a.startsWith("--otp="));

const currentMessage = (name) => {
  try {
    return JSON.parse(execFileSync("npm", ["view", `${name}@0.5.0`, "deprecated", "--json"], { encoding: "utf8" }) || '""');
  } catch {
    return "";
  }
};

let done = 0;
let skipped = 0;
for (const { name, message } of packages) {
  const args = ["deprecate", `${name}@${range}`, message, ...(otp ? [otp] : [])];
  if (!run) {
    console.log(`npm ${args.map((a) => JSON.stringify(a)).join(" ")}`);
    continue;
  }
  if (currentMessage(name) === message) {
    skipped++;
    continue;
  }
  execFileSync("npm", args, { stdio: "inherit" });
  done++;
  console.log(`✓ ${name}`);
}
console.log(
  run
    ? `Deprecated ${done}, already done ${skipped}, of ${packages.length} packages (${range}).`
    : `Would deprecate ${packages.length} packages (${range}).`,
);
