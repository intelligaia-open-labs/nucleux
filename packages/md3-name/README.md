# @nucleux/md3-name

Material 3 Agent Name — a short, consistent name and role for the agent on every surface — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

The Material 3 twin of [`@nucleux/name`](https://www.npmjs.com/package/@nucleux/name): it shares that package's API — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, state layers and motion (with reduced-motion handling).

## Exports

- **`Md3AgentName`** — the agent's name: `variant` wordmark / name-status ("Aria is drafting", announced politely) / name-avatar-lockup; `descriptor`, `status`, `working`, `formerName`, `avatarSrc`, `avatarGlyph`
- Types: `Md3AgentNameProps`, `Md3AgentNameVariant`

## Install

```bash
pnpm add @nucleux/md3-name @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3AgentName } from "@nucleux/md3-name";

<Md3AgentName name="Aria" variant="name-status" status="drafting" />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
