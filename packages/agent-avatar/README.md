# @nucleux/agent-avatar

Avatar — a consistent, non-photographic mark that represents the AI on every surface — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

- **`AgentAvatar`** — the agent's mark, built on Avatar. `name` (required; accessible name "<name>, AI agent"); `src` (non-photographic image); `glyph` (default: the reserved AI sparkle from `@nucleux/ai-icons`, or a letter); `size` sm/md/lg (24/32/40); `shape` circle/rounded; `working`; `status` online/offline/working; `statusLabel`; `descriptor`; `decorative`

Spec variants by props: `circular-mark` (default), `animated-mark` (`working` — the pulsing ring from `@nucleux/color`, still under reduced motion), `status-aware` (`status` — a dot, with its words in a polite live region).

Never a photo or a famous character. Use `shape="rounded"` where people in the same list are circles, so the agent differs by shape, not only colour.

## Install

```bash
pnpm add @nucleux/agent-avatar @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { AgentAvatar } from "@nucleux/agent-avatar";

<AgentAvatar name="Aria" />
<AgentAvatar name="Aria" working statusLabel="Generating…" />
<AgentAvatar name="Aria" status="online" statusLabel="Online · ready" />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
