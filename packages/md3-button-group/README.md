# @nucleux/md3-button-group

Material 3 button group — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Md3ButtonGroup`** — root (`variant="standard" | "connected"`, `size="xs" | "sm" | "md" | "lg" | "xl"`, `shape="round" | "square"`, `buttonVariant`, `selectionMode="none" | "single" | "multiple"`, `selectionRequired`, `value` / `defaultValue` / `onValueChange`)
- **`Md3ButtonGroupItem`** — a button in the group (`value`, `variant`, `icon`); toggles with `aria-pressed` when the group is selectable
- Types: `Md3ButtonGroupProps`, `Md3ButtonGroupItemProps`, `Md3ButtonGroupVariant`, `Md3ButtonGroupSize`, `Md3ButtonGroupShape`, `Md3ButtonGroupSelectionMode`, `Md3ButtonGroupItemVariant`

## Install

```bash
pnpm add @nucleux/md3-button-group @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3ButtonGroup, Md3ButtonGroupItem } from "@nucleux/md3-button-group";

<Md3ButtonGroup aria-label="Time range" variant="connected" selectionMode="single" defaultValue="week">
  <Md3ButtonGroupItem value="day">Day</Md3ButtonGroupItem>
  <Md3ButtonGroupItem value="week">Week</Md3ButtonGroupItem>
  <Md3ButtonGroupItem value="month">Month</Md3ButtonGroupItem>
</Md3ButtonGroup>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
