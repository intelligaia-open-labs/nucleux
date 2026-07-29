# @nucleux/mcp

Model Context Protocol server for **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — the agentic UI component library for React. It lets AI coding agents (Claude Code, Claude Desktop, Cursor, Windsurf, …) **discover, search, and correctly use** `@nucleux` components: real descriptions, exports, verbatim TypeScript `Props`, install/import lines, and full example compositions.

It ships a catalog generated from the packages themselves, so the answers match the published code — no guessing, no hallucinated props.

## Quick start

You never install this package by hand — your AI client runs it on demand via `npx`.

**Prerequisites:** [Node.js](https://nodejs.org) ≥ 18 (provides `npx`) and an MCP-capable client (Claude Code, Claude Desktop, Cursor, Windsurf, …).

**Claude Code** (one command):

```bash
claude mcp add nucleux -- npx -y @nucleux/mcp
```

Then verify: `claude mcp list` → `nucleux ✓ connected`.

That's it. Now just ask your agent in plain language — it calls the tools for you:

> "Set up Nucleux in this project."
> "What Nucleux components exist for a chat UI?"
> "Show me the InputBar props and build a composer with a stop button."
> "Give me a full agent-chat screen using Nucleux."

## Configure other clients

**Cursor** — create `.cursor/mcp.json` in your project (or the global config):

```json
{ "mcpServers": { "nucleux": { "command": "npx", "args": ["-y", "@nucleux/mcp"] } } }
```

**Claude Desktop** — edit `claude_desktop_config.json`, then restart the app:

- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{ "mcpServers": { "nucleux": { "command": "npx", "args": ["-y", "@nucleux/mcp"] } } }
```

**Windsurf / other clients** — use the same `command`/`args` in their MCP settings.

> **Windows:** if the client can't find `npx`, use `"command": "npx.cmd"`.

## Verify it works

Run it directly:

```bash
npx -y @nucleux/mcp
```

It should print `nucleux-mcp ready — 48 components, 6 examples.` to **stderr**, then wait on stdin — that's correct, it speaks MCP (JSON-RPC) over stdio. Press `Ctrl+C` to exit. If you see that line, your client integration will work.

## Tools

| Tool | What it does |
| --- | --- |
| `list_components` | List every component with package + one-line description. |
| `search_components` | Keyword search across names, descriptions, and keywords. |
| `get_component` | Full detail for one component — description, install/import, exports, and the verbatim `Props` interface(s). Accepts `Badge`, `badge`, or `@nucleux/badge`. |
| `get_setup` | Install + Tailwind/tokens theming setup. Read before writing code that imports `@nucleux`. |
| `list_examples` | List runnable example compositions (agent chat, dashboards, card variations, settings…). |
| `get_example` | Full TSX source of one example composition. |

## Configure your client

### Claude Code

```bash
claude mcp add nucleux -- npx -y @nucleux/mcp
```

### Claude Desktop / Cursor / Windsurf

Add to the client's MCP config (`claude_desktop_config.json`, `.cursor/mcp.json`, …):

```json
{
  "mcpServers": {
    "nucleux": {
      "command": "npx",
      "args": ["-y", "@nucleux/mcp"]
    }
  }
}
```

## Typical first-run flow

1. Add the server (Quick start above).
2. *"Set up Nucleux in this project"* → the agent runs `get_setup`, installs `@nucleux/react @nucleux/tokens`, and wires the Tailwind preset + CSS import.
3. *"Build a settings page with Nucleux"* → it searches, pulls the real props/examples, and writes accurate components.

## License

MIT © Nucleux
