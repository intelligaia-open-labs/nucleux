# @nucleux/direction

Text direction (LTR/RTL) provider and hook — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`DirectionProvider`** — sets `dir` (`"ltr"` | `"rtl"`; `direction` is an alias) for components below it
- **`useDirection(localDir?)`** — returns `localDir`, else the provider's value, else `"ltr"`
- **`Direction`** — the `"ltr" | "rtl"` type

## Install

```bash
pnpm add @nucleux/direction @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { DirectionProvider, useDirection } from "@nucleux/direction";

<html dir="rtl">
  <DirectionProvider dir="rtl">
    <App />
  </DirectionProvider>
</html>

function Arrow() {
  const dir = useDirection();
  return dir === "rtl" ? <ArrowLeft /> : <ArrowRight />;
}
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
