# @nucleux/name

Name — a consistent name and role for the AI so it can be referred to and remembered — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

- **`AgentName`** — the agent's name, presented the same everywhere. `name` (required); `variant`: `wordmark` / `name-status` / `name-avatar-lockup` (default); `descriptor` (default "AI agent"); `status` (verb phrase → "Aria is drafting", polite live region); `working`; `formerName` ("formerly Aria" after a rename); `avatarSrc`, `avatarGlyph`

The lockup and status variants use `AgentAvatar` from `@nucleux/agent-avatar`. Keep the name short (≤ 12 characters), pronounceable, capitalised consistently, and never a real person's name.

## Install

```bash
pnpm add @nucleux/name @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { AgentName } from "@nucleux/name";

<AgentName name="Aria" descriptor="Intelligaia agent" />
<AgentName name="Aria" variant="name-status" status={thinking ? "thinking" : undefined} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
