# @nucleux/caveat

Caveat — says what is incomplete, uncertain or out of date about an AI result — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

- **`Caveat`** — a calm reminder that AI output can be wrong, or (better) the specific limitation of this result. `variant`: `below-input` (default caption under the composer) / `output-footer` (filled note under output that will be acted on); `icon` (`null` to omit); `actions` (next steps such as "Review sources"). Rendered as `role="note"`.
- **`CaveatTooltip`** — the `info-tooltip` variant: wraps the generate control (e.g. `Iconography`), shows the caveat on hover and focus, and links it with `aria-describedby`. `content`, `side`, `showIcon`.

Caption-size, muted, never alarming or apologetic; once per surface, repeated only where output will be acted on.

## Install

```bash
pnpm add @nucleux/caveat @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Caveat, CaveatTooltip } from "@nucleux/caveat";
import { Iconography } from "@nucleux/iconography";

<Caveat>Aria may make mistakes. Verify important info.</Caveat>
<Caveat variant="output-footer" actions={<Button size="sm" variant="ghost">Review sources</Button>}>
  2 of 8 interviews could not be opened, so this summary reflects 6.
</Caveat>
<CaveatTooltip content="Output may be inaccurate"><Iconography label="Generate" /></CaveatTooltip>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
