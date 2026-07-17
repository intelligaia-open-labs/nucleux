// Ensure lucide-react is resolvable in every package (used by co-located
// stories even when the component itself doesn't import it). Adds it as a
// devDependency wherever it isn't already a runtime dependency.
import fs from "node:fs";
import path from "node:path";

const PKGS = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1"), "..", "packages");
const LUCIDE = "^0.469.0";

for (const name of fs.readdirSync(PKGS)) {
  const pkgPath = path.join(PKGS, name, "package.json");
  if (!fs.existsSync(pkgPath)) continue;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (pkg.dependencies?.["lucide-react"]) continue;
  if (name === "utils" || name === "tokens") continue;
  pkg.devDependencies = { ...pkg.devDependencies, "lucide-react": LUCIDE };
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}
console.log("Patched lucide-react devDependency across packages.");
