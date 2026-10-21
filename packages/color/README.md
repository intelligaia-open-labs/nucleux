# @nucleux/color

Color — a reserved AI accent and working treatment that signals AI is active — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

- **`AiColor`** — a surface in the reserved AI accent. `variant`: `accent-border` (default; edge on streaming copy) / `soft-glow` (halo round an active region) / `background-tint` (fill behind AI-generated content); `working` (pulsing ring + streaming caret, `aria-busy`); `label` (the words that travel with the colour, in a polite live region); `asChild`
- **`AiColorHighlight`** — an inline `<mark>` in the accent
- **`AiColorDot`** (`pulse`) — decorative accent dot; always put words beside it
- **`AiColorWorkingRing`** — the "AI is working" treatment as an overlay ring for any `relative` element (used by `@nucleux/agent-avatar`)
- **`aiColorClasses`** — the accent and working classes (`text`, `fill`, `surface`, `border`, `ring`, `working`) on the preset's `brand` tokens

One accent, used sparingly, never alone: pair it with words. All motion stops under `prefers-reduced-motion`.

## Install

```bash
pnpm add @nucleux/color @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { AiColor, AiColorHighlight } from "@nucleux/color";

<AiColor variant="accent-border" working label="Streaming">Analysing your Q2 numbers</AiColor>
<AiColor variant="background-tint" label="Aria suggests">
  Follow up with <AiColorHighlight>Acme Corp</AiColorHighlight> first.
</AiColor>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
