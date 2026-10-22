# @nucleux/md3-agent-composer

Material 3 agent task composer — grows to eight lines, then scrolls with Expand — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Install

```bash
pnpm add @nucleux/md3-agent-composer @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

It renders `Md3OpenInput` (the nucleux.in Material 3 composer) with the field above the toolbar (`layout="stacked"`; pass `"auto"` for the one-row bar): `leftActions` after an optional `+` (`onAdd`), `rightActions` and the `model` chip before the mic (`onVoice`) and the round send.

```tsx
import { Md3AgentComposer } from "@nucleux/md3-agent-composer";
import { Md3OpenInputModelChip } from "@nucleux/md3-open-input";

<Md3AgentComposer
  value={draft}
  onValueChange={setDraft}
  onSubmit={send}
  onAdd={openAddMenu}
  model={<Md3OpenInputModelChip name="Balanced" detail="High" />}
  onVoice={startDictation}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
