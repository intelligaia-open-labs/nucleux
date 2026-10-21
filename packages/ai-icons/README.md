# @nucleux/ai-icons

Icons — a small, stable AI mark vocabulary: action, generated, working and tool use — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

- **`AiIcons`** — the AI presence mark. `variant`: `sparkle` (default) / `thinking-orb` (animated, for active states) / `branded-mark`; `size` sm/md/lg (24/32/40); `tone` solid/outline; `label` (accessible name — omit when words sit beside it); `glyph` (branded-mark content)
- **`AiIcon`** — one AI *meaning* with its mark and its words. `role`: `ai-action` / `generated-content` / `agent-working` (turns, announced in a polite live region) / `tool-use`; `label` (required); `showLabel`
- **`AiIconProvider`** (`glyphs`) + **`useAiGlyph(role)`** — choose the approved glyph per role once for the whole product; the approved lists don't overlap
- Glyphs: **`AiSparkleIcon`**, **`AiGeneratedIcon`**, **`AiWorkingIcon`** (`still`), **`AiWandIcon`**, **`AiRegenerateIcon`**, **`AiToolIcon`**; maps **`aiGlyphs`**, **`defaultAiIconGlyphs`**

## Rules

- The sparkle is the universal default; the orb is for active state only; never a photo or human face.
- Every mark travels with words — a visible label, or an accessible name.
- Only the working mark moves, only while work happens, and it holds still under reduced motion.
- `@nucleux/iconography`, `@nucleux/agent-avatar` and `@nucleux/disclosure` draw from these same glyphs.

## Install

```bash
pnpm add @nucleux/ai-icons @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { AiIcons, AiIcon, AiIconProvider } from "@nucleux/ai-icons";

<AiIcon role="ai-action" label="Rewrite" />
<AiIcon role="agent-working" label="Rewriting release note…" />
<AiIcon role="generated-content" label="Generated with AI" />
<AiIcons variant="thinking-orb" /> <span role="status">Aria is thinking…</span>

<AiIconProvider glyphs={{ "ai-action": "wand" }}>{app}</AiIconProvider>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
