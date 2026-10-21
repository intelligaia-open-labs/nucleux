# @nucleux/md3-color

Material 3 AI Color — the reserved AI accent and working treatment in M3 colour roles — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

The Material 3 twin of [`@nucleux/color`](https://www.npmjs.com/package/@nucleux/color): it shares that package's API — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, state layers and motion (with reduced-motion handling).

## Exports

- **`Md3AiColor`** — a surface painted with the reserved AI role: `variant` accent-border (primary edge) / soft-glow (the M3 presence outline) / background-tint (the agent's primary-container ground); `working`; `label` (announced politely); `asChild`
- **`Md3AiColorHighlight`** — an inline `<mark>` on primary-container
- **`Md3AiColorDot`** — a decorative md-primary dot (`pulse`)
- **`Md3AiColorWorkingRing`** — the pulsing md-primary working ring overlay
- **`md3AiColorClasses`** — the AI accent as Tailwind classes on M3 roles (same keys as `aiColorClasses`)
- Types: `Md3AiColorProps`, `Md3AiColorHighlightProps`, `Md3AiColorDotProps`, `Md3AiColorWorkingRingProps`, `Md3AiColorToken`, `Md3AiColorVariant`

## Install

```bash
pnpm add @nucleux/md3-color @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3AiColor } from "@nucleux/md3-color";

<Md3AiColor variant="accent-border" working label="Streaming">Analysing your Q2 numbers</Md3AiColor>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
