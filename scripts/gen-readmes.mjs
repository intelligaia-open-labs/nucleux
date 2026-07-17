// Adds a README.md + description/keywords to every @nucleux package and bumps
// all versions to a target version so docs land consistently on the next publish.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1") + "/..";
const PKGS = path.join(ROOT, "packages");
const VERSION = process.argv[2] || "0.1.1";

const pascal = (kebab) =>
  kebab
    .split("-")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join("");

// Curated one-liners; fall back to a generic description otherwise.
const DESCRIPTIONS = {
  button: "Button — variants, sizes, and icons.",
  "icon-button": "Icon-only button for toolbars and nav rails.",
  "link-button": "Link-styled action button.",
  badge: "Compact status pill / label.",
  chip: "Small rounded tag with optional dot and remove.",
  checkbox: "Accessible checkbox.",
  "radio-group": "Single-select radio group.",
  switch: "Accessible on/off toggle.",
  select: "Accessible native-backed select with a chevron.",
  separator: "Horizontal or vertical divider.",
  avatar: "Avatar with image, initials, or role icon.",
  card: "Composable card surface (CardContainer + parts).",
  alert: "Contextual message banner (info/success/warning/error).",
  tooltip: "Hover/focus tooltip.",
  "search-input": "Compact search field.",
  progress: "Determinate/indeterminate progress bar.",
  accordion: "Collapsible accordion panels.",
  "global-nav": "Top application navigation bar.",
  sidebar: "Collapsed icon navigation rail.",
  "nav-panel": "Expanded navigation panel with collapsible sections.",
  tabs: "Accessible tabs (horizontal/vertical).",
  menu: "Dropdown / context menu surface.",
  breadcrumb: "Breadcrumb navigation.",
  dialog: "Modal dialog with overlay.",
  popover: "Click popover with outside-click/Escape.",
  toast: "Toast notifications + ToastProvider/useToast.",
  table: "Semantic table primitives.",
  "rich-checkbox-group": "Selectable option cards with checkboxes.",
  "modular-consent": "Agent permission/consent panel.",
  message: "Chat message row with avatar + bubble.",
  thread: "Auto-scrolling chat transcript container.",
  "input-bar": "Chat composer with auto-resize.",
  "agent-composer": "Agent task composer with toolbar.",
  "streaming-text": "Streamed model output with a caret.",
  "typing-indicator": "Animated typing dots.",
  "tool-call": "Collapsible agent tool-call card.",
  reasoning: "Collapsible chain-of-thought panel.",
  "code-block": "Code surface with copy button.",
  suggestions: "Prompt suggestion chips.",
  "action-tile": "Large selectable action tile.",
  checklist: "Onboarding / progress checklist.",
  "getting-started-pill": "Floating onboarding progress launcher.",
  utils: "cn() class merger + shared types for Nucleux.",
  hooks: "React hooks for Nucleux (useAutoScroll, useCopyToClipboard).",
  tokens: "Design tokens (CSS variables) + Tailwind preset for Nucleux.",
  react: "Umbrella package — every Nucleux component, hook, and util.",
};

function exportedNames(dir) {
  for (const f of ["src/index.tsx", "src/index.ts"]) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) continue;
    const src = fs.readFileSync(p, "utf8");
    const names = new Set();
    for (const m of src.matchAll(/export\s+(?:const|function)\s+([A-Z]\w+)/g)) names.add(m[1]);
    for (const m of src.matchAll(/export\s*\*\s*from\s*["']@nucleux\/([^"']+)["']/g))
      names.add(pascal(m[1]));
    return [...names];
  }
  return [];
}

for (const name of fs.readdirSync(PKGS)) {
  const dir = path.join(PKGS, name);
  const pkgPath = path.join(dir, "package.json");
  if (!fs.existsSync(pkgPath)) continue;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  const desc = DESCRIPTIONS[name] || `${pascal(name)} — a Nucleux component.`;
  pkg.description = `${desc.replace(/\.$/, "")} — Nucleux agentic UI for React.`;
  pkg.keywords = [
    ...new Set(["nucleux", "react", "ui", "components", "agentic", "ai", "tailwind", name]),
  ];
  pkg.version = VERSION;
  pkg.homepage = pkg.homepage || "https://github.com/intelligaia-open-labs/nucleux#readme";
  if (!pkg.files) pkg.files = ["dist"];
  // README ships in the tarball
  if (!pkg.files.includes("README.md")) pkg.files.push("README.md");
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // README
  const names = exportedNames(dir);
  const importLine = names.length
    ? `import { ${names.slice(0, 6).join(", ")} } from "${pkg.name}";`
    : "";
  const isTokens = name === "tokens";
  const setup = isTokens
    ? `## Usage

\`\`\`ts
// Theme stylesheet (import once near your app root)
import "@nucleux/tokens/styles.css";

// Tailwind preset
import nucleux from "@nucleux/tokens/preset";
export default { presets: [nucleux], content: ["./src/**/*.{ts,tsx}"] };
\`\`\``
    : `## Usage

\`\`\`tsx
${importLine}
\`\`\`

Requires the theme once in your app: \`import "@nucleux/tokens/styles.css";\`
and the Tailwind preset from \`@nucleux/tokens/preset\`.`;

  const readme = `# ${pkg.name}

${pkg.description}

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [\`@nucleux/react\`](https://www.npmjs.com/package/@nucleux/react).

## Install

\`\`\`bash
pnpm add ${pkg.name}${isTokens ? "" : " @nucleux/tokens"}
\`\`\`

${isTokens ? "" : "`react` / `react-dom` are peer dependencies.\n\n"}${setup}

## License

MIT © Nucleux
`;
  fs.writeFileSync(path.join(dir, "README.md"), readme);
}

console.log(`Wrote README + metadata for all packages; bumped to ${VERSION}.`);
