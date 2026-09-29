// Publish harness — validate, build, and publish a single @nucleux package.
// Drives the "one by one" release flow for both the shadcn and Material UI 3
// surfaces (any package: a component, the md3-theme, tokens, the umbrella…).
//
//   node scripts/publish-component.mjs <name> [version] [--full] [--dry]
//
//   <name>     component or package name: "badge", "@nucleux/badge", "md3-theme"
//   [version]  optional semver to set before publishing (e.g. 0.5.0)
//   --full     run the whole gate first (pnpm validate) instead of a scoped build
//   --dry      pack instead of publish (npm --dry-run; nothing leaves your machine)
//
// Default gate: `pnpm typecheck` (library-wide) + a scoped build of the target
// and its workspace deps. Use --full before a real release if in doubt.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const positional = args.filter((a) => !a.startsWith("--"));
const [name, version] = positional;

if (!name) {
  console.error("Usage: node scripts/publish-component.mjs <name> [version] [--full] [--dry]");
  process.exit(1);
}

/** Resolve a short/scoped name to its package dir + package.json. */
function findPackage(query) {
  const q = query.replace(/^@nucleux\//, "").toLowerCase();
  const pkgsDir = join(root, "packages");
  for (const dir of readdirSync(pkgsDir)) {
    const pjPath = join(pkgsDir, dir, "package.json");
    if (!existsSync(pjPath)) continue;
    const pj = JSON.parse(readFileSync(pjPath, "utf8"));
    if (dir.toLowerCase() === q || pj.name.toLowerCase() === query.toLowerCase()) {
      return { dir: join(pkgsDir, dir), pjPath, pj };
    }
  }
  return null;
}

const found = findPackage(name);
if (!found) {
  console.error(`No @nucleux package matches "${name}". Check packages/ for the exact name.`);
  process.exit(1);
}
const { pjPath, pj } = found;
const scoped = pj.name;

const run = (cmd) => {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd: root, stdio: "inherit" });
};

// 1) Version bump (optional)
if (version) {
  if (!/^\d+\.\d+\.\d+([-.].+)?$/.test(version)) {
    console.error(`"${version}" is not a valid semver.`);
    process.exit(1);
  }
  pj.version = version;
  writeFileSync(pjPath, JSON.stringify(pj, null, 2) + "\n");
  console.log(`Set ${scoped} version -> ${version}`);
}

// 2) Gate
if (flags.has("--full")) {
  run("pnpm validate");
} else {
  run("pnpm typecheck");
  run(`pnpm --filter ${scoped}... run build`);
}

// 3) Publish (or dry-run pack)
const publishFlags = "--no-git-checks --access public" + (flags.has("--dry") ? " --dry-run" : "");
run(`pnpm --filter ${scoped} publish ${publishFlags}`);

console.log(`\n✅ ${flags.has("--dry") ? "Dry-run complete" : "Published"}: ${scoped}@${pj.version}`);
