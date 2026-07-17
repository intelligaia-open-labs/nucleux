// Prepend the RSC `"use client"` directive to each client package's built entry.
// esbuild strips leading module directives during bundling, so tsup's banner
// doesn't survive — we add it post-build. Only packages that depend on React
// (components, hooks, the umbrella) are client boundaries; @nucleux/utils and
// @nucleux/tokens stay directive-free so they can be imported from Server
// Components.
import fs from "node:fs";
import path from "node:path";

const PKGS = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1"), "..", "packages");
const directive = '"use client";\n';

let count = 0;
for (const name of fs.readdirSync(PKGS)) {
  const dir = path.join(PKGS, name);
  const pkgPath = path.join(dir, "package.json");
  if (!fs.existsSync(pkgPath)) continue;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const isClient = !!pkg.peerDependencies?.react;
  if (!isClient) continue;
  for (const file of ["dist/index.js", "dist/index.cjs"]) {
    const p = path.join(dir, file);
    if (!fs.existsSync(p)) continue;
    const src = fs.readFileSync(p, "utf8");
    if (src.startsWith(directive)) continue;
    fs.writeFileSync(p, directive + src);
    count++;
  }
}
console.log(`Added "use client" to ${count} built files.`);
