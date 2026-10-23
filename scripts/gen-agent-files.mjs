// Generates the coding-agent integration files from the single shared source,
// knowledge/workflow.md, so Claude Code and Codex always get the same guidance:
//
//   packages/mcp/skills/nucleux-design/SKILL.md   Agent Skills format; read by
//       Claude Code (.claude/skills/) and Codex (.agents/skills/). Shipped in
//       @nucleux/mcp and installed by `npx @nucleux/mcp init`.
//   plugins/nucleux/skills/nucleux-design/SKILL.md  same file, for the Claude
//       Code plugin in this repo's marketplace.
//   packages/mcp/templates/AGENTS.md               section for a project's
//       AGENTS.md (Codex and other AGENTS.md-aware agents).
//
// Run with --check to fail if any generated file is stale (used by tests/CI).
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workflow = readFileSync(join(root, "knowledge", "workflow.md"), "utf8").trim();
// Drop the H1; each target supplies its own title.
const body = workflow.replace(/^# .*\n+/, "");

const GENERATED = "<!-- Generated from knowledge/workflow.md by scripts/gen-agent-files.mjs. Do not edit. -->";

const MCP_SETUP = `## Requires the nucleux MCP server

The steps below call the \`nucleux\` MCP tools (\`search_patterns\`, \`get_pattern\`,
\`get_component\`, \`get_setup\`). If they are not available, stop and tell the
user to add the server, then continue once it is connected:

- Any agent, from the project root: \`npx -y @nucleux/mcp add\`
- Claude Code: \`claude mcp add nucleux -- npx -y @nucleux/mcp\`
- Codex: \`codex mcp add nucleux -- npx -y @nucleux/mcp\`

Do not fall back to guessing Nucleux APIs.`;

const skill = `---
name: nucleux-design
description: Build or extend UI with the Nucleux design system — React web apps (@nucleux/react, shadcn or Material 3) and native apps with Nucleux Mobile (SwiftUI, Jetpack Compose, Flutter, React Native) — app shells, dashboards, list/table pages, settings, agentic AI surfaces and loading/empty/error states — design-first, from curated patterns and exact component contracts. Use when asked to build screens, pages or an app with Nucleux, or when the project depends on @nucleux packages or Nucleux Mobile.
---

${GENERATED}

# Nucleux design workflow

${MCP_SETUP}

${body}
`;

const agentsMd = `${GENERATED}

## UI: Nucleux design system

This project builds its UI with Nucleux (\`@nucleux/react\`). Use the \`nucleux\`
MCP server (\`npx -y @nucleux/mcp\`) for patterns and component contracts; the
\`nucleux-design\` skill holds the same workflow.

${body.replace(/^## /gm, "### ")}
`;

const outputs = [
  [join(root, "packages", "mcp", "skills", "nucleux-design", "SKILL.md"), skill],
  [join(root, "plugins", "nucleux", "skills", "nucleux-design", "SKILL.md"), skill],
  [join(root, "packages", "mcp", "templates", "AGENTS.md"), agentsMd],
];

const check = process.argv.includes("--check");
const stale = [];
for (const [file, content] of outputs) {
  if (check) {
    if (!existsSync(file) || readFileSync(file, "utf8") !== content) stale.push(file);
    continue;
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}
if (check && stale.length) {
  console.error(`Stale agent files (run node scripts/gen-agent-files.mjs):\n  ${stale.join("\n  ")}`);
  process.exit(1);
}
console.log(check ? "agent files up to date" : `agent files → ${outputs.length} written`);
