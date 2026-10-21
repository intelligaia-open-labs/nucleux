# @nucleux/spinner

Animated loading indicator — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Spinner`** — spinning icon with `role="status"` and `aria-label="Loading"` (override the label to say what is loading)

## Install

```bash
pnpm add @nucleux/spinner @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Spinner } from "@nucleux/spinner";

<Spinner />
<Button disabled leftIcon={<Spinner aria-label="Saving" />}>Saving…</Button>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
