# @nucleux/md3-disclosure

Material 3 Disclosure — a clear label that says where AI is involved, at the point it matters — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

The Material 3 twin of [`@nucleux/disclosure`](https://www.npmjs.com/package/@nucleux/disclosure): it shares that package's API — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, state layers and motion (with reduced-motion handling).

## Exports

- **`Md3Disclosure`** — `variant` header-badge / footer-attribution / input-chip / first-run-banner / pill / badge / banner; `label`, `icon`, `agentName`, `details` (opens an outlined Md3Card in place), `heading`, `policyHref`, `policyLabel`, `onDismiss`, `dismissLabel`
- Types: `Md3DisclosureProps`, `Md3DisclosureVariant`

## Install

```bash
pnpm add @nucleux/md3-disclosure @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Disclosure } from "@nucleux/md3-disclosure";

<Md3Disclosure variant="footer-attribution" agentName="Aria" details="Not checked: the figures." />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
