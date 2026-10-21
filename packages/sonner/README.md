# @nucleux/sonner

Sonner — toast notifications (the sonner library) styled with Nucleux tokens — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Toaster`** — render once at the app root; accepts every [sonner `Toaster` prop](https://sonner.emilkowal.ski/toaster) (`position`, `richColors`, `closeButton`, `duration`…)
- **`toast`** — `toast("…")`, `toast.success`, `toast.error`, `toast.warning`, `toast.info`, `toast.loading`, `toast.promise`, `toast.dismiss`

For a provider-based toast with Nucleux variants, see `@nucleux/toast`.

## Install

```bash
pnpm add @nucleux/sonner @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Toaster, toast } from "@nucleux/sonner";

// once, at the app root
<Toaster position="bottom-right" />

// anywhere
toast.success("Summary shared with the team");
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
