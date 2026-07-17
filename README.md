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

1. Import the token stylesheet once, near your app root:

   ```ts
   import "@nucleux/tokens/styles.css";
   ```

2. Add the preset to your `tailwind.config.ts` and include the packages in
   `content` so their utility classes are generated:

   ```ts
   import nucleux from "@nucleux/tokens/preset";

   export default {
     presets: [nucleux],
     content: ["./src/**/*.{ts,tsx}", "./node_modules/@nucleux/**/dist/**/*.js"],
   };
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
