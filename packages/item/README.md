# @nucleux/item

Flexible list row with media, content and actions — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Item`** — the row (`variant`: `default` | `outline` | `muted`; `size`: `default` | `sm`; `asChild` for links)
- **`ItemMedia`** (`variant`: `default` | `icon` | `image`), **`ItemContent`**, **`ItemTitle`**, **`ItemDescription`**, **`ItemActions`**
- **`ItemHeader`**, **`ItemFooter`** — full-width rows above / below
- **`ItemGroup`** — `role="list"` wrapper; **`ItemSeparator`** — rule between items
- **`itemVariants`**, **`itemMediaVariants`** — the class strings

## Install

```bash
pnpm add @nucleux/item @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@nucleux/item";

<Item variant="outline">
  <ItemMedia variant="icon"><ShieldAlert /></ItemMedia>
  <ItemContent>
    <ItemTitle>Security alert</ItemTitle>
    <ItemDescription>New sign-in from Chrome on macOS.</ItemDescription>
  </ItemContent>
  <ItemActions><Button variant="secondary" size="sm">Review</Button></ItemActions>
</Item>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
