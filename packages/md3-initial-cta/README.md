# @nucleux/md3-initial-cta

Material 3 Initial CTA — the large, inviting composer that anchors an empty workspace — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, keyboard model and accessible names are those of [`@nucleux/initial-cta`](https://www.npmjs.com/package/@nucleux/initial-cta) (`InitialCta`) — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, elevation, state layers and motion (reduced under `prefers-reduced-motion`).

## Exports

- **`Md3InitialCta`** — the empty-state composer: an open headline, one supporting line and `Md3OpenInput`, with optional `suggestions` (`Md3SuggestedPrompts`) that place their prompt in the field; variants centered-hero / gradient-cta / multi-modal-row
- Types: `Md3InitialCtaProps`, `Md3InitialCtaVariant`, `Md3InitialCtaHeadingLevel`

## Install

```bash
pnpm add @nucleux/md3-initial-cta @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3InitialCta } from "@nucleux/md3-initial-cta";

<Md3InitialCta
  aria-label="Message Aria"
  description="Ask about your accounts, draft emails, or analyse data."
  suggestions={["Summarise renewal risks", "Draft a follow-up to Acme"]}
  onSubmit={send}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
