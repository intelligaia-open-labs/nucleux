# @nucleux/mcp

Design-system intelligence for coding agents. `@nucleux/mcp` lets Claude Code,
Codex, Cursor and other MCP clients build UI with
**[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** the way a
Nucleux designer would: pick a curated page pattern, read the exact component
contracts, set the project up correctly, and avoid inventing APIs.

It ships three things:

- **An MCP server** with curated page patterns, exact component contracts
  (props, types, required/optional, defaults and variant values, generated
  from the TypeScript sources), setup instructions and example screens.
- **The `nucleux-design` skill**: a design-first workflow (inspect → analyse →
  discover → plan → implement → validate → report) for Claude Code and Codex.
- **`init`**: one command that installs the skill into your project.

## Quick start

Needs [Node.js](https://nodejs.org) ≥ 18. Nothing to install by hand: the
client runs the server on demand through `npx`.

### Claude Code

Plugin (MCP server + skill in one step):

```bash
claude plugin marketplace add intelligaia-open-labs/nucleux
claude plugin install nucleux@nucleux-marketplace
```

Or add the pieces yourself:

```bash
claude mcp add nucleux -- npx -y @nucleux/mcp
npx -y @nucleux/mcp init --claude      # → .claude/skills/nucleux-design/SKILL.md
```

Check with `claude mcp list` (`nucleux … ✓ Connected`).

### Codex

```bash
codex mcp add nucleux -- npx -y @nucleux/mcp
npx -y @nucleux/mcp init --codex --agents-md   # → .agents/skills/nucleux-design/, AGENTS.md section
```

Or in `~/.codex/config.toml` (or a trusted project's `.codex/config.toml`):

```toml
[mcp_servers.nucleux]
command = "npx"
args = ["-y", "@nucleux/mcp"]
```

### Cursor, Claude Desktop, Windsurf, other MCP clients

```json
{ "mcpServers": { "nucleux": { "command": "npx", "args": ["-y", "@nucleux/mcp"] } } }
```

(`.cursor/mcp.json`; for Claude Desktop, `claude_desktop_config.json`; then restart.)
These clients do not read skills. The server's own instructions point the agent
at the same workflow, and the `build_with_nucleux` prompt carries it in full.

## Example prompts

> Build a project management app with a dashboard, project list, task
> management, team page and settings, responsive on mobile. Use Nucleux
> components and design patterns.

> Add an admin users page to this app with search, a role filter and
> pagination, using Nucleux.

> Set up Nucleux in this project.

In Claude Code you can also run the workflow prompt directly:
`/mcp__nucleux__build_with_nucleux a CRM with contacts, deals and a pipeline view`.

## New project vs existing project

- **New project:** the agent calls `get_setup` with your package manager and
  config format, then installs `@nucleux/react @nucleux/tokens` and Tailwind
  CSS v3, and writes the preset, content globs, PostCSS config and CSS imports.
- **Existing project with Nucleux:** setup is skipped. The agent reads your
  routes and components first and adds pages that match them.
- **Existing project on another component system:** the skill tells the agent
  not to migrate you. It extends what you have unless you ask to switch.

## Tools

Discovery is concise; details come on request, so no call returns the whole catalog.

| Tool | Purpose |
| --- | --- |
| `search_patterns` | Find curated page patterns by intent ("admin dashboard to monitor metrics and manage users"). Returns ids, summaries, use cases, required components. |
| `get_pattern` | Full spec for one pattern: when (not) to use it, components, composition tree, layout, responsive and accessibility rules, tokens, states, anti-patterns, and a typechecked TSX example. |
| `search_components` | Keyword search across component names, descriptions and keywords. |
| `get_component` | Exact contract for one component: import line, exports, every prop with type, required, default, allowed values and deprecations, plus the patterns that use it. `framework: "html"` returns static markup instead. |
| `validate_design` | Check a plan (pattern ids + component tree with props) against the catalog. Returns JSON issues: unknown patterns/components, props a component lacks, invalid variant values, missing required or deprecated props, pattern components left out. |
| `get_setup` | Requirements and install for `react` (pass `packageManager` and `configModule`) or plain `html`. |
| `list_components` | Every component with a one-line description. |
| `list_examples` / `get_example` | Larger reference screens (agent chat, dashboards, login, settings…). |

Prompt: `build_with_nucleux` (optional `request`) returns the full workflow.

### Curated patterns

| id | For |
| --- | --- |
| `app-shell` | Persistent left nav, top bar, mobile navigation sheet |
| `list-page` | Collection page: search + filter toolbar, sortable paginated table |
| `dashboard-overview` | KPI cards, progress panel, recent activity |
| `settings-page` | Tabbed settings: profile form + toggle rows |
| `page-states` | Loading, empty and error states for async data |
| `detail-page` | One record: breadcrumb, header with status + actions, tabbed facts, delete confirmation |
| `form-dialog` | Create/edit form in a dialog with validation and a success toast |
| `multi-step-form` | Wizard/onboarding/checkout: steps with Progress, per-step validation, review |
| `auth-sign-in` | Sign-in (and sign-up/reset) card with field and form-level errors |
| `analytics-charts` | Chart cards with ChartContainer (Recharts), token colors, accessible summaries |
| `task-board` | Kanban columns of task cards with a keyboard-friendly actions menu |

Each pattern's example is typechecked against the library and render- and
axe-tested in CI, so a pattern cannot reference a component or prop that does
not exist. When nothing matches, the tools say so and tell the agent to report
the gap instead of presenting something invented as a Nucleux pattern.

## How the knowledge model works

| Source (in the repo) | Generated into | By |
| --- | --- | --- |
| `packages/*/src/index.tsx` | `src/catalog.json`: exports, structured Props | `scripts/gen-mcp-catalog.mjs` (TypeScript parser) |
| `knowledge/patterns/<id>/pattern.json` + `example.tsx` | `src/knowledge.json` | `scripts/gen-mcp-knowledge.mjs` (fails on unknown components) |
| `knowledge/workflow.md` | the skill, the AGENTS.md section, the prompt | `scripts/gen-agent-files.mjs` |

All of this runs in `pnpm --filter @nucleux/mcp build`. To add a pattern, see
[`knowledge/README.md`](../../knowledge/README.md).

## Supported setups

- React ≥ 18 (tested with React 19 + Vite 6) and Tailwind CSS v3.4. Tailwind v4 is untested.
- Plain HTML: Tailwind classes only (`get_component` / `get_setup` with
  `framework: "html"`), no interactive behavior.
- Not covered: Vue, Svelte, Angular, React Native (see `nucleux-mobile` for native).

## Troubleshooting

- **Components render unstyled.** Your Tailwind `content` must include
  `./node_modules/@nucleux/*/dist/**/*.{js,cjs}`: the tokens stylesheet holds
  only the CSS variables and base reset; your build generates the component
  classes. Also import `@nucleux/tokens/styles.css` before your own CSS.
- **No theme colors with a CommonJS Tailwind config.** Use
  `require("@nucleux/tokens/preset").default`. The bare `require` returns the module object.
- **`ColumnDef` import fails in a pnpm project.** Type DataTable columns as
  `DataTableProps<Row, unknown>["columns"]`, or add `@tanstack/react-table`.
- **The agent doesn't call the tools.** Check `claude mcp list` / `codex mcp list`,
  and install the skill (`npx -y @nucleux/mcp init`).
- **Windows:** if the client can't find `npx`, use `"command": "npx.cmd"`.
- **Verify the server by hand:** `npx -y @nucleux/mcp` prints
  `nucleux-mcp ready — … components, … patterns, … examples.` to stderr and
  waits on stdin (it speaks JSON-RPC over stdio). Ctrl+C to exit.

## Known limitations

- Eleven curated patterns. Not yet covered: e-commerce (product grid, cart),
  calendars/scheduling, chat-first agent layouts as patterns (see
  `get_example agent-chat`). Agents compose these from components and report
  them as gaps.
- `Popover` (and so the menu-button composition) is not portaled: a menu
  inside an `overflow-*` container is clipped. The `task-board` pattern
  documents the layout that avoids it.
- Props are read syntactically: inherited DOM props are named by their
  `extends` type, not expanded; types imported from other packages are shown
  by name.
- `validate_design` checks a structured plan, not source code: it cannot see
  props you pass through spreads or wrappers. The project's typecheck and
  build remain the final check, and the workflow requires both.

## License

MIT © Nucleux
