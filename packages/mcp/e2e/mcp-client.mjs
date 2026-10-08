// End-to-end MCP test: connect to the built @nucleux/mcp server over stdio
// (real JSON-RPC), exercise every tool as an agent would, and use the responses
// to generate a working page — proving the discover→build flow.
//
//   node packages/mcp/e2e/mcp-client.mjs
//
// Emits: examples/e2e/agent-console.html  (page built from MCP html snippets)
//        examples/e2e/mcp-transcript.md   (recorded MCP interaction)
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const mcpDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const root = join(mcpDir, "..", "..");
const outDir = join(root, "examples", "e2e");

const textOf = (res) => res.content?.map((c) => c.text ?? "").join("\n") ?? "";
const fencedHtml = (s) => {
  const m = s.match(/```html\n([\s\S]*?)```/);
  return m ? m[1].trim() : null;
};

async function main() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
    cwd: mcpDir,
  });
  const client = new Client({ name: "nucleux-e2e", version: "1.0.0" });
  await client.connect(transport);

  const log = [`# MCP end-to-end transcript`, ""];
  const rec = (title, body) => log.push(`## ${title}`, "", "```", body.trim(), "```", "");

  // 1) Discover the toolset
  const { tools } = await client.listTools();
  rec("listTools", tools.map((t) => `- ${t.name}: ${t.description.slice(0, 80)}…`).join("\n"));

  // 2) Setup (both frameworks)
  const setupReact = textOf(await client.callTool({ name: "get_setup", arguments: { framework: "react" } }));
  const setupHtml = textOf(await client.callTool({ name: "get_setup", arguments: { framework: "html" } }));
  rec("get_setup · react", setupReact);
  rec("get_setup · html", setupHtml);

  // 3) Search the way an agent would
  const search = textOf(await client.callTool({ name: "search_components", arguments: { query: "agent chat message tool call" } }));
  rec("search_components 'agent chat message tool call'", search);

  // 4) Pull the components for an agent console — HTML markup for each
  const wanted = ["md3-message", "md3-tool-call", "md3-agent-steps", "md3-action-plan", "md3-agent-composer"];
  const blocks = [];
  for (const name of wanted) {
    const react = textOf(await client.callTool({ name: "get_component", arguments: { name, framework: "react" } }));
    const html = textOf(await client.callTool({ name: "get_component", arguments: { name, framework: "html" } }));
    rec(`get_component ${name} · react`, react.slice(0, 400));
    const markup = fencedHtml(html);
    if (markup) blocks.push({ name, markup });
    else log.push(`> ⚠️ no html snippet for ${name}`, "");
  }

  await client.close();

  // 5) Assemble an HTML page from the MCP-provided snippets
  const section = (title, inner) =>
    `      <section class="nx-e2e-section">\n        <h2>${title}</h2>\n        ${inner}\n      </section>`;
  const body = blocks
    .map((b) => section(b.name, b.markup))
    .join("\n");

  const page = `<!doctype html>
<html lang="en" class="nx-theme-mui">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nucleux · Agent Console (MCP-generated)</title>
    <!-- Built from @nucleux/mcp get_component(framework:"html") output.
         Styling per get_setup(framework:"html"): Tailwind preset + tokens CSS,
         compiled to ./output.css. Whole page is wrapped in .nx-theme-mui so the
         components render in the Material UI 3 look. -->
    <link rel="stylesheet" href="./output.css" />
  </head>
  <body class="bg-md-surface p-6 text-md-on-surface">
    <main class="mx-auto flex max-w-xl flex-col gap-6">
      <header>
        <h1 class="text-2xl font-semibold">Agent Console</h1>
        <p class="text-sm text-md-on-surface-variant">Generated end-to-end from the Nucleux MCP server.</p>
      </header>
${body}
    </main>
  </body>
</html>
`;

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "agent-console.html"), page);
  writeFileSync(join(outDir, "mcp-transcript.md"), log.join("\n"));

  console.log(`MCP e2e OK — ${tools.length} tools, ${blocks.length}/${wanted.length} components rendered to HTML.`);
  console.log(`  wrote examples/e2e/agent-console.html`);
  console.log(`  wrote examples/e2e/mcp-transcript.md`);
}

main().catch((err) => {
  console.error("MCP e2e failed:", err);
  process.exit(1);
});
