# @nucleux/connectors

Connector — enable an external tool or data connector — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

- **`Connector`** — one service: `name`, `description`, `icon`, `connected`, `onConnect`, `onDisconnect`, `connectLabel`, `disconnectLabel`, plus
  - `status` (`"disconnected"` | `"connecting"` | `"connected"` | `"expired"` | `"error"`; overrides `connected`), announced politely
  - `scopes` — what the agent will be able to do, in plain verbs, shown before connecting
  - `account` — who the sign-in is with, shown once connected ("You can disconnect at any time")
  - `onReconnect` — for an expired sign-in (falls back to `onConnect`); `error`
- **`ConnectorList`** (variant `connector-list`) — a list of Connector cards (`label`, default "Connected services").
- **`ConnectorScopePicker`** (variant `scope-picker`) — "Aria can read from:" with a checkbox per channel, folder or repo, starting from nothing; `allowWrite` / `onAllowWriteChange` asks for write access as a separate switch.
- **`ConnectorLivePill`** (variant `live-source-pill`) — "Reading 12 docs from Drive…", pulsing (the pulse stops under reduced motion), announced politely.
- Types: `ConnectorProps`, `ConnectorStatus`, `ConnectorListProps`, `ConnectorScope`, `ConnectorScopePickerProps`, `ConnectorLivePillProps`.

## Install

```bash
pnpm add @nucleux/connectors @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Connector, ConnectorList, ConnectorScopePicker, ConnectorLivePill } from "@nucleux/connectors";

<ConnectorList>
  <Connector name="Google Drive" connected account="sam@acme.com" onDisconnect={disconnect} />
  <Connector name="Slack" scopes={["Read channels you choose"]} onConnect={connectSlack} />
</ConnectorList>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
