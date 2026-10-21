# @nucleux/md3-mcp-connection

Material 3 MCP Connection — connect a server, discover what it can do, and decide before the agent uses it — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

This is the Material 3 twin of [`@nucleux/mcp-connection`](../mcp-connection). It shares that package's API exactly — same props, callbacks, states and accessible names — so you switch families by changing only the import. Only the look differs.

## Exports

- **`Md3McpConnection`** — outlined card for a server: name, address, status (ring when unusable, filled disc when ready, always a word), named establishment steps (reach, sign in, discover), account and scopes, Connect / Disconnect / Try again / Sign in again
- **`Md3McpConnectionTools`** — tools grouped least dangerous first (Reads only, Changes things, Destructive), with the trust note
- **`Md3McpConnectionTool`** — one expandable tool row (schema behind the row) with an optional `Md3Switch`
- **`Md3McpConnectionPermission`** — Always / Just this once / Don't allow as an `Md3RadioGroup`; no "Always" for destructive subjects
- **`Md3McpConnectionActionPreview`** — the approval gate: call, arguments, effect, Approve / Edit / Never allow, then running / result / tool error
- Types: `Md3McpConnectionProps`, `Md3McpConnectionToolsProps`, `Md3McpConnectionToolProps`, `Md3McpConnectionPermissionProps`, `Md3McpConnectionActionPreviewProps`, `Md3McpConnectionStatus`, `Md3McpConnectionStage`, `Md3McpConnectionToolRisk`, `Md3McpConnectionToolAvailability`, `Md3McpConnectionPermissionValue`, `Md3McpConnectionActionStatus`, `McpConnectionToolInfo` (all aliases of the twin's types)

## Install

```bash
pnpm add @nucleux/md3-mcp-connection @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3McpConnection, Md3McpConnectionTools } from "@nucleux/md3-mcp-connection";

<Md3McpConnection name="Linear MCP" address="https://mcp.linear.app/sse" status="connected" onDisconnect={disconnect}>
  <Md3McpConnectionTools tools={tools} onToolEnabledChange={setEnabled} />
</Md3McpConnection>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
