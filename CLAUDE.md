# Nucleux — project guide for Claude

React component library for AI products, published as a **pnpm-workspace
monorepo** under the `@nucleux` scope: one package per component plus an
umbrella. Every component comes in two families: shadcn-style (`@nucleux/<name>`)
and Material 3 (`@nucleux/md3-<name>`, exports prefixed `Md3`).

**Scope (since 0.6.0):** the package set matches nucleux.in. Basic components
follow the shadcn/ui component list and the Material 3 component list; agentic
components are the patterns marked *Available* on nucleux.in. Do not add a
package outside those lists.

## Using the library (for apps that consume Nucleux)

**Import-first rule: build UI from Nucleux components — never hand-roll.** Before
writing any UI code, check this list and import what you need:

```tsx
import { Button, CardContainer, Dialog, Alert } from "@nucleux/react";
```

For a shadcn/ui component Nucleux does not ship yet, take the shadcn component
and restyle it onto Nucleux tokens — do not hand-roll it.

**Available components** (all re-exported by `@nucleux/react`; details in
`llms.txt`):

- **Layout/surface:** CardContainer, CardHeader, CardTitle, CardDescription,
  CardAction, CardContent, CardDivider, Separator, AspectRatio, ScrollArea,
  ResizablePanelGroup, Sidebar, Table (+Header/Body/Row/Head/Cell/Caption),
  DataTable
- **Actions:** Button (variant: primary/cta/secondary/ghost/destructive/link;
  size: sm/md/lg/icon/icon-sm/icon-lg; `asChild`), Toggle, ToggleGroup,
  DropdownMenu (+Trigger/Content/Item/Label/Group/Separator/Shortcut),
  ContextMenu, Menubar, Command
- **Feedback:** Alert (variant: info/success/warning/destructive), Toast,
  Empty (+Header/Media/Title/Description/Content), Skeleton, Progress
- **Overlays:** Dialog (+Header/Title/Description/Footer), AlertDialog, Sheet
  (+Header/Title/Description/Body/Footer/Close), Popover (+Trigger/Content),
  HoverCard, Tooltip
- **Inputs:** Input, Textarea, Label, Checkbox, RadioGroup, NativeSelect, Switch,
  Slider, Combobox, Calendar, DatePicker, InputOtp, Form
- **Navigation:** Breadcrumb (+Item/Link/Page/Separator), Tabs (+List/Trigger/Content),
  NavigationMenu, Pagination, Carousel; GlobalNav and NavPanel until the shadcn
  Sidebar lands
- **Content:** Avatar, Badge, CodeBlock, ChartContainer, Collapsible, Accordion,
  Message, MessageScroller, Attachment (+AttachmentGroup)
- **Agentic:** Disclosure, Caveat, Consent, Personality, Templates,
  SuggestedPrompts, OpenInput, ModelSelection, KnowledgeBase, Connector,
  VoiceInput, StructuredInput
- **Material 3:** Md3Button, Md3Fab, Md3IconButton, Md3SegmentedButton,
  Md3Card, Md3Chip, Md3Badge, Md3Dialog, Md3BottomSheet, Md3Menu, Md3List,
  Md3TextField, Md3Search, Md3Checkbox, Md3RadioGroup, Md3Switch, Md3Slider,
  Md3DatePicker, Md3TimePicker, Md3LinearProgress, Md3Snackbar, Md3Tooltip,
  Md3Tabs, Md3TopAppBar, Md3NavigationBar, Md3NavigationDrawer,
  Md3NavigationRail, Md3Divider, Md3Banner, Md3Message, Md3ActionConfirmation,
  Md3AgentComposer

Common props follow the system conventions: `variant` (not `severity`/`color`),
`align` (not `alignItems`), `size`, `orientation`. Style only with semantic
tokens (`bg-muted`, `text-foreground`, `text-destructive`…) — never raw hex.

**Pages and apps:** start from a curated pattern in `knowledge/patterns/`
(app-shell, list-page, detail-page, dashboard-overview, analytics-charts,
settings-page, form-dialog, multi-step-form, auth-sign-in, task-board,
page-states), or ask the
`nucleux` MCP server (`search_patterns` → `get_pattern` → `get_component`). This
list is checked by `src/test/docs.test.ts`; never add a name the catalog lacks.

## AI integration (knowledge layer)

- `knowledge/workflow.md` — the one source for agent guidance. Generated from it:
  `packages/mcp/skills/nucleux-design/SKILL.md`, `packages/mcp/templates/AGENTS.md`,
  `plugins/nucleux/skills/…` (`node scripts/gen-agent-files.mjs`).
- `knowledge/patterns/<id>/` — `pattern.json` (spec) + `example.tsx` (typechecked,
  render + axe tested). `scripts/gen-mcp-knowledge.mjs` validates every component
  reference against the catalog and writes `packages/mcp/src/knowledge.json`.
- `scripts/gen-mcp-catalog.mjs` parses Props with the TypeScript parser
  (`scripts/lib/extract-props.mjs`) into structured contracts.
- After changing a component's props, a pattern or the workflow, run
  `pnpm --filter @nucleux/mcp build` (regenerates all of the above) and `pnpm test`.

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
