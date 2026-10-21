# @nucleux/md3-fab-menu

Material 3 floating action button menu — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Md3FabMenu`** — a FAB (`label`, `icon`, `fabSize` small/regular/large) that turns into a close button and opens a stack of items; `color` primary/secondary/tertiary, `align` start/end, `open`/`defaultOpen`/`onOpenChange`
- **`Md3FabMenuItem`** — one 56px pill action with `icon` and a label; choosing it closes the menu (call `preventDefault()` in `onClick` to keep it open)
- Types: `Md3FabMenuProps`, `Md3FabMenuItemProps`, `Md3FabMenuColor`, `Md3FabMenuFabSize`, `Md3FabMenuAlign`

## Install

```bash
pnpm add @nucleux/md3-fab-menu @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3FabMenu, Md3FabMenuItem } from "@nucleux/md3-fab-menu";

<Md3FabMenu label="Create" icon={<Plus />}>
  <Md3FabMenuItem icon={<MessageSquarePlus />} onClick={newChat}>New chat</Md3FabMenuItem>
  <Md3FabMenuItem icon={<FileText />} onClick={newDoc}>New document</Md3FabMenuItem>
</Md3FabMenu>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
