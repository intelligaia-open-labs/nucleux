# @nucleux/marker

Inline note or divider marker for timelines and threads — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Marker`** — the row (`variant`: `default` | `separator` | `border`; `asChild`)
- **`MarkerIcon`** — decorative leading icon
- **`MarkerContent`** — the text
- **`markerVariants({ variant, className })`** — the class string

## Install

```bash
pnpm add @nucleux/marker @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Marker, MarkerContent, MarkerIcon } from "@nucleux/marker";

<Marker variant="separator">
  <MarkerContent>Yesterday</MarkerContent>
</Marker>
<Marker>
  <MarkerIcon><Sparkles /></MarkerIcon>
  <MarkerContent>Switched model to Opus</MarkerContent>
</Marker>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
