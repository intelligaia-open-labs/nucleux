# @nucleux/consent

Consent — asks before the agent accesses something sensitive or acts — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

- **`Consent`** — the `inline-card` request: `title`, `description`, `permissions` (optional; each granted separately), `denyLabel` / `onDeny`, `secondaryLabel` / `onSecondary`, `allowLabel` / `onAllow`, `policyHref` / `policyLabel`
- **`ConsentDialog`** — the `blocking-modal`: the same request props plus `open` / `onOpenChange`. Escape and the backdrop don't close it; answering does.
- **`ConsentToggle`** — the `settings-toggle`: a Switch named by `title`, described by `description`; `checked` / `defaultChecked` / `onCheckedChange`

No dark patterns: Allow and Not now have equal weight, nothing should be preselected, and every request links to the full policy.

## Install

```bash
pnpm add @nucleux/consent @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Consent, ConsentDialog, ConsentToggle } from "@nucleux/consent";

<ConsentDialog open={open} onOpenChange={setOpen} title="Allow data to improve Aria?"
  description="Inputs never leave your tenant." policyHref="/privacy" onAllow={allow} onDeny={deny} />
<ConsentToggle title="Help improve Aria with my data" description="Anonymised. Opt out anytime." />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
