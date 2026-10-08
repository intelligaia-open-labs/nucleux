#!/usr/bin/env node
/**
 * check-barrel.mjs — fail if any component package is not re-exported
 * from the @nucleux/react umbrella barrel.
 *
 * Guards against the audit finding in
 * https://github.com/intelligaia-open-labs/nucleux/issues/13:
 * "three components had per-directory entry points but were never
 *  re-exported; teams believed they were public."
 *
 * Exit 0 = barrel is complete; exit 1 = drift detected (CI failure).
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = join(root, "packages");
const barrelPath = join(root, "packages", "react", "src", "index.ts");

/** Infra packages that are intentionally NOT re-exported by the umbrella. */
const INTENTIONALLY_EXCLUDED = new Set([
  "react",  // the umbrella itself
  "mcp",    // MCP server, not a React component
  "tokens", // CSS/tokens, consumed via @nucleux/tokens/preset not the barrel
]);

if (!existsSync(barrelPath)) {
  console.error("check-barrel: cannot find packages/react/src/index.ts");
  process.exit(1);
}

const allDirs = readdirSync(packagesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("."))
  .map((d) => d.name);

const componentDirs = allDirs.filter((name) => {
  if (INTENTIONALLY_EXCLUDED.has(name)) return false;
  // A component package must have a src entry point.
  return existsSync(join(packagesDir, name, "src", "index.tsx"))
      || existsSync(join(packagesDir, name, "src", "index.ts"));
});

const barrel = readFileSync(barrelPath, "utf8");
const barrelRe = new RegExp(
  componentDirs
    .map((name) => `@nucleux/${name.replace(/[-]/g, "\\-")}`)
    .join("|"),
);

const missing = componentDirs.filter(
  (name) => !barrel.includes(`@nucleux/${name}"`) && !barrel.includes(`@nucleux/${name}'`),
);

if (missing.length > 0) {
  console.error(
    `check-barrel: ${missing.length} component package(s) missing from @nucleux/react barrel:\n` +
      missing.map((m) => `  - @nucleux/${m}`).join("\n") +
      `\nAdd an \`export * from "@nucleux/${missing[0]}";\` line to packages/react/src/index.ts.`,
  );
  process.exit(1);
}

console.log(
  `check-barrel: ok — all ${componentDirs.length} component packages re-exported by @nucleux/react.`,
);
