# Nucleux — project guide for Claude

Agentic UI component library for React (AI chat / agent interfaces), published
as a **pnpm-workspace monorepo** under the `@nucleux` scope: one package per
component plus an umbrella.

## Using the library (for apps that consume Nucleux)

**Import-first rule: build UI from Nucleux components — never hand-roll.** Before
writing any UI code, check this list and import what you need:

```tsx
import { Button, CardContainer, Dialog, Alert } from "@nucleux/react";
```

For primitives Nucleux does not ship (Calendar, DatePicker, Combobox, …), fall
back to **shadcn/ui** — do not hand-roll those either.

**Available components** (all re-exported by `@nucleux/react`; details in
`llms.txt` and `docs/`):

- **Layout/surface:** CardContainer, CardHeader, CardTitle, CardDescription,
  CardAction, CardContent, CardDivider, Separator, PageHeader, NavPanel,
  Sidebar, RightSidebar, Table (+Header/Body/Row/Head/Cell/Caption)
- **Actions:** Button (variant: primary/secondary/outline/ghost/link/destructive),
  IconButton, LinkButton, Menu (+Item/Separator/Label), ActionConfirmation,
  ActionTile, ActionPlan, Suggestions, SuggestionChip
- **Feedback:** Alert (variant: info/success/warning/destructive), Toast,
  ErrorState, EmptyState, Progress, InlineFeedback, SuccessMessage
- **Overlays:** Dialog (+Header/Title/Description/Footer), Sheet
  (+Header/Title/Description/Body/Footer/Close), Popover (+Trigger/Content),
  Tooltip
- **Inputs:** InputBar, SearchInput, Checkbox, RadioGroup, Select, Switch,
  Slider, AgentComposer, StructuredInput, AttachmentTray, VoiceInput
- **Navigation:** Breadcrumb (+Item/Link/Page/Separator), Tabs (+List/Trigger/Content),
  GlobalNav, Thread, Pagination
- **Agentic-specific:** Message, Reasoning, ToolCall, AgentSteps, AgentComposer,
  StreamingText, TypingIndicator, ConfidenceIndicator, Citation, MemorySummary,
  SessionRecap, PromptEnhancer, PromptTemplate, ToneSelector, ResponseComparison,
  KnowledgeBasePicker, ModularConsent, PrivacyNotice, AiDisclosure, ActivityLog,
  RelatedPatternsGrid, ConnectorCard, ModelSelector, AudioMessage, FollowUp,
  MediaCard, Badge, Chip, CodeBlock, GettingStartedPill, RewriteMenu,
  RichCheckboxGroup, SourceList

Common props follow the system conventions: `variant` (not `severity`/`color`),
`align` (not `alignItems`), `size`, `orientation`. Style only with semantic
tokens (`bg-muted`, `text-foreground`, `text-destructive`…) — never raw hex.

## Stack

- **React 18 + TypeScript** (strict), function components with `forwardRef`.
- **Tailwind CSS v3** — tokens as CSS variables (`--nx-*`) in
  `packages/tokens/src/globals.css`, exposed via `@nucleux/tokens/preset`.
  Palette is the shadcn/Tailwind "slate" system; accents: `info` (blue CTA),
  `brand` (violet), `success`, `warning`, `destructive`.
- **tsup** builds each package → `dist/` (ESM + CJS + `.d.ts`). A post-build
  script adds a `"use client"` banner to every React (client) package.
- **Storybook (react-vite)** for dev + docs; stories co-located in each package.
- **Vitest + Testing Library + jest-axe** end-to-end validation.

## Monorepo layout

```
packages/
  <component>/   -> @nucleux/<name>   (one component; src/index.tsx + *.stories.tsx)
  utils/         -> @nucleux/utils    (cn() + shared types)
  hooks/         -> @nucleux/hooks
  tokens/        -> @nucleux/tokens   (globals.css + preset.ts)
  react/         -> @nucleux/react    (umbrella; re-exports everything; holds examples)
  mcp/           -> @nucleux/mcp      (MCP server for AI agents; ships generated catalog.json)
src/test/        -> the validation suite (imports @nucleux/react)
scripts/         -> alias-map.json (drives Storybook/Vitest source aliases), build helpers
                    gen-mcp-catalog.mjs (regenerates packages/mcp/src/catalog.json from packages/*)
```

Dev/test/typecheck resolve `@nucleux/*` to **source** via aliases (`vitest.config.ts`,
`.storybook/main.ts`, root `tsconfig.json` paths) — no build needed to work.
`pnpm build` runs `pnpm -r --sort run build` (topological) to emit per-package `dist/`.

## Conventions

- One component per package; kebab-case package/dir, PascalCase exports.
- Merge classes with `cn()` from `@nucleux/utils`; only semantic tokens
  (`bg-muted`, `text-foreground`, `text-success`…) — never hardcode hex.
- Custom animations live in the preset (`animate-nx-*`).
- Every component: export its `Props` type, ship a co-located `*.stories.tsx`,
  and be re-exported by the `@nucleux/react` umbrella (`export *`).
- Adding a new component = new `packages/<name>/` (package.json with
  `@nucleux/utils` dep + `tsup`/`typescript` devDeps), add its `export *` to
  `packages/react/src/index.ts`, add an alias entry to `scripts/alias-map.json`,
  and add a case to `src/test/components.test.tsx`.

## Commands

- `pnpm dev` — Storybook. `pnpm typecheck`. `pnpm test`. `pnpm build`.
- `pnpm validate` — full gate (typecheck → test → build → build-storybook).
- Verify changes with `pnpm validate` before considering work done.

## Building components from Figma

Follow the **`figma-to-nucleux`** skill; validate with the **`validate-component`**
skill. The AI-UX-Pattern Figma file is the design source of truth.
