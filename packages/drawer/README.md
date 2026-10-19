# @nucleux/drawer

Draggable edge drawer with focus trap and scroll lock — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Drawer`** — root; `open` / `defaultOpen` / `onOpenChange`, `direction` (`"bottom"` default, `"top"`, `"left"`, `"right"`), `dismissible`
- **`DrawerTrigger`**, **`DrawerClose`** — buttons that open / close it (`asChild` supported)
- **`DrawerContent`** — the `role="dialog"` panel (portalled, with overlay, focus trap, scroll lock, Escape and drag-to-dismiss)
- **`DrawerHeader`**, **`DrawerTitle`**, **`DrawerDescription`**, **`DrawerFooter`**
- **`DrawerPortal`**, **`DrawerOverlay`** — the building blocks DrawerContent uses

## Install

```bash
pnpm add @nucleux/drawer @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@nucleux/drawer";

<Drawer>
  <DrawerTrigger asChild><Button variant="secondary">Open drawer</Button></DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Agent budget</DrawerTitle>
      <DrawerDescription>Set how many tool calls the agent may make per run.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <Button>Save</Button>
      <DrawerClose asChild><Button variant="secondary">Cancel</Button></DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
