# @nucleux/mcp-connection

MCP Server Connection — standardised tool access so the AI can act, not just answer — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

- **`McpConnection`** — the server card: `name`, `address`, `icon`, `meta`, `status` (`"disconnected"` | `"connecting"` | `"connected"` | `"error"`), `stage` (`"reach"` | `"authenticate"` | `"discover"` — the step in progress or the one that failed), `error`, `account`, `scopes`, and `onConnect` / `onDisconnect` / `onRetry` / `onAuthenticate`. Status is a word plus a dot that is a ring while the server can't be used and filled when it can; the three named steps resolve one at a time; a failed sign-in offers "Sign in again", not a generic retry. Children go in its body.
- **`McpConnectionTools`** (variant `tool-list`) — the tools discovery turned up, grouped least dangerous first: Reads only, Changes things, Destructive. Each row (**`McpConnectionTool`**) shows the human name, the server id, the description, availability as a word (Allowed, Approval required, Off), an optional on/off switch (`onToolEnabledChange`), and expands to inspect the input schema. A failed call shows on its row only. Ends with a trust note: names and descriptions come from the server.
- **`McpConnectionActionPreview`** (variant `action-preview`) — before a tool runs: the call with its arguments, the expected effect, and **Approve / Edit / Never allow**; then running, the result, or the tool's own error ("The server is still connected"). `risk="destructive"` uses the destructive treatment.
- **`McpConnectionPermission`** (variant `permission-toggle`) — "Allow Aria to use Linear?": Always / Just this once / Don't allow, as a radio group. Destructive subjects don't offer Always.
- Types: `McpConnectionStatus`, `McpConnectionStage`, `McpConnectionToolRisk`, `McpConnectionToolAvailability`, `McpConnectionPermissionValue`, `McpConnectionActionStatus`, `McpConnectionToolInfo` and each component's Props.

The component does no networking: the app moves `status` / `stage`, supplies `tools`, and handles every callback.

## Install

```bash
pnpm add @nucleux/mcp-connection @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { McpConnection, McpConnectionTools, McpConnectionActionPreview } from "@nucleux/mcp-connection";

<McpConnection name="Linear MCP" address="https://mcp.linear.app/sse" status={status} stage={stage} onConnect={connect} onDisconnect={disconnect}>
  <McpConnectionTools tools={tools} onToolEnabledChange={setToolEnabled} />
</McpConnection>

<McpConnectionActionPreview
  tool="linear.create_issue"
  args={{ title: "Renewal flow broken", team: "Apollo" }}
  onApprove={run}
  onEdit={edit}
  onDeny={neverAllow}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
