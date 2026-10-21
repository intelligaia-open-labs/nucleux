# @nucleux/input-group

Input with attached icons, text and buttons — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`InputGroup`** — bordered root; shows the focus ring and the invalid state of its control
- **`InputGroupAddon`** — `align`: `inline-start` | `inline-end` | `block-start` | `block-end`; clicking it focuses the control
- **`InputGroupButton`** — compact Nucleux `Button` (`size`: `xs` | `sm` | `icon-xs` | `icon-sm`; ghost by default)
- **`InputGroupText`** — muted inline text
- **`InputGroupInput`**, **`InputGroupTextarea`** — the control (Nucleux `Input` / `Textarea` without their own border)
- **`inputGroupAddonVariants`**, **`inputGroupButtonVariants`** — class helpers

## Install

```bash
pnpm add @nucleux/input-group @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@nucleux/input-group";

<InputGroup>
  <InputGroupInput placeholder="Search…" aria-label="Search" />
  <InputGroupAddon><Search /></InputGroupAddon>
  <InputGroupAddon align="inline-end">
    <InputGroupButton size="icon-xs" aria-label="Clear"><X /></InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
