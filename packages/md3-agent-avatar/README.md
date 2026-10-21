# @nucleux/md3-agent-avatar

Material 3 Agent Avatar — one non-photographic mark for the agent, with its working state on the mark — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

The Material 3 twin of [`@nucleux/agent-avatar`](https://www.npmjs.com/package/@nucleux/agent-avatar): it shares that package's API — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, state layers and motion (with reduced-motion handling).

## Exports

- **`Md3AgentAvatar`** — the agent's mark on md-primary-container, named "<name>, AI agent": `name`, `src`, `glyph`, `size` sm/md/lg, `shape` circle/rounded, `working` (an Md3CircularProgress ring on the mark), `status` online/offline/working, `statusLabel`, `descriptor`, `decorative`
- Types: `Md3AgentAvatarProps`, `Md3AgentAvatarSize`, `Md3AgentAvatarShape`, `Md3AgentAvatarStatus`

## Install

```bash
pnpm add @nucleux/md3-agent-avatar @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3AgentAvatar } from "@nucleux/md3-agent-avatar";

<Md3AgentAvatar name="Aria" working statusLabel="Generating…" />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
