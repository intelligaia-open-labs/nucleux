# @nucleux/follow-up

FollowUp — AI answer with an editable assumption chip — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Install

```bash
pnpm add @nucleux/follow-up @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { FollowUp } from "@nucleux/follow-up";

<FollowUp
  answer="Three deals are at risk this quarter."
  assumption={{ label: "Assumed:", value: "Q3", hint: "tap to change" }}
  onChangeAssumption={() => {}}
/>;
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
