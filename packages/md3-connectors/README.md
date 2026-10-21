# @nucleux/md3-connectors

Material 3 Connectors — grant the agent standing access to a service it needs — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

This is the Material 3 twin of [`@nucleux/connectors`](https://github.com/intelligaia-open-labs/nucleux/tree/main/packages/connectors) and shares its API exactly: the props types are re-exported from it, so switching families means changing only the import.

## Exports

- **`Md3Connector`** — an outlined card for one service: icon, name, what it unlocks, a filled Connect button, the scope list in plain verbs before the handoff, the signed-in account, and a status word (with a dot beside it) announced politely; `status` disconnected/connecting/connected/expired/error, `onConnect`/`onDisconnect`/`onReconnect`
- **`Md3ConnectorList`** — a labelled list of connector cards
- **`Md3ConnectorScopePicker`** — least-privilege checkboxes for what the agent can read, with write access as a separate switch
- **`Md3ConnectorLivePill`** — a tonal chip with a pulsing dot: "Reading 12 docs from Drive…"
- Types: `Md3ConnectorProps`, `Md3ConnectorListProps`, `Md3ConnectorScopePickerProps`, `Md3ConnectorLivePillProps`, `Md3ConnectorStatus`, `Md3ConnectorScope` (plus `ConnectorStatus`, `ConnectorScope`)

## Install

```bash
pnpm add @nucleux/md3-connectors @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Connector, Md3ConnectorList } from "@nucleux/md3-connectors";

<Md3ConnectorList>
  <Md3Connector name="Google Drive" connected account="sam@acme.com" onDisconnect={disconnect} />
  <Md3Connector name="Slack" status="expired" account="sam@acme.com" onReconnect={signIn} />
  <Md3Connector name="Notion" scopes={["Read pages you share"]} onConnect={connect} />
</Md3ConnectorList>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
