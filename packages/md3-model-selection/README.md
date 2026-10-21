# @nucleux/md3-model-selection

Material 3 Model Selection — choose which model answers, and know what changes when you do — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

This is the Material 3 twin of [`@nucleux/model-selection`](https://github.com/intelligaia-open-labs/nucleux/tree/main/packages/model-selection) and **shares its API**: the same props, callbacks, keyboard model and accessible names. Switch families by changing only the import.

## Exports

- **`Md3ModelSelection`** — `variant` `"dropdown"` (an M3 menu listbox behind a small text button), `"tradeoff"` (outlined M3 radio cards with speed, quality and cost), or `"auto-route"` (an M3 switch that reveals the picker when off)
- Types: `Md3ModelSelectionProps`, `Md3ModelSelectionVariant`, `ModelOption`

## Install

```bash
pnpm add @nucleux/md3-model-selection @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3ModelSelection } from "@nucleux/md3-model-selection";

<Md3ModelSelection
  defaultValue="sonnet"
  onValueChange={setModel}
  models={[
    { value: "opus", label: "Opus", description: "Hard problems and long documents", recommended: true },
    { value: "sonnet", label: "Sonnet", description: "Everyday writing and analysis" },
    { value: "haiku", label: "Haiku", description: "Quick answers", disabled: true, unavailableReason: "Not in your plan" },
  ]}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
