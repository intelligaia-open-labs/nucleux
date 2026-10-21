# @nucleux/md3-split-button

Material 3 split button — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Md3SplitButton`** — leading action button plus a trailing menu button (`variant="filled" | "tonal" | "elevated" | "outlined"`, `size="xs" | "sm" | "md" | "lg" | "xl"`, `icon`, `onClick`, `menu`, `menuLabel`, `menuAlign`, `open` / `defaultOpen` / `onOpenChange`, `disabled`)
- Types: `Md3SplitButtonProps`, `Md3SplitButtonVariant`, `Md3SplitButtonSize`, `Md3SplitButtonMenuAlign`

Fill `menu` with `Md3MenuItem` / `Md3MenuDivider` from `@nucleux/md3-menu`.

## Install

```bash
pnpm add @nucleux/md3-split-button @nucleux/md3-menu @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3SplitButton } from "@nucleux/md3-split-button";
import { Md3MenuItem } from "@nucleux/md3-menu";

<Md3SplitButton
  onClick={save}
  menuLabel="More save options"
  menu={
    <>
      <Md3MenuItem onClick={saveCopy}>Save a copy</Md3MenuItem>
      <Md3MenuItem onClick={exportPdf}>Export as PDF</Md3MenuItem>
    </>
  }
>
  Save
</Md3SplitButton>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
