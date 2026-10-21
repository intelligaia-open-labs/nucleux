# @nucleux/model-selection

ModelSelection — choose which model handles the generation — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

- **`ModelSelection`** — lets the user pick the model for the task. Props: `models`, `value` / `defaultValue` / `onValueChange`, `label`, and
  - `variant`: `"dropdown"` (default — a composer-anchored listbox: arrow keys, Home/End, Escape returns focus to the trigger), `"tradeoff"` (radio cards with speed, quality and cost in human terms), `"auto-route"` (on by default — "Aria picks the model per task", shows `routedModel`; switching it off reveals the dropdown)
  - `autoRoute` / `defaultAutoRoute` (true) / `onAutoRouteChange`, `routedModel`, `agentName`
- **`ModelOption`**: `value`, `label`, `description`, `icon`, plus `recommended` (a "Recommended" badge), `speed`, `quality`, `cost` (human terms, never parameter names), `disabled` with `unavailableReason` (the row stays and says what answers instead).
- Types: `ModelSelectionProps`, `ModelSelectionVariant`, `ModelOption`.

## Install

```bash
pnpm add @nucleux/model-selection @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { ModelSelection } from "@nucleux/model-selection";

<ModelSelection
  variant="tradeoff"
  defaultValue="sonnet"
  models={[
    { value: "opus", label: "Opus", quality: "Best quality", speed: "Slower", cost: "$$$" },
    { value: "sonnet", label: "Sonnet", quality: "Balanced", speed: "Medium", cost: "$$", recommended: true },
    { value: "haiku", label: "Haiku", quality: "Good enough", speed: "Fastest", cost: "$" },
  ]}
  onValueChange={setModel}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
