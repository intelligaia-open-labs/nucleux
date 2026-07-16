// Prepend the React Server Components `"use client"` directive to the built
// component entry. esbuild strips leading module directives during bundling, so
// tsup's `banner` option doesn't survive — we add it here instead. Only the
// `index` bundle (interactive components) is a client boundary; the Tailwind
// `preset` bundle is Node-side config and must stay directive-free.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const targets = ["index.js", "index.cjs"];
const directive = '"use client";\n';

for (const file of targets) {
  const path = join(dist, file);
  const source = await readFile(path, "utf8");
  if (source.startsWith(directive)) continue;
  await writeFile(path, directive + source, "utf8");
  console.log(`Added "use client" to dist/${file}`);
}
