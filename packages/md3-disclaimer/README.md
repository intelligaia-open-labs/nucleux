# @nucleux/md3-disclaimer

Material 3 Disclaimer — a short, honest statement of what the agent can and can't do — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, keyboard model and accessible names are those of [`@nucleux/disclaimer`](https://www.npmjs.com/package/@nucleux/disclaimer) (`Disclaimer`) — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, elevation, state layers and motion (reduced under `prefers-reduced-motion`).

## Exports

- **`Md3Disclaimer`** — what the agent can and can't do: a filled card with an info mark, a limitations card with a tertiary rule, or a one-line cutoff note; "Show all" past three points; labelled `groups` rows
- Types: `Md3DisclaimerProps`, `Md3DisclaimerVariant`, `DisclaimerGroup`

## Install

```bash
pnpm add @nucleux/md3-disclaimer @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Disclaimer } from "@nucleux/md3-disclaimer";

<Md3Disclaimer agentName="Aria" items={["Summarise documents", "Draft replies"]} cutoff="April 2026" />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
