# @nucleux/md3-example-gallery

Material 3 Example Gallery — real, product-specific tasks that place an editable request in the composer — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, keyboard model and accessible names are those of [`@nucleux/example-gallery`](https://www.npmjs.com/package/@nucleux/example-gallery) (`ExampleGallery`) — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, elevation, state layers and motion (reduced under `prefers-reduced-motion`).

## Exports

- **`Md3ExampleGallery`** — curated examples as outlined M3 cards in a grid, a strip or `Md3Tabs` by category; fills the composer via `onSelect` or previews in an `Md3Dialog` first; `collapsed` folds to a text button
- **`Md3ExampleGalleryItem`** — one example card
- Types: `Md3ExampleGalleryProps`, `Md3ExampleGalleryItemProps`, `Md3ExampleGalleryVariant`, `Md3ExampleGallerySelectBehavior`, `ExampleGalleryExample`

## Install

```bash
pnpm add @nucleux/md3-example-gallery @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3ExampleGallery } from "@nucleux/md3-example-gallery";

<Md3ExampleGallery examples={examples} selectBehavior="preview" onSelect={(prompt) => setDraft(prompt)} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
