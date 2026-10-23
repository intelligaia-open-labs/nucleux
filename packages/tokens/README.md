# @nucleux/tokens

Design tokens (CSS variables) + Tailwind preset for Nucleux — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Install

```bash
pnpm add @nucleux/tokens
```

## Usage

```ts
// Theme stylesheet (import once near your app root)
import "@nucleux/tokens/styles.css";

// Tailwind preset
import nucleux from "@nucleux/tokens/preset";
export default { presets: [nucleux], content: ["./src/**/*.{ts,tsx}"] };
```

## Palette and fonts

The default theme is nucleux.in's warm neutral "ink" scale (`--nx-ink-0` … `--nx-ink-950`):
`foreground` ink-950, `muted-foreground` ink-500 (#5d5d54), `faint` ink-400 (#88887d, hints and
meta text), `border` #dcdcd5, `input` #c4c4bc, `primary` #0f172a (the site's agentic primary button), `ring` ink-950. The orange AI accent is `brand`
(#d97706).

Type: `--nx-font-sans` (Inter, set on `html`/`body`), `--nx-font-mono` (JetBrains Mono) and
`--nx-font-md` (Roboto, on every `@nucleux/md3-*` component) — Tailwind `font-sans`, `font-mono`,
`font-md`. Load the web fonts in your app, e.g.:

```html
<!-- Inter 4, the build nucleux.in uses (the tokens turn on its ss01/cv11 features) -->
<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Roboto:wght@400;500;700&display=swap"
/>
```

## License

MIT © Nucleux
