# @nucleux/md3-iconography

Material 3 Iconography — controls that run AI, drawn with the reserved AI mark for their intent — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

The Material 3 twin of [`@nucleux/iconography`](https://www.npmjs.com/package/@nucleux/iconography): it shares that package's API — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, state layers and motion (with reduced-motion handling).

## Exports

- **`Md3Iconography`** — an Md3Button (or Md3IconButton with a plain tooltip when `iconOnly`) that runs AI, drawn with the reserved mark for its `intent` (generate / regenerate / transform); `label`, `agentName`, `tooltip`, `tooltipSide`, `working`, `workingLabel`, plus the twin's `variant` / `size`, mapped to M3 button roles
- Types: `Md3IconographyProps`, `Md3IconographyIntent`

## Install

```bash
pnpm add @nucleux/md3-iconography @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Iconography } from "@nucleux/md3-iconography";

<Md3Iconography intent="transform" label="Rewrite" variant="secondary" />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
