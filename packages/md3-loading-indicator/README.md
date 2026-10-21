# @nucleux/md3-loading-indicator

Material 3 loading indicator — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Md3LoadingIndicator`** — the M3 Expressive shape-morphing indicator, indeterminate `role="progressbar"`; `variant` default/contained, `size` in px (default 48), `aria-label` (default "Loading"). Holds still and fades gently under `prefers-reduced-motion`.
- Types: `Md3LoadingIndicatorProps`, `Md3LoadingIndicatorVariant`

## Install

```bash
pnpm add @nucleux/md3-loading-indicator @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3LoadingIndicator } from "@nucleux/md3-loading-indicator";

<Md3LoadingIndicator aria-label="Loading messages" />
<Md3LoadingIndicator variant="contained" aria-label="Generating a reply" />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
