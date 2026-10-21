# @nucleux/disclosure

Disclosure — marks where AI is involved: an AI action, AI at work, or AI-generated content — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

- **`Disclosure`** — tells people they are dealing with an AI and marks what it generated. `variant`: `header-badge` / `footer-attribution` / `input-chip` / `first-run-banner`, plus the original `pill` (default) / `badge` / `banner`; `label` / `children`; `icon`; `agentName` (default copy); `details` (label becomes an `aria-expanded` toggle that opens what the agent did, used and didn't check, in place); `heading`, `policyHref`, `policyLabel`, `onDismiss`, `dismissLabel` (banners)

Marks come from `@nucleux/ai-icons` (the "generated with AI" glyph, honouring `AiIconProvider`) and `@nucleux/color` (the input-chip dot). The first-run banner hides itself on dismiss and calls `onDismiss` — persist that so it shows once per user.

## Install

```bash
pnpm add @nucleux/disclosure @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Disclosure } from "@nucleux/disclosure";

<Disclosure variant="header-badge" />
<Disclosure variant="footer-attribution" agentName="Aria"
  details="Used: Q2 export. Not checked: nobody reviewed the figures." />
<Disclosure variant="first-run-banner" agentName="Aria" policyHref="/ai-policy" onDismiss={markSeen} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
