# @nucleux/md3-consent

Material 3 Consent — asks before the agent accesses something sensitive, with two real choices — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

The Material 3 twin of [`@nucleux/consent`](https://www.npmjs.com/package/@nucleux/consent): it shares that package's API — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, state layers and motion (with reduced-motion handling).

## Exports

- **`Md3Consent`** — the inline-card request: `title`, `description`, `permissions`, `denyLabel` / `onDeny`, `secondaryLabel` / `onSecondary`, `allowLabel` / `onAllow`, `policyHref`, `policyLabel`
- **`Md3ConsentDialog`** — the blocking-modal request on Md3Dialog (`open`, `onOpenChange`); Escape and the scrim do not close it
- **`Md3ConsentToggle`** — the settings-toggle: an Md3Switch named by `title`, described by `description`
- Types: `Md3ConsentProps`, `Md3ConsentRequestProps`, `Md3ConsentDialogProps`, `Md3ConsentToggleProps`, `ConsentPermission`

## Install

```bash
pnpm add @nucleux/md3-consent @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Consent } from "@nucleux/md3-consent";

<Md3Consent title="Allow workspace access?" permissions={[{ id: "read", label: "Read selected files" }]} onAllow={(ids) => grant(ids)} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
