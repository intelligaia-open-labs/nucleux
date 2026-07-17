// Generates the @nucleux monorepo under packages/ from the existing src/ tree.
// - one package per component (@nucleux/<kebab>)
// - infra packages: @nucleux/utils (cn + types), @nucleux/hooks, @nucleux/tokens
// - umbrella: @nucleux/react (re-exports everything)
// Dev/test/typecheck resolve @nucleux/* to source via aliases; `pnpm build`
// emits per-package dist for publishing.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1"), "..");
const SRC = path.join(ROOT, "src");
const PKGS = path.join(ROOT, "packages");
const VERSION = "0.1.0";
const LUCIDE = "^0.469.0";
const REPO = "https://github.com/intelligaia-open-labs/nucleux";

const rm = (p) => fs.rmSync(p, { recursive: true, force: true });
const mkdir = (p) => fs.mkdirSync(p, { recursive: true });
const write = (p, c) => {
  mkdir(path.dirname(p));
  fs.writeFileSync(p, c);
};
const read = (p) => fs.readFileSync(p, "utf8");
const kebabToPascalFile = (f) => f.replace(/\.tsx?$/, "");

rm(PKGS);
mkdir(PKGS);

const componentFiles = fs
  .readdirSync(path.join(SRC, "components"))
  .filter((f) => f.endsWith(".tsx") && !f.endsWith(".stories.tsx"));
const componentNames = new Set(componentFiles.map(kebabToPascalFile));

// Rewrite a component's import specifiers to package specifiers and collect deps.
function rewriteComponent(source) {
  const deps = new Set();
  let usesReact = /from ["']react["']/.test(source);
  const usesLucide = /from ["']lucide-react["']/.test(source);
  const out = source.replace(/from ["'](\.\.?\/[^"']+)["']/g, (_m, spec) => {
    if (spec === "../lib/utils" || spec === "../lib/types") {
      deps.add("@nucleux/utils");
      return 'from "@nucleux/utils"';
    }
    if (spec.startsWith("../hooks/")) {
      deps.add("@nucleux/hooks");
      return 'from "@nucleux/hooks"';
    }
    if (spec.startsWith("./")) {
      const name = spec.slice(2);
      if (componentNames.has(name)) {
        deps.add(`@nucleux/${name}`);
        return `from "@nucleux/${name}"`;
      }
    }
    return _m;
  });
  if (usesLucide) deps.add("lucide-react");
  return { out, deps, usesReact: usesReact || usesLucide };
}

// Rewrite a co-located story's imports.
function rewriteStory(source, self) {
  return source.replace(/from ["'](\.\/[^"']+)["']/g, (_m, spec) => {
    const name = spec.slice(2);
    if (name === self) return 'from "./index"';
    if (componentNames.has(name)) return `from "@nucleux/${name}"`;
    return _m;
  });
}

function pkgJson({ name, deps, react, directory, extra = {} }) {
  const dependencies = {};
  for (const d of [...deps].sort()) {
    dependencies[d] = d.startsWith("@nucleux/") ? "workspace:*" : LUCIDE;
  }
  return JSON.stringify(
    {
      name,
      version: VERSION,
      type: "module",
      sideEffects: false,
      main: "./dist/index.cjs",
      module: "./dist/index.js",
      types: "./dist/index.d.ts",
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          import: "./dist/index.js",
          require: "./dist/index.cjs",
        },
      },
      files: ["dist"],
      scripts: { build: "tsup" },
      ...(react ? { peerDependencies: { react: ">=18", "react-dom": ">=18" } } : {}),
      ...(Object.keys(dependencies).length ? { dependencies } : {}),
      devDependencies: {
        tsup: "^8.3.5",
        typescript: "^5.7.2",
        ...(react ? { "@types/react": "^18.3.18", react: "^18.3.1" } : {}),
      },
      publishConfig: { access: "public" },
      license: "MIT",
      repository: { type: "git", url: `git+${REPO}.git`, directory },
      homepage: `${REPO}#readme`,
      ...extra,
    },
    null,
    2,
  );
}

const tsconfig = JSON.stringify(
  { extends: "../../tsconfig.base.json", include: ["src"] },
  null,
  2,
);
const tsupConfig = read(path.join(ROOT, "scripts", "tsup.pkg.ts"));

const allComponentPkgs = [];

// ---- component packages ----
for (const file of componentFiles) {
  const name = kebabToPascalFile(file);
  const dir = path.join(PKGS, name);
  const { out, deps, usesReact } = rewriteComponent(read(path.join(SRC, "components", file)));
  write(path.join(dir, "src", "index.tsx"), out);

  const storyFile = path.join(SRC, "components", `${name}.stories.tsx`);
  if (fs.existsSync(storyFile)) {
    write(path.join(dir, "src", `${name}.stories.tsx`), rewriteStory(read(storyFile), name));
  }

  write(
    path.join(dir, "package.json"),
    pkgJson({ name: `@nucleux/${name}`, deps, react: usesReact, directory: `packages/${name}` }),
  );
  write(path.join(dir, "tsconfig.json"), tsconfig);
  write(path.join(dir, "tsup.config.ts"), tsupConfig);
  allComponentPkgs.push(`@nucleux/${name}`);
}

// ---- @nucleux/utils (cn + shared types) ----
{
  const dir = path.join(PKGS, "utils");
  write(path.join(dir, "src", "utils.ts"), read(path.join(SRC, "lib", "utils.ts")));
  write(path.join(dir, "src", "types.ts"), read(path.join(SRC, "lib", "types.ts")));
  write(path.join(dir, "src", "index.ts"), 'export * from "./utils";\nexport * from "./types";\n');
  write(
    path.join(dir, "package.json"),
    pkgJson({
      name: "@nucleux/utils",
      deps: new Set(),
      react: false,
      directory: "packages/utils",
      extra: { dependencies: { clsx: "^2.1.1", "tailwind-merge": "^2.6.0" } },
    }),
  );
  write(path.join(dir, "tsconfig.json"), tsconfig);
  write(path.join(dir, "tsup.config.ts"), tsupConfig.replace("index.tsx", "index.ts"));
}

// ---- @nucleux/hooks ----
{
  const dir = path.join(PKGS, "hooks");
  const files = fs.readdirSync(path.join(SRC, "hooks")).filter((f) => f.endsWith(".ts"));
  let index = "";
  for (const f of files) {
    write(path.join(dir, "src", f), read(path.join(SRC, "hooks", f)));
    index += `export * from "./${f.replace(/\.ts$/, "")}";\n`;
  }
  write(path.join(dir, "src", "index.ts"), index);
  write(
    path.join(dir, "package.json"),
    pkgJson({ name: "@nucleux/hooks", deps: new Set(), react: true, directory: "packages/hooks" }),
  );
  write(path.join(dir, "tsconfig.json"), tsconfig);
  write(path.join(dir, "tsup.config.ts"), tsupConfig.replace("index.tsx", "index.ts"));
}

// ---- @nucleux/tokens (preset + css) ----
{
  const dir = path.join(PKGS, "tokens");
  write(path.join(dir, "src", "preset.ts"), read(path.join(SRC, "preset.ts")));
  write(path.join(dir, "src", "globals.css"), read(path.join(SRC, "styles", "globals.css")));
  const pj = {
    name: "@nucleux/tokens",
    version: VERSION,
    type: "module",
    sideEffects: ["**/*.css"],
    exports: {
      "./preset": { types: "./dist/preset.d.ts", import: "./dist/preset.js", require: "./dist/preset.cjs" },
      "./styles.css": "./dist/styles.css",
    },
    files: ["dist"],
    scripts: {
      build: "tsup src/preset.ts --format esm,cjs --dts --clean && tailwindcss -i ./src/globals.css -o ./dist/styles.css --minify",
    },
    publishConfig: { access: "public" },
    license: "MIT",
    repository: { type: "git", url: `git+${REPO}.git`, directory: "packages/tokens" },
    devDependencies: { tailwindcss: "^3.4.17", tsup: "^8.3.5", typescript: "^5.7.2" },
  };
  write(path.join(dir, "package.json"), JSON.stringify(pj, null, 2));
  write(path.join(dir, "tsconfig.json"), tsconfig);
  write(
    path.join(dir, "tailwind.config.ts"),
    'import type { Config } from "tailwindcss";\nimport preset from "./src/preset";\nexport default { presets: [preset], content: ["./src/**/*.{ts,css}"] } satisfies Config;\n',
  );
}

// ---- @nucleux/react (umbrella) ----
{
  const dir = path.join(PKGS, "react");
  const reExports = [
    ...allComponentPkgs.sort(),
    "@nucleux/hooks",
    "@nucleux/utils",
  ]
    .map((p) => `export * from "${p}";`)
    .join("\n");
  write(path.join(dir, "src", "index.ts"), reExports + "\n");

  // move examples into the umbrella package (they import ../index)
  const exDir = path.join(SRC, "examples");
  if (fs.existsSync(exDir)) {
    for (const f of fs.readdirSync(exDir)) {
      write(path.join(dir, "src", "examples", f), read(path.join(exDir, f)));
    }
  }

  const deps = new Set([...allComponentPkgs, "@nucleux/hooks", "@nucleux/utils"]);
  write(
    path.join(dir, "package.json"),
    pkgJson({ name: "@nucleux/react", deps, react: true, directory: "packages/react" }),
  );
  write(path.join(dir, "tsconfig.json"), tsconfig);
  write(path.join(dir, "tsup.config.ts"), tsupConfig.replace("index.tsx", "index.ts"));
}

// ---- tsconfig paths + storybook/vitest aliases data ----
const aliasMap = {};
for (const p of allComponentPkgs) aliasMap[p] = `packages/${p.replace("@nucleux/", "")}/src/index.tsx`;
aliasMap["@nucleux/utils"] = "packages/utils/src/index.ts";
aliasMap["@nucleux/hooks"] = "packages/hooks/src/index.ts";
aliasMap["@nucleux/react"] = "packages/react/src/index.ts";
write(path.join(ROOT, "scripts", "alias-map.json"), JSON.stringify(aliasMap, null, 2));

console.log(`Generated ${allComponentPkgs.length} component packages + utils/hooks/tokens/react.`);
