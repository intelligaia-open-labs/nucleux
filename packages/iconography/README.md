# @nucleux/iconography

Iconography — reserved AI action controls: sparkle = generate, refresh = regenerate, wand = transform — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

- **`Iconography`** — a Button that runs AI, drawn with the reserved mark for its `intent`: `generate` (sparkle) / `regenerate` (refresh) / `transform` (wand). `label` (the verb, required); `iconOnly` (named "<label> with <agentName>" plus a Tooltip); `agentName`; `tooltip`, `tooltipSide`; `working` + `workingLabel` (mark swaps to the working mark, `aria-disabled`, clicks ignored, announced politely). All Button props (`variant`, `size`, `onClick`…) pass through.

Spec variants: `sparkle-only` = `iconOnly`; `sparkle-label` = `intent="generate"` with a label; `wand-transform` = `intent="transform"`.

Reserve it for actions that call a model — meaning collapses if every button has a sparkle. Glyphs come from `@nucleux/ai-icons` (and honour its `AiIconProvider`).

## Install

```bash
pnpm add @nucleux/iconography @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Iconography } from "@nucleux/iconography";

<Iconography label="Generate" agentName="Aria" iconOnly onClick={generate} />
<Iconography intent="transform" label="Rewrite" variant="secondary"
  working={busy} workingLabel="Rewriting…" onClick={rewrite} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
