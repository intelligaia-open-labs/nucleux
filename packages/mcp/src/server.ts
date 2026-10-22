import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import catalog from "./catalog.json";
import {
  FALLBACK_HINT,
  renderFallback,
  renderFallbackBrief,
  resolveShadcn,
  searchShadcn,
  SHADCN_DOCS,
} from "./shadcn.js";
import htmlSnippets from "./html-snippets.json";
import { validateDesign, type PlannedComponent } from "./validate.js";
import {
  patterns,
  patternsUsing,
  renderPattern,
  renderPatternBrief,
  resolvePattern,
  searchPatterns,
  workflow,
} from "./patterns.js";

const snippets = htmlSnippets.snippets as Record<
  string,
  { name: string; html: string; idCount?: number; text?: string[] }
>;

// Fresh, collision-free id per request so a snippet can be reused safely.
let idSeq = 0;
const freshId = () => `nx-${(++idSeq).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/**
 * Replace the `__NX_ID_n__` placeholders in a snippet. "concrete" swaps in fresh
 * unique ids (paste-and-render); "template" swaps in readable `{{id}}` slots the
 * caller fills per instance (safe reuse of one snippet for many elements).
 */
function instantiateIds(html: string, mode: "concrete" | "template"): string {
  const placeholders = [...new Set(html.match(/__NX_ID_\d+__/g) ?? [])];
  let out = html;
  for (const ph of placeholders) {
    const n = Number(ph.match(/\d+/)?.[0] ?? 0);
    const value = mode === "template" ? `{{id${n === 0 ? "" : n}}}` : freshId();
    out = out.split(ph).join(value);
  }
  return out;
}
type Pkg = (typeof catalog.packages)[number];
type Example = (typeof catalog.examples)[number];

const byName = new Map<string, Pkg>();
for (const p of catalog.packages) {
  byName.set(p.name.toLowerCase(), p);
  byName.set(p.package.toLowerCase(), p);
  for (const c of p.components) byName.set(c.toLowerCase(), p);
}
// Then every other export (cn, hooks, sub-parts, types), without overriding the names above.
for (const p of catalog.packages) {
  for (const e of p.exports) if (!byName.has(e.toLowerCase())) byName.set(e.toLowerCase(), p);
}

/** Resolve a component/package name (fuzzy) to its catalog entry. */
function resolve(query: string): Pkg | undefined {
  const q = query.trim().toLowerCase();
  return (
    byName.get(q) ??
    byName.get(q.replace(/^@nucleux\//, "")) ??
    catalog.packages.find(
      (p) => p.name.toLowerCase() === q || p.components.some((c) => c.toLowerCase() === q),
    )
  );
}

function text(s: string) {
  return { content: [{ type: "text" as const, text: s }] };
}

type PropMember = {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  values?: string[];
  default?: string;
  deprecated?: string | boolean;
};

function renderMember(m: PropMember): string {
  const type = m.values ? m.values.map((v) => JSON.stringify(v)).join(" | ") : m.type;
  const parts = [`- \`${m.name}${m.required ? "" : "?"}\`: \`${type}\``];
  if (m.required) parts.push("**required**");
  if (m.default !== undefined) parts.push(`default \`${m.default}\``);
  if (m.deprecated)
    parts.push(`**deprecated**${typeof m.deprecated === "string" ? ` (${m.deprecated})` : ""}`);
  return parts.join(" — ") + (m.description ? ` — ${m.description}` : "");
}

function renderComponent(p: Pkg): string {
  const lines = [
    `# ${p.components[0] ?? p.name}  (${p.package})`,
    "",
    p.description || p.summary,
    "",
    `**Kind:** ${p.kind}`,
    `**Install:** \`${p.installSingle}\`  (or the full kit: \`${catalog.setup.installFull}\`)`,
    `**Import:** \`${p.import || `import { /* … */ } from "${p.package}";`}\`  (every export is also available from \`@nucleux/react\`)`,
    "",
    `**Exports:** ${p.exports.join(", ") || "—"}`,
  ];
  if (p.props.length) {
    lines.push(
      "",
      "## Props",
      "",
      "Only these props (plus those of the extended DOM type) exist. Values listed are the complete set.",
    );
    for (const pr of p.props) {
      const ext =
        "extends" in pr && pr.extends?.length ? `  (extends \`${pr.extends.join("`, `")}\`)` : "";
      lines.push("", `### ${pr.name}${ext}`);
      const members = (pr.members ?? []) as PropMember[];
      lines.push(...(members.length ? members.map(renderMember) : ["- (no own props)"]));
    }
  }
  const twin = (p as Pkg & { twin?: { component?: string; package: string; sharesApi: boolean } }).twin;
  if (twin)
    lines.push(
      "",
      `**${p.name.startsWith("md3-") ? "shadcn" : "Material 3"} twin:** \`${twin.component}\` (${twin.package})${
        twin.sharesApi ? " — same props; switch families by changing the import" : " — different props; read its contract"
      }`,
    );
  const used = patternsUsing(p.exports);
  if (used.length)
    lines.push("", `**Used in patterns:** ${used.map((x) => x.id).join(", ")} (see get_pattern)`);
  return lines.join("\n").trim();
}

const INSTRUCTIONS = `Nucleux (@nucleux/react) is intelligaia's React component library for AI products, in two families: shadcn-style components and their Material 3 counterparts (Md3*). It covers the basics (buttons, inputs, menus, dialogs, tables, navigation, empty states…) and agentic components (Disclosure, Consent, Caveat, OpenInput, SuggestedPrompts, ModelSelection, KnowledgeBase, Connectors, VoiceInput, StructuredInput, Message, MessageScroller…), published as ${catalog.counts.components} component packages behind one umbrella.

First ask the user which family they want — Material 3 (Md3*) or shadcn — unless they already said or the project already uses or records one; record the answer in the project's AGENTS.md or CLAUDE.md (\"Nucleux family: Material 3\") and use only that family.

Design-first workflow: for any page or app, call search_patterns first, then get_pattern for the curated composition (structure, responsive and accessibility rules, typechecked example). Then get_component for the exact contract of each component you use, and get_setup for install and Tailwind configuration. Use search_components for needs no pattern covers, and get_example (e.g. "agent-chat") for the larger reference screens. The build_with_nucleux prompt holds the full step-by-step workflow.

Use these tools instead of guessing props: the catalog is generated from the package sources, so exports, prop names, types, variant values and defaults are exact. If a component, prop or pattern is not in the catalog it does not exist — report the gap instead of inventing it.

Component policy — when Nucleux does not ship what you need, take the ShadCN component as the base (${SHADCN_DOCS}) and restyle it onto Nucleux tokens. Do not hand-roll a primitive Nucleux and ShadCN both leave to ShadCN. The tools name the specific equivalent on a miss. Nucleux's Tailwind preset uses ShadCN's own token names, so pasted markup mostly resolves untouched — but it defines no card, popover or secondary tokens, and those classes render transparent with no build error.

Note that the unrelated npm package "nucleux" (a state-management library) is not this library.`;

/** Find a server-rendered HTML snippet entry for a package (by any component name). */
function snippetFor(
  p: Pkg,
): { name: string; html: string; idCount?: number; text?: string[] } | undefined {
  for (const c of p.components) {
    const s = snippets[c.toLowerCase()];
    if (s) return s;
  }
  return snippets[p.name.toLowerCase()];
}

function renderComponentHtml(p: Pkg, template: boolean): string {
  const snip = snippetFor(p);
  const head = `# ${p.components[0] ?? p.name}  (HTML)`;
  if (!snip) {
    return [
      head,
      "",
      'No prebuilt HTML snippet for this component yet. Nucleux components are Tailwind-class based — use `get_component` with framework:"react" for the API, and `get_setup` with framework:"html" to set up styling.',
    ].join("\n");
  }
  const html = instantiateIds(snip.html, template ? "template" : "concrete");
  const notes: string[] = [
    'Static HTML with Tailwind classes. Requires the Nucleux Tailwind preset + tokens CSS — run `get_setup` with framework:"html". Behavior (menus, dialogs, toggles) is not included; wire it up yourself or use the React package.',
  ];
  if (snip.idCount) {
    notes.push(
      template
        ? `Reusable template: replace the ${snip.idCount > 1 ? "`{{id}}` slots" : "`{{id}}` slot"} with a unique value per instance (use once per element you render).`
        : "Element ids are freshly generated on every response, so calling this again yields non-colliding markup you can safely place multiple times.",
    );
  }
  if (snip.text?.length) {
    notes.push(
      `Editable example text (swap as needed): ${snip.text.map((t) => `"${t}"`).join(", ")}.`,
    );
  }
  return [
    head,
    "",
    p.description || p.summary,
    "",
    notes.join("\n\n"),
    "",
    "```html",
    html,
    "```",
  ].join("\n");
}

const htmlSetup = [
  `# Nucleux setup for plain HTML (no React) — ${catalog.library}@${catalog.version}`,
  "",
  "Nucleux styling is Tailwind + CSS variables, so any HTML page can use the component markup.",
  "",
  "1) Install Tailwind + tokens:",
  "```bash",
  "npm i -D tailwindcss @nucleux/tokens",
  "```",
  "2) `tailwind.config.js`:",
  "```js",
  'module.exports = { presets: [require("@nucleux/tokens/preset")], content: ["./**/*.html"] };',
  "```",
  "3) `input.css` (pulls in the @tailwind layers + the --nx-* design tokens):",
  "```css",
  '@import "@nucleux/tokens/styles.css";',
  "```",
  "4) Build the stylesheet:",
  "```bash",
  "npx tailwindcss -i input.css -o output.css --minify",
  "```",
  '5) Link it, then paste component markup from `get_component` (framework:"html"):',
  "```html",
  '<link rel="stylesheet" href="output.css" />',
  "```",
  "",
  'Dark theme: add `class="dark"` on `<html>`. The static HTML carries styling only — for',
  'interactive behavior use the React packages (framework:"react").',
].join("\n");

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: "nucleux",
      version: catalog.version,
    },
    { instructions: INSTRUCTIONS },
  );
  server.tool(
    "list_components",
    "List every Nucleux UI component with its package name and one-line description. Start here to see what the library offers, and to confirm whether a component exists before falling back to ShadCN.",
    {
      kind: z
        .enum(["component", "infrastructure", "all"])
        .optional()
        .describe(
          "Filter by kind. 'component' (default) = UI components; 'infrastructure' = utils/hooks/tokens/umbrella.",
        ),
    },
    async ({ kind = "component" }) => {
      const rows = catalog.packages
        .filter((p) => kind === "all" || p.kind === kind)
        .map(
          (p) => `- ${p.components[0] ?? p.name} (${p.package}) — ${p.summary || p.description}`,
        );
      return text(
        `Nucleux ${catalog.library}@${catalog.version} — ${catalog.counts.components} components, ${catalog.counts.examples} examples.\n\n${rows.join("\n")}\n\n${FALLBACK_HINT}`,
      );
    },
  );

  server.tool(
    "get_component",
    "Get full details for one component. framework:'react' (default) returns description, install/import, exports, and the verbatim TypeScript Props interface(s). framework:'html' returns a static HTML snippet with Tailwind classes for non-React projects. Accepts a component name (e.g. 'Badge') or package name (e.g. '@nucleux/badge'). If Nucleux does not ship it, returns the ShadCN component to use as the base instead.",
    {
      name: z
        .string()
        .describe("Component or package name, e.g. 'Badge', 'badge', or '@nucleux/badge'."),
      framework: z
        .enum(["react", "html"])
        .optional()
        .describe(
          "Output format. 'react' (default) = TSX API + Props; 'html' = static HTML markup with Tailwind classes.",
        ),
      template: z
        .boolean()
        .optional()
        .describe(
          "HTML only. false (default) returns markup with fresh unique element ids (paste-and-render). true returns a reusable template with `{{id}}` slots to fill per instance — use when composing one component into many elements (e.g. several form fields).",
        ),
    },
    async ({ name, framework = "react", template = false }) => {
      const p = resolve(name);
      if (!p) {
        const suggestions = catalog.packages
          .map((x) => x.components[0] ?? x.name)
          .filter((n) => {
            // Match both ways so plurals and suffixes ("Buttons", "TabsList") still find the component.
            const q = name.trim().toLowerCase();
            const c = n.toLowerCase();
            return c.includes(q) || (c.length > 2 && q.replace(/s$/, "") === c);
          })
          .slice(0, 8);
        // A near-miss on a Nucleux name (e.g. "Badges") is a typo, not a gap —
        // answer it as one. Only a genuine absence falls through to ShadCN.
        if (suggestions.length) {
          return text(`No component named "${name}". Did you mean: ${suggestions.join(", ")}?`);
        }
        const hit = resolveShadcn(name) ?? searchShadcn(name, 3)[0];
        return text(
          [
            `Nucleux has no "${name}". Use list_components to see all ${catalog.counts.components}.`,
            "",
            renderFallback(hit ? [hit] : []),
          ].join("\n"),
        );
      }
      return text(framework === "html" ? renderComponentHtml(p, template) : renderComponent(p));
    },
  );

  server.tool(
    "search_components",
    "Search components by keyword across names, descriptions, and keywords. Use when you know what you need ('chat input', 'toast', 'avatar') but not the exact component name. On no match, returns the ShadCN equivalent to use as the base.",
    {
      query: z.string().describe("Free-text query, e.g. 'chat input', 'progress', 'file upload'."),
    },
    async ({ query }) => {
      const q = query.trim().toLowerCase();
      const terms = q.split(/\s+/).filter(Boolean);
      const scored = catalog.packages
        .map((p) => {
          const hay = [
            p.name,
            p.package,
            p.description,
            p.summary,
            p.exports.join(" "),
            p.keywords.join(" "),
          ]
            .join(" ")
            .toLowerCase();
          const score = terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
          return { p, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12);
      if (!scored.length) {
        return text(
          [
            `No Nucleux component matches "${query}". Try list_components to browse everything.`,
            "",
            renderFallback(searchShadcn(query)),
          ].join("\n"),
        );
      }
      // Every term hit means the match is about the query; fewer means the
      // results may just share a word with it, so offer the ShadCN gap as well.
      const weak = scored[0].score < terms.length;
      return text(
        scored
          .map(
            ({ p }) =>
              `- ${p.components[0] ?? p.name} (${p.package}) — ${p.summary || p.description}`,
          )
          .join("\n") + (weak ? renderFallbackBrief(searchShadcn(query, 3)) : ""),
      );
    },
  );

  server.tool(
    "get_setup",
    "Get install and theming setup for Nucleux. framework:'react' (default) covers the React packages: requirements, install commands, Tailwind v3 preset + content globs, PostCSS and the tokens CSS. framework:'html' covers using Nucleux styling in a plain HTML project. Pass the project's packageManager and whether its Tailwind config is ESM or CommonJS to get exact commands and files. Read this before writing code that uses @nucleux components.",
    {
      framework: z
        .enum(["react", "html"])
        .optional()
        .describe("Setup target: 'react' (default) or 'html' (plain HTML, no React)."),
      packageManager: z
        .enum(["npm", "pnpm", "yarn", "bun"])
        .optional()
        .describe("The project's package manager, from its lockfile (default pnpm)."),
      configModule: z
        .enum(["esm", "cjs"])
        .optional()
        .describe(
          "Module format for tailwind.config/postcss.config: 'esm' (default; package.json has \"type\": \"module\", or .mjs/.ts configs) or 'cjs'.",
        ),
    },
    async ({ framework = "react", packageManager = "pnpm", configModule = "esm" }) => {
      if (framework === "html") return text(htmlSetup);
      const s = catalog.setup;
      const add = { npm: "npm install", pnpm: "pnpm add", yarn: "yarn add", bun: "bun add" }[
        packageManager
      ];
      const addDev = {
        npm: "npm install -D",
        pnpm: "pnpm add -D",
        yarn: "yarn add -D",
        bun: "bun add -d",
      }[packageManager];
      const cjs = configModule === "cjs";
      return text(
        [
          `# Nucleux setup (${catalog.library}@${catalog.version})`,
          "",
          "## Requirements",
          ...s.requirements.map((r) => `- ${r}`),
          "",
          "## 1. Install",
          "```bash",
          `${add} @nucleux/react @nucleux/tokens`,
          `${addDev} ${s.tailwindDev}   # skip if Tailwind v3 + PostCSS are already set up`,
          "```",
          `Single components instead of the umbrella: \`${add} @nucleux/<component> @nucleux/tokens\`.`,
          "",
          `## 2. tailwind.config.${cjs ? "cjs" : "js"}`,
          "Merge into an existing config rather than replacing it: add the preset and the @nucleux content glob.",
          "```js",
          cjs ? s.tailwindConfigCjs : s.tailwindConfigEsm,
          "```",
          "",
          `## 3. postcss.config.${cjs ? "cjs" : "js"}`,
          "```js",
          cjs
            ? "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };"
            : s.postcssConfig,
          "```",
          "",
          "## 4. CSS entry (e.g. src/index.css)",
          "```css",
          s.css,
          "```",
          "",
          "## 5. App entry (e.g. src/main.tsx)",
          "```ts",
          'import "@nucleux/tokens/styles.css";',
          'import "./index.css";',
          "```",
          "",
          "## Notes",
          ...s.theme.map((t) => `- ${t}`),
          `- ${s.note}`,
          "",
          "## Components Nucleux does not ship",
          "",
          `Start from the ShadCN component and restyle it onto Nucleux tokens rather than writing one: ${SHADCN_DOCS}. The preset already defines the token names ShadCN expects (background, foreground, border, input, ring, primary, muted, accent, destructive), so most classes resolve as-is — but there are no \`card\`, \`popover\` or \`secondary\` tokens, and those classes render transparent with no build error. Ask get_component or search_components for the specific equivalent.`,
          'For plain HTML (no React), call get_setup with framework:"html".',
        ].join("\n"),
      );
    },
  );

  server.tool(
    "list_examples",
    "List runnable example compositions (agent chat, dashboards, card variations, settings…) that show how components combine into real screens.",
    {},
    async () => {
      return text(
        catalog.examples.map((e: Example) => `- ${e.name} — "${e.title}"`).join("\n") ||
          "No examples available.",
      );
    },
  );

  server.tool(
    "get_example",
    "Get the full source of one example composition by name (see list_examples). Returns working TSX you can adapt.",
    {
      name: z.string().describe("Example name, e.g. 'agent-chat', 'card-variations', 'settings'."),
    },
    async ({ name }) => {
      const q = name.trim().toLowerCase();
      const ex = catalog.examples.find((e: Example) => e.name.toLowerCase() === q);
      if (!ex) {
        return text(
          `No example "${name}". Available: ${catalog.examples.map((e: Example) => e.name).join(", ")}.`,
        );
      }
      return text(`# ${ex.title} (${ex.name})\n\n\`\`\`tsx\n${ex.source}\n\`\`\``);
    },
  );

  server.tool(
    "search_patterns",
    "Find curated Nucleux page patterns (application shell, dashboard, list/table page, settings, loading/empty/error states…) by what the page is for. Call this before laying out any page, then get_pattern for the full spec. Returns pattern ids with a one-line summary, use cases and required components.",
    {
      query: z
        .string()
        .min(1)
        .describe(
          "What the page or app needs, in plain words, e.g. 'admin dashboard to monitor metrics and manage users'.",
        ),
      limit: z.number().int().min(1).max(10).optional().describe("Max results (default 5)."),
    },
    async ({ query, limit = 5 }) => {
      const hits = searchPatterns(query, limit);
      if (!hits.length) {
        return text(
          [
            `No curated Nucleux pattern matches "${query}".`,
            `Available patterns: ${patterns.map((p) => p.id).join(", ")}.`,
            "Compose the page from components instead (search_components, get_component), keep it on Nucleux tokens, and report the missing pattern in your summary — do not present it as a Nucleux pattern.",
          ].join("\n"),
        );
      }
      return text(
        [
          `${hits.length} pattern${hits.length === 1 ? "" : "s"} for "${query}" (best first). Call get_pattern with an id for the full spec and example.`,
          "",
          ...hits.map((h) => renderPatternBrief(h.pattern)),
        ].join("\n"),
      );
    },
  );

  server.tool(
    "get_pattern",
    "Get the full spec of one Nucleux page pattern by id (see search_patterns): when to use it, required/optional components, composition tree, layout and responsive rules, design tokens, accessibility requirements, states, anti-patterns, and a complete typechecked TSX example.",
    {
      id: z
        .string()
        .min(1)
        .describe("Pattern id, e.g. 'app-shell', 'list-page', 'dashboard-overview'."),
      includeExample: z
        .boolean()
        .optional()
        .describe("Include the full TSX example (default true). Set false for just the rules."),
    },
    async ({ id, includeExample = true }) => {
      const p = resolvePattern(id);
      if (!p) {
        const near = searchPatterns(id, 3).map((h) => h.pattern.id);
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `No pattern "${id}".${near.length ? ` Closest: ${near.join(", ")}.` : ""} Available: ${patterns.map((x) => x.id).join(", ")}.`,
            },
          ],
        };
      }
      return text(renderPattern(p, includeExample));
    },
  );

  const plannedComponent: z.ZodType<PlannedComponent> = z.lazy(() =>
    z.object({
      component: z.string().min(1).describe("Nucleux export name, e.g. 'Button'."),
      props: z
        .record(z.unknown())
        .optional()
        .describe("Props the plan passes; string values are checked against variant values."),
      children: z.array(plannedComponent).optional(),
    }),
  );

  server.tool(
    "validate_design",
    "Check a planned page before or after writing it: pattern ids and a component tree with the props you intend to pass. Reports unknown patterns/components, props a component does not have, invalid variant values, missing required props, deprecated props, and pattern components the plan leaves out. Returns JSON: { valid, errors, warnings, checked, issues: [{ severity, code, path, message, fix? }] }.",
    {
      patterns: z
        .array(z.string())
        .optional()
        .describe("Pattern ids the page follows, e.g. ['app-shell', 'list-page']."),
      components: z
        .array(plannedComponent)
        .optional()
        .describe("Component tree, e.g. [{ component: 'Button', props: { variant: 'cta' } }]."),
    },
    async ({ patterns: ids, components }) => {
      if (!ids?.length && !components?.length) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: "Nothing to validate: pass patterns and/or components.",
            },
          ],
        };
      }
      return text(JSON.stringify(validateDesign({ patterns: ids, components }), null, 2));
    },
  );

  server.prompt(
    "build_with_nucleux",
    "Design-first workflow for building or extending an app's UI with Nucleux: inspect the project, discover patterns, read component contracts, plan, implement, validate, report.",
    {
      request: z
        .string()
        .optional()
        .describe(
          "What to build, e.g. 'a project management app with dashboard, projects, team and settings'.",
        ),
    },
    ({ request }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `${workflow}\n\n---\n\n${request ? `Task: ${request}` : "Task: ask me what to build, then follow the workflow above."}`,
          },
        },
      ],
    }),
  );
  return server;
}
