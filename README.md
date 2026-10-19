# Nucleux

**Agentic UI components for React** — a monorepo of composable, accessible,
Tailwind-powered components for building AI chat and agent interfaces. Install
the whole kit or a single component.

> Status: pre-release (`0.1.0`). Published under the `@nucleux` scope.

## Install

**Everything** (one package, tree-shakeable):

```bash
pnpm add @nucleux/react @nucleux/tokens
```

**A single component** (minimal footprint):

```bash
pnpm add @nucleux/button @nucleux/tokens
```

`react` / `react-dom` are peer dependencies. `@nucleux/tokens` ships the theme
CSS and the Tailwind preset (see Setup).

## Setup

Nucleux styles are Tailwind CSS v3 classes plus CSS variables, so your app needs
Tailwind v3 (`npm i -D tailwindcss@3 postcss autoprefixer`).

1. Add the preset to `tailwind.config.js` and include the Nucleux packages in
   `content`. The token stylesheet holds only the variables; your build
   generates the component classes, so without this glob components render unstyled:

   ```js
   import nucleux from "@nucleux/tokens/preset";

   export default {
     presets: [nucleux],
     content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./node_modules/@nucleux/*/dist/**/*.{js,cjs}"],
   };
   ```

   CommonJS config: `presets: [require("@nucleux/tokens/preset").default]`.

2. `postcss.config.js`: `export default { plugins: { tailwindcss: {}, autoprefixer: {} } };`

3. Your CSS entry has the Tailwind layers, and the token stylesheet is imported
   before it, once, near your app root:

   ```css
   /* src/index.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

   ```ts
   // src/main.tsx
   import "@nucleux/tokens/styles.css";
   import "./index.css";
   ```

## Usage

```tsx
// Full package
import { Button, Dialog, DialogHeader, DialogTitle } from "@nucleux/react";

// …or just what you need
import { Button } from "@nucleux/button";
```

```tsx
import { useState } from "react";
import { Thread, Message, AgentComposer } from "@nucleux/react";
import "@nucleux/tokens/styles.css";

export function Chat() {
  const [input, setInput] = useState("");
  return (
    <div className="flex h-[32rem] flex-col">
      <Thread>
        <Message role="assistant" content="Hey! What can I build for you?" />
      </Thread>
      <div className="p-4">
        <AgentComposer value={input} onValueChange={setInput} onSubmit={() => setInput("")} />
      </div>
    </div>
  );
}
```

## Packages

- **`@nucleux/react`** — umbrella; re-exports every component + hooks + `cn`.
- **`@nucleux/<component>`** — one package per component (`@nucleux/button`,
  `@nucleux/dialog`, `@nucleux/tabs`, …).
- **`@nucleux/tokens`** — theme CSS variables (`--nx-*`) + Tailwind preset.
- **`@nucleux/utils`** — `cn()` + shared types.
- **`@nucleux/hooks`** — `useAutoScroll`, `useCopyToClipboard`.
- **`@nucleux/mcp`** — MCP server so AI coding agents can discover and correctly
  use the library (see below).

## AI coding agents (Claude Code, Codex, Cursor)

Nucleux ships a design-system intelligence layer for coding agents: the
`@nucleux/mcp` server (curated page patterns, exact component contracts
generated from the sources, verified setup) and the `nucleux-design` skill
(a design-first workflow). Ask *"build a project management app with Nucleux"*
and the agent picks patterns, reads the real props and builds with them,
instead of guessing.

```bash
# Claude Code: MCP server + skill as one plugin
claude plugin marketplace add intelligaia-open-labs/nucleux
claude plugin install nucleux@nucleux-marketplace

# Codex
codex mcp add nucleux -- npx -y @nucleux/mcp
npx -y @nucleux/mcp init --codex --agents-md
```

```jsonc
// Cursor / Claude Desktop / Windsurf
{ "mcpServers": { "nucleux": { "command": "npx", "args": ["-y", "@nucleux/mcp"] } } }
```

Tools: `search_patterns`, `get_pattern`, `search_components`, `get_component`,
`validate_design`, `get_setup`, `list_components`, `list_examples`, `get_example`. Full guide,
example prompts and troubleshooting: [`packages/mcp`](packages/mcp/README.md).
Patterns and the workflow live in [`knowledge/`](knowledge/README.md);
benchmark in [`evals/`](evals/README.md).

### Components

Primitives (Button, IconButton, LinkButton, Badge, Chip, Checkbox,
Radio/RadioGroup, Switch, Select, Separator, Avatar, CardContainer, Alert,
Tooltip, SearchInput, Progress, Accordion) · Navigation (GlobalNav, Sidebar,
NavPanel, Tabs, Menu, Breadcrumb) · Overlays (Dialog, Popover, Toast) · Data
(Table) · Forms (RichCheckboxGroup, ModularConsent) · Agent/Chat (Message,
Thread, InputBar, AgentComposer, StreamingText, TypingIndicator, ToolCall,
Reasoning, CodeBlock, Suggestions) · Patterns (ActionTile, Checklist,
GettingStartedPill).

## Theming

Every component reads its colors from CSS variables (`--nx-*`). Override them on
`:root` or any scope, and toggle dark mode with a `.dark` class:

```css
:root {
  --nx-info: 262 83% 58%; /* HSL channels, no hsl() wrapper */
  --nx-radius: 1rem;
}
```

## Development (monorepo)

pnpm workspace. Dev/test/typecheck resolve `@nucleux/*` to source (no build
needed); `pnpm build` emits each package's `dist/`.

```bash
pnpm install
pnpm dev             # Storybook at http://localhost:6006
pnpm typecheck       # tsc across all packages
pnpm test            # Vitest (render + a11y + interaction)
pnpm build           # build every package (topological)
pnpm validate        # typecheck → test → build → build-storybook
```

```
packages/
  <component>/   # one package per component (@nucleux/<name>)
  utils/  hooks/  tokens/   # shared internals
  react/                    # umbrella (@nucleux/react)
```

## License

MIT
