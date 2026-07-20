# @nucleux/mcp

Model Context Protocol server for **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — the agentic UI component library for React. It lets AI coding agents (Claude Code, Claude Desktop, Cursor, Windsurf, …) **discover, search, and correctly use** `@nucleux` components: real descriptions, exports, verbatim TypeScript `Props`, install/import lines, and full example compositions.

It ships a catalog generated from the packages themselves, so the answers match the published code — no guessing, no hallucinated props.

## Run

No install needed — run it with `npx`:

```bash
npx -y @nucleux/mcp
```

It speaks MCP over stdio.

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

Then ask your agent things like *"list the Nucleux chat components"* or *"show me the InputBar props and build a composer"* — it will call these tools and use the exact API.

## License

MIT © Nucleux
