# @nucleux/example-gallery

Example Gallery — a wall of curated outputs that shows users what's possible before they type — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

A clickable set of finished examples. Each card names a real task and what
came back; choosing it hands its prompt to `onSelect` (place it in the
composer — never send it).

## Exports

- **`ExampleGallery`** — the gallery
- **`ExampleGalleryItem`** — one card (a button), for custom layouts
- Types: `ExampleGalleryProps`, `ExampleGalleryItemProps`, `ExampleGalleryExample`, `ExampleGalleryVariant`, `ExampleGallerySelectBehavior`

## Variants

| `variant` | Use |
| --- | --- |
| `card-grid` (default) | A 2–3 column grid filling an empty thread or compose modal. |
| `horizontal-strip` | A scrolling row when vertical space is tight. |
| `categorized-tabs` | Tabs by `category` above the grid. |

## Behaviour

- `examples`: `{ id?, title, description?, prompt, output?, needs?, category?, icon?, preview? }`, capped at `max` (12).
- `selectBehavior="fill"` (default) calls `onSelect(prompt, example)`; `"preview"` opens a Dialog with the prompt and output and a "Use this prompt" button, then returns focus.
- `collapsed` folds it to a "Show examples" button (`onExpand`) once work has started.

## Usage

```tsx
import { ExampleGallery } from "@nucleux/example-gallery";

<ExampleGallery
  examples={[{ title: "Q2 recap", description: "Revenue, churn and wins", prompt: "Summarise Q2…" }]}
  onSelect={(prompt) => setDraft(prompt)}
/>
```

## Install

```bash
pnpm add @nucleux/example-gallery @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
