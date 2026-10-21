# @nucleux/dropdown-menu

Dropdown menu of actions opened from a trigger — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`DropdownMenu`** — root; owns the open state (controlled with `open`/`onOpenChange` or uncontrolled)
- **`DropdownMenuTrigger`** — the button that opens it (`asChild` to use your own `Button`)
- **`DropdownMenuContent`** — the panel (`align`, `side`)
- **`DropdownMenuItem`** — an action (`variant="destructive"`, `inset`, `onSelect`)
- **`DropdownMenuLabel`**, **`DropdownMenuGroup`**, **`DropdownMenuSeparator`**, **`DropdownMenuShortcut`**

## Install

```bash
pnpm add @nucleux/dropdown-menu @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@nucleux/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger aria-label="Actions">⋯</DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onSelect={edit}>Edit</DropdownMenuItem>
    <DropdownMenuItem variant="destructive" onSelect={remove}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
