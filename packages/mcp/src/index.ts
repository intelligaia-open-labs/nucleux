import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import catalog from "./catalog.json";

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

const server = new McpServer({
  name: "nucleux",
  version: catalog.version,
});

server.tool(
  "list_components",
  "List every Nucleux UI component with its package name and one-line description. Start here to see what the library offers.",
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
      `Nucleux ${catalog.library}@${catalog.version} — ${catalog.counts.components} components, ${catalog.counts.examples} examples.\n\n${rows.join("\n")}`,
    );
  },
);

server.tool(
  "get_component",
  "Get full details for one component: description, install/import, exports, and the verbatim TypeScript Props interface(s). Accepts a component name (e.g. 'Badge') or package name (e.g. '@nucleux/badge').",
  {
    name: z.string().describe("Component or package name, e.g. 'Badge', 'badge', or '@nucleux/badge'."),
  },
  async ({ name }) => {
    const p = resolve(name);
    if (!p) {
      const suggestions = catalog.packages
        .map((x) => x.components[0] ?? x.name)
        .filter((n) => n.toLowerCase().includes(name.trim().toLowerCase()))
        .slice(0, 8);
      return text(
        `No component named "${name}".${suggestions.length ? ` Did you mean: ${suggestions.join(", ")}?` : " Use list_components to see all."}`,
      );
    }
    return text(renderComponent(p));
  },
);

server.tool(
  "search_components",
  "Search components by keyword across names, descriptions, and keywords. Use when you know what you need ('chat input', 'toast', 'avatar') but not the exact component name.",
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
    if (!scored.length) return text(`No matches for "${query}". Try list_components to browse everything.`);
    return text(
      scored
        .map(({ p }) => `- ${p.components[0] ?? p.name} (${p.package}) — ${p.summary || p.description}`)
        .join("\n"),
    );
  },
);

server.tool(
  "get_setup",
  "Get install and theming setup for Nucleux (Tailwind preset + tokens CSS, peer deps). Read this before writing code that imports @nucleux components.",
  {},
  async () => {
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
