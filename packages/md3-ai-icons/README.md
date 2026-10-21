# @nucleux/md3-ai-icons

Material 3 AI Icons — one reserved mark per AI meaning, always with words — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

The Material 3 twin of [`@nucleux/ai-icons`](https://www.npmjs.com/package/@nucleux/ai-icons): it shares that package's API — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, state layers and motion (with reduced-motion handling).

## Exports

- **`Md3AiIcon`** — one AI meaning (`role` ai-action / generated-content / agent-working / tool-use) with its reserved mark and `label`; generated content sits in an outlined assist chip
- **`Md3AiIcons`** — the AI presence mark: `variant` sparkle / thinking-orb / branded-mark, `size`, `tone`, `label`, `glyph`
- **`Md3AiIconProvider`** — sets the approved glyph per role once (shares its context with `AiIconProvider`)
- Glyphs: `Md3AiSparkleIcon`, `Md3AiGeneratedIcon`, `Md3AiWorkingIcon`, `Md3AiWandIcon`, `Md3AiRegenerateIcon`, `Md3AiToolIcon` (the same drawings as `@nucleux/ai-icons`)
- Shared vocabulary (re-exported from `@nucleux/ai-icons`): `useAiGlyph`, `aiGlyphs`, `defaultAiIconGlyphs`, types `AiIconRole`, `AiGlyphName`, `AiIconGlyphs`
- Types: `Md3AiIconProps`, `Md3AiIconsProps`, `Md3AiIconsVariant`, `Md3AiIconsSize`, `Md3AiIconsTone`, `Md3AiGlyphProps`, `Md3AiWorkingIconProps`, `Md3AiIconProviderProps`

## Install

```bash
pnpm add @nucleux/md3-ai-icons @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3AiIcon } from "@nucleux/md3-ai-icons";

<Md3AiIcon role="agent-working" label="Rewriting release note…" />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
