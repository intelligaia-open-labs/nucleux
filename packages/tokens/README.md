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

## License

MIT © Nucleux
