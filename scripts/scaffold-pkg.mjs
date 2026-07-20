// Scaffolds a new @nucleux package's boilerplate (package.json, tsconfig,
// tsup.config, README). You then write src/index.tsx + the story.
//   node scripts/scaffold-pkg.mjs <kebab-name> "<description>" <lucide:0|1> [siblingPkg ...]
import fs from "node:fs";
import path from "node:path";

const ROOT = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1") + "/..";
const [name, description, lucide, ...siblings] = process.argv.slice(2);
if (!name || !description) {
  console.error('Usage: scaffold-pkg <name> "<description>" <0|1 lucide> [siblings...]');
  process.exit(1);
}
const dir = path.join(ROOT, "packages", name);
const pascal = name.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join("");
const w = (p, c) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, c);
};

const deps = { "@nucleux/utils": "workspace:*" };
for (const s of siblings) deps[s] = "workspace:*";
if (lucide === "1") deps["lucide-react"] = "^0.469.0";

const pkg = {
  name: `@nucleux/${name}`,
  version: "0.1.1",
  type: "module",
  sideEffects: false,
  description: `${description} — Nucleux agentic UI for React.`,
  keywords: ["nucleux", "react", "ui", "components", "agentic", "ai", "tailwind", name],
  main: "./dist/index.cjs",
  module: "./dist/index.js",
  types: "./dist/index.d.ts",
  exports: { ".": { types: "./dist/index.d.ts", import: "./dist/index.js", require: "./dist/index.cjs" } },
  files: ["dist", "README.md"],
  scripts: { build: "tsup" },
  peerDependencies: { react: ">=18", "react-dom": ">=18" },
  dependencies: deps,
  devDependencies: {
    tsup: "^8.3.5",
    typescript: "^5.7.2",
    "@types/react": "^18.3.18",
    react: "^18.3.1",
    ...(lucide === "1" ? {} : { "lucide-react": "^0.469.0" }),
  },
  publishConfig: { access: "public" },
  license: "MIT",
  repository: { type: "git", url: "git+https://github.com/intelligaia-open-labs/nucleux.git", directory: `packages/${name}` },
  homepage: "https://github.com/intelligaia-open-labs/nucleux#readme",
};
w(path.join(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
w(path.join(dir, "tsconfig.json"), JSON.stringify({ extends: "../../tsconfig.base.json", include: ["src"] }, null, 2) + "\n");
w(
  path.join(dir, "tsup.config.ts"),
  `import { defineConfig } from "tsup";\n\nexport default defineConfig({\n  entry: { index: "src/index.tsx" },\n  format: ["esm", "cjs"],\n  dts: true,\n  sourcemap: true,\n  clean: true,\n  treeshake: true,\n  external: [/^@nucleux\\//, "react", "react-dom", "react/jsx-runtime", "lucide-react", "tailwindcss"],\n});\n`,
);
w(
  path.join(dir, "README.md"),
  `# @nucleux/${name}\n\n${pkg.description}\n\nPart of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [\`@nucleux/react\`](https://www.npmjs.com/package/@nucleux/react).\n\n## Install\n\n\`\`\`bash\npnpm add @nucleux/${name} @nucleux/tokens\n\`\`\`\n\n\`react\` / \`react-dom\` are peer dependencies.\n\n## Usage\n\n\`\`\`tsx\nimport { ${pascal} } from "@nucleux/${name}";\n\`\`\`\n\nRequires the theme once in your app: \`import "@nucleux/tokens/styles.css";\`\nand the Tailwind preset from \`@nucleux/tokens/preset\`.\n\n## License\n\nMIT © Nucleux\n`,
);

// register alias
const a = path.join(ROOT, "scripts", "alias-map.json");
const m = JSON.parse(fs.readFileSync(a, "utf8"));
m[`@nucleux/${name}`] = `packages/${name}/src/index.tsx`;
fs.writeFileSync(a, JSON.stringify(m, null, 2));

console.log(`Scaffolded @nucleux/${name} (${pascal}).`);
