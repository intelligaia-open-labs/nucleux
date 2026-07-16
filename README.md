# Nucleux

**Agentic UI components for React.** Nucleux is a headless-friendly, Tailwind-powered
component library for building AI chat and agent interfaces — streaming messages,
tool-call cards, reasoning panels, auto-scrolling transcripts, and a smart prompt
composer.

> Status: early scaffold (`v0.0.1`). API may change.

## Features

- 🧩 **Agent-native primitives** — `Message`, `Thread`, `ToolCall`, `Reasoning`,
  `StreamingText`, `TypingIndicator`, `PromptInput`, `CodeBlock`, `Avatar`.
- 🎨 **Themeable via CSS variables** — light/dark out of the box, restyle everything
  by overriding a handful of tokens.
- 📦 **Ships ESM + CJS + types** — tree-shakeable, `"use client"` safe for Next.js
  App Router.
- ⚡ **Dependency-light** — `clsx`, `tailwind-merge`, and `lucide-react` only.

## Installation

```bash
pnpm add nucleux
# peer deps
pnpm add react react-dom
```

## Setup

1. Import the stylesheet once, near your app root:

   ```ts
   import "nucleux/styles.css";
   ```

2. **(Optional)** If you use Tailwind in your app and want to compose Nucleux
   tokens/utilities, add the preset to your `tailwind.config.ts`:

   ```ts
   import nucleux from "nucleux/preset";

   export default {
     presets: [nucleux],
     content: ["./src/**/*.{ts,tsx}", "./node_modules/nucleux/dist/**/*.js"],
   };
   ```

## Usage

```tsx
import { useState } from "react";
import { Thread, Message, PromptInput, ToolCall } from "nucleux";
import "nucleux/styles.css";

export function Chat() {
  const [messages, setMessages] = useState([
    { id: "1", role: "assistant", content: "Hey! What can I build for you?" },
  ]);
  const [input, setInput] = useState("");

  return (
    <div className="flex h-[32rem] flex-col">
      <Thread autoScrollKey={messages.length}>
        {messages.map((m) => (
          <Message key={m.id} role={m.role} content={m.content} streaming={m.streaming} />
        ))}
      </Thread>
      <div className="p-4">
        <PromptInput
          value={input}
          onValueChange={setInput}
          onSubmit={(text) =>
            setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: text }])
          }
        />
      </div>
    </div>
  );
}
```

## Theming

Every component reads its colors from CSS variables (`--nx-*`). Override them on
`:root` or any scope, and toggle dark mode with a `.dark` class:

```css
:root {
  --nx-primary: 262 83% 58%; /* HSL channels, no hsl() wrapper */
  --nx-radius: 1rem;
}
```

## Development

```bash
pnpm install
pnpm dev            # Storybook at http://localhost:6006
pnpm typecheck      # tsc --noEmit
pnpm build          # bundle to dist/ (JS + types + css)
pnpm build-storybook
```

### Project layout

```
src/
  components/   # one file per component (+ co-located *.stories.tsx)
  hooks/        # reusable behavior (auto-scroll, clipboard)
  lib/          # cn() util and shared types
  styles/       # globals.css — design tokens
  preset.ts     # shippable Tailwind preset
  index.ts      # public barrel export
.storybook/     # Storybook config
```

## License

MIT
