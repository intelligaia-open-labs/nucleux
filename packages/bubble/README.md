# @nucleux/bubble

Chat message bubble with reactions — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Bubble`** — the message (`variant`: `default` | `secondary` | `muted` | `tinted` | `outline` | `ghost` | `destructive`; `align`: `start` | `end`)
- **`BubbleContent`** — the rounded surface (`asChild` for a clickable `<button>`/`<a>`)
- **`BubbleReactions`** — reaction pill pinned to an edge (`side`: `top` | `bottom`; `align`: `start` | `end`)
- **`BubbleGroup`** — stacks consecutive bubbles
- **`bubbleVariants({ variant, className })`** — the class string

## Install

```bash
pnpm add @nucleux/bubble @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@nucleux/bubble";

<BubbleGroup>
  <Bubble align="end">
    <BubbleContent>Can you summarise the report?</BubbleContent>
  </Bubble>
  <Bubble variant="muted">
    <BubbleContent>Revenue grew 12% quarter over quarter.</BubbleContent>
  </Bubble>
</BubbleGroup>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
