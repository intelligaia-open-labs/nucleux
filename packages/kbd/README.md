# @nucleux/kbd

Keyboard key and shortcut display — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Kbd`** — a single key (`<kbd>`), e.g. `Esc`, `⌘`
- **`KbdGroup`** — a key combination wrapping several `Kbd`s

## Install

```bash
pnpm add @nucleux/kbd @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Kbd, KbdGroup } from "@nucleux/kbd";

<KbdGroup>
  <Kbd>Ctrl</Kbd>
  <span>+</span>
  <Kbd>K</Kbd>
</KbdGroup>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
