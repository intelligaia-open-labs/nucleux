# @nucleux/md3-preset-styles

Material 3 Preset Styles — named styles for how replies are written, previewed and switchable mid-conversation — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, keyboard model, states and accessible names are those of [`@nucleux/preset-styles`](https://www.npmjs.com/package/@nucleux/preset-styles) (`PresetStyles`) — the props types are re-exported from it and both run on its `usePresetStyles` — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, elevation, state layers and motion (reduced under `prefers-reduced-motion`).

## Exports

- **`Md3PresetStyles`** — `variant="menu"`: the Style control in `Md3AgentComposer`'s toolbar opens "Use style" — styles on the left (secondary-container for the chosen one), a sample reply on the right that follows pointer and focus, Create & edit styles (an outlined card with a segmented "Start from", linear progress, then a review card with filled text fields). `"grid"` / `"list"`: swatches on M3 container roles with a primary outline.
- Types: `Md3PresetStylesProps`, `Md3PresetStyle`, `Md3PresetStylesVariant`, `Md3PresetStylesView`, `Md3PresetStylesNotice`, `Md3PresetStyleSwatch`, `Md3PresetStyleReference`, `Md3PresetStyleRequest`, `Md3PresetStyleDraft`, `Md3PresetStyleSource`

## Install

```bash
pnpm add @nucleux/md3-preset-styles @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3PresetStyles } from "@nucleux/md3-preset-styles";

<Md3PresetStyles
  variant="menu"
  styles={styles}
  previewPrompt="Summarize the October release."
  onGenerateStyle={(req) => api.generateStyle(req)}
  onSubmit={(text, style) => send(text, { style })}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
