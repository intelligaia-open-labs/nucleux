# @nucleux/button-group

Group of joined buttons with shared borders — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`ButtonGroup`** — `role="group"` container (`orientation`: `horizontal` | `vertical`); nest groups for spaced clusters
- **`ButtonGroupText`** — static text/icon segment (`asChild` to render a `<label>`)
- **`ButtonGroupSeparator`** — divider between segments
- **`buttonGroupVariants({ orientation, className })`** — the class string

## Install

```bash
pnpm add @nucleux/button-group @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@nucleux/button-group";

<ButtonGroup aria-label="Formatting">
  <Button variant="secondary">Bold</Button>
  <Button variant="secondary">Italic</Button>
  <Button variant="secondary">Underline</Button>
</ButtonGroup>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
