# @nucleux/md3-caveat

Material 3 Caveat — a calm, specific note on what to check about an AI result — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

The Material 3 twin of [`@nucleux/caveat`](https://www.npmjs.com/package/@nucleux/caveat): it shares that package's API — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, state layers and motion (with reduced-motion handling).

## Exports

- **`Md3Caveat`** — a `note`: `variant` below-input / output-footer, `icon`, `actions`
- **`Md3CaveatTooltip`** — the info-tooltip caveat riding an AI control, linked with `aria-describedby`; `content`, `side`, `showIcon`
- Types: `Md3CaveatProps`, `Md3CaveatTooltipProps`, `Md3CaveatVariant`

## Install

```bash
pnpm add @nucleux/md3-caveat @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Caveat } from "@nucleux/md3-caveat";

<Md3Caveat variant="output-footer">2 of 8 interviews could not be opened, so this summary reflects 6.</Md3Caveat>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
