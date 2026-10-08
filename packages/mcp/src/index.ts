import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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

/** Resolve a component/package name (fuzzy) to its catalog entry. */
function resolve(query: string): Pkg | undefined {
  const q = query.trim().toLowerCase();
  return (
    byName.get(q) ??
    byName.get(q.replace(/^@nucleux\//, "")) ??
    catalog.packages.find((p) => p.name.toLowerCase() === q || p.components.some((c) => c.toLowerCase() === q))
  );
}

function text(s: string) {
  return { content: [{ type: "text" as const, text: s }] };
}

function renderComponent(p: Pkg): string {
  const lines = [
    `# ${p.components[0] ?? p.name}  (${p.package})`,
    "",
    p.description || p.summary,
    "",
    `**Kind:** ${p.kind}`,
    `**Install:** \`${p.installSingle}\`  (or the full kit: \`${catalog.setup.installFull}\`)`,
    `**Import:** \`${p.import || `import { /* … */ } from "${p.package}";`}\``,
    "",
    `**Exports:** ${p.exports.join(", ") || "—"}`,
  ];
  if (p.props.length) {
    lines.push("", "## Props", "");
    for (const pr of p.props) lines.push("```ts", pr.source, "```", "");
  }
  return lines.join("\n").trim();
}

const INSTRUCTIONS = `Nucleux (@nucleux/react) is intelligaia's agentic-UI component library for React — chat, reasoning, tool-call, consent and agent-state surfaces (Thread, Message, AgentComposer, ToolCall, Reasoning, ModularConsent, AgentSteps, Citation…) plus the common basics, published as ~50 sub-packages behind one umbrella.

Use these tools instead of guessing props: the catalog is generated from the published packages, so descriptions, exports and TypeScript Props are verbatim. Start with search_components or list_components, then get_component for exact props and the import line, get_setup for install and Tailwind configuration, and get_example (e.g. "agent-chat") for a full working composition.

Component policy — when Nucleux does not ship what you need, take the ShadCN component as the base (${SHADCN_DOCS}) and restyle it onto Nucleux tokens. Do not hand-roll a primitive Nucleux and ShadCN both leave to ShadCN. The tools name the specific equivalent on a miss. Nucleux's Tailwind preset uses ShadCN's own token names, so pasted markup mostly resolves untouched — but it defines no card, popover or secondary tokens, and those classes render transparent with no build error.

Note that the unrelated npm package "nucleux" (a state-management library) is not this library.`;

/** Find a server-rendered HTML snippet entry for a package (by any component name). */
function snippetFor(p: Pkg): { name: string; html: string; idCount?: number; text?: string[] } | undefined {
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
      "No prebuilt HTML snippet for this component yet. Nucleux components are Tailwind-class based — use `get_component` with framework:\"react\" for the API, and `get_setup` with framework:\"html\" to set up styling.",
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
    notes.push(`Editable example text (swap as needed): ${snip.text.map((t) => `"${t}"`).join(", ")}.`);
  }
  return [head, "", p.description || p.summary, "", notes.join("\n\n"), "", "```html", html, "```"].join("\n");
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
  "interactive behavior use the React packages (framework:\"react\").",
].join("\n");

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
      .describe("Filter by kind. 'component' (default) = UI components; 'infrastructure' = utils/hooks/tokens/umbrella."),
  },
  async ({ kind = "component" }) => {
    const rows = catalog.packages
      .filter((p) => kind === "all" || p.kind === kind)
      .map((p) => `- ${p.components[0] ?? p.name} (${p.package}) — ${p.summary || p.description}`);
    return text(
      `Nucleux ${catalog.library}@${catalog.version} — ${catalog.counts.components} components, ${catalog.counts.examples} examples.\n\n${rows.join("\n")}\n\n${FALLBACK_HINT}`,
    );
  },
);

server.tool(
  "get_component",
"Get full details for one component. framework:'react' (default) returns description, install/import, exports, and the verbatim TypeScript Props interface(s). framework:'html' returns a static HTML snippet with Tailwind classes for non-React projects. Accepts a component name (e.g. 'Badge') or package name (e.g. '@nucleux/badge'). If Nucleux does not ship it, returns the ShadCN component to use as the base instead.",
  {
    name: z.string().describe("Component or package name, e.g. 'Badge', 'badge', or '@nucleux/badge'."),
    framework: z
      .enum(["react", "html"])
      .optional()
      .describe("Output format. 'react' (default) = TSX API + Props; 'html' = static HTML markup with Tailwind classes."),
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
        .filter((n) => n.toLowerCase().includes(name.trim().toLowerCase()))
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
        const hay = [p.name, p.package, p.description, p.summary, p.exports.join(" "), p.keywords.join(" ")]
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
        [`No Nucleux component matches "${query}". Try list_components to browse everything.`, "", renderFallback(searchShadcn(query))].join("\n"),
      );
    }
    // Every term hit means the match is about the query; fewer means the
    // results may just share a word with it, so offer the ShadCN gap as well.
    const weak = scored[0].score < terms.length;
    return text(
      scored
        .map(({ p }) => `- ${p.components[0] ?? p.name} (${p.package}) — ${p.summary || p.description}`)
        .join("\n") + (weak ? renderFallbackBrief(searchShadcn(query, 3)) : ""),
    );
  },
);

server.tool(
  "get_setup",
  "Get install and theming setup for Nucleux. framework:'react' (default) covers the React packages (Tailwind preset + tokens CSS, peer deps). framework:'html' covers using Nucleux styling in a plain HTML project. Read this before writing code that uses @nucleux components.",
  {
    framework: z
      .enum(["react", "html"])
      .optional()
      .describe("Setup target: 'react' (default) or 'html' (plain HTML, no React)."),
  },
  async ({ framework = "react" }) => {
    if (framework === "html") return text(htmlSetup);
    const s = catalog.setup;
    return text(
      [
        `# Nucleux setup (${catalog.library}@${catalog.version})`,
        "",
        `**Full kit:** \`${s.installFull}\``,
        `**Single component:** \`${s.installSingle}\``,
        "",
        "## Theme",
        ...s.theme.map((t) => `- ${t}`),
        "",
        s.note,
        "",
        "## Components Nucleux does not ship",
        "",
        `Start from the ShadCN component and restyle it onto Nucleux tokens rather than writing one: ${SHADCN_DOCS}. The preset already defines the token names ShadCN expects (background, foreground, border, input, ring, primary, muted, accent, destructive), so most classes resolve as-is — but there are no \`card\`, \`popover\` or \`secondary\` tokens, and those classes render transparent with no build error. Ask get_component or search_components for the specific equivalent.`,
                'For plain HTML (no React), call get_setup with framework:"html".',      ].join("\n"),
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr so we never corrupt the stdio JSON-RPC channel.
  console.error(`nucleux-mcp ready — ${catalog.counts.components} components, ${catalog.counts.examples} examples.`);
}

main().catch((err) => {
  console.error("nucleux-mcp failed to start:", err);
  process.exit(1);
});
