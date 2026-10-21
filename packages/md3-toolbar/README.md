# @nucleux/md3-toolbar

Material 3 docked and floating toolbar — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Md3Toolbar`** — `role="toolbar"` with arrow-key roving focus (`type="docked" | "floating"`, `orientation="horizontal" | "vertical"` for floating, `color="standard" | "vibrant"`, `loop`)
- **`Md3ToolbarIconButton`** — an `Md3IconButton` coloured for the toolbar; `selected` for toggled actions
- Types: `Md3ToolbarProps`, `Md3ToolbarIconButtonProps`, `Md3ToolbarType`, `Md3ToolbarOrientation`, `Md3ToolbarColor`

## Install

```bash
pnpm add @nucleux/md3-toolbar @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Toolbar, Md3ToolbarIconButton } from "@nucleux/md3-toolbar";

<Md3Toolbar type="floating" color="vibrant" aria-label="Text formatting">
  <Md3ToolbarIconButton aria-label="Bold" selected><Bold /></Md3ToolbarIconButton>
  <Md3ToolbarIconButton aria-label="Italic"><Italic /></Md3ToolbarIconButton>
</Md3Toolbar>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
