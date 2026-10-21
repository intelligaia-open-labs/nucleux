# @nucleux/md3-templates

Material 3 Templates — fill-in-the-blank prompts, prefilled lists and a categorised template browser — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, keyboard model and accessible names are those of [`@nucleux/templates`](https://www.npmjs.com/package/@nucleux/templates) (`Templates`) — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, elevation, state layers and motion (reduced under `prefers-reduced-motion`).

## Exports

- **`Md3Templates`** — a fill-in-the-blank sentence: dashed slots turn into secondary-container chips; required slots hold "Use this prompt"
- **`Md3TemplatesList`** — fully written prompts as outlined M3 rows
- **`Md3TemplatesBrowser`** — categories as vertical, navigation-drawer-style tabs with the category's templates
- Types: `Md3TemplatesProps`, `Md3TemplatesListProps`, `Md3TemplatesBrowserProps`, `PromptSegment`, `PromptSlot`, `TemplatesListItem`, `TemplatesCategory`

## Install

```bash
pnpm add @nucleux/md3-templates @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Templates } from "@nucleux/md3-templates";

<Md3Templates
  segments={["Summarise ", { slot: "meeting", placeholder: "the standup", required: true }, " for the team."]}
  onComplete={(prompt) => setDraft(prompt)}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
