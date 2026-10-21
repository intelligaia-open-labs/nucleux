# @nucleux/md3-side-sheet

Material 3 side sheet — standard (in-layout) and modal, left or right edge — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Md3SideSheet`** — root (`variant="standard" | "modal"`, `side="left" | "right"`, `open` / `onOpenChange`; modal adds a scrim, focus trap, Escape / scrim close, focus restore and scroll lock)
- **`Md3SideSheetHeader`** — headline with optional back (`onBack`) and close icon buttons; labels the sheet
- **`Md3SideSheetBody`** — scrollable content
- **`Md3SideSheetActions`** — bottom action row with a divider

## Install

```bash
pnpm add @nucleux/md3-side-sheet @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3SideSheet, Md3SideSheetHeader, Md3SideSheetBody, Md3SideSheetActions } from "@nucleux/md3-side-sheet";

<Md3SideSheet variant="modal" open={open} onOpenChange={setOpen}>
  <Md3SideSheetHeader>Filters</Md3SideSheetHeader>
  <Md3SideSheetBody>…</Md3SideSheetBody>
  <Md3SideSheetActions>
    <Md3Button onClick={() => setOpen(false)}>Apply</Md3Button>
  </Md3SideSheetActions>
</Md3SideSheet>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
