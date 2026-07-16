---
name: figma-to-nucleux
description: >-
  Turn a Figma screen into production-ready, refactored Nucleux components. Use
  when the user shares a Figma design/frame URL and wants it implemented as
  library components (not a one-off page dump). Reads the design via the Figma
  MCP, maps design variables to --nx-* tokens, decomposes the screen into
  reusable primitives vs. compositions, implements each to the repo conventions
  with a story, wires exports, and verifies with typecheck + build.
---

# Figma → Nucleux component harness

A repeatable pipeline for converting a Figma screen into **refactored, shippable**
components for the `nucleux` npm package — not a monolithic screen dump. The
guiding principle: **extract reusable primitives, compose the screen from them.**

## Prerequisites

- The Figma MCP server is connected (tools appear as `mcp__*_Figma__*`).
- A **node-specific** URL, e.g. `…/design/:fileKey/:name?node-id=1895-59895`.
  Extract `fileKey` and `nodeId` (`1895-59895` → `1895:59895`) from it.
- Read `CLAUDE.md` for stack + conventions before writing any component.

## Step 1 — Read the screen (never guess)

Call these Figma MCP tools for the target node, in this order:

1. `get_metadata` — the layer tree with **exact px** positions/sizes. This is your
   source of truth for spacing, dimensions, and structure.
2. `get_screenshot` (download the PNG and actually **Read** it) — the visual truth
   for color, hierarchy, states.
3. `get_variable_defs` — the design tokens (colors, radii, type ramp, spacing).
4. `get_code_connect_map` — if non-empty, those nodes already map to code
   components; **reuse them instead of rebuilding.**

Only call `get_design_context` when you need the exact reference code for a
fiddly sub-node; metadata + screenshot + variables usually suffice and cost less.

## Step 1b — Resolve instances to the canonical library (source of truth)

**The full Figma file is the source of truth; a screen only tells you WHICH
components appear and HOW they're arranged.** Do not infer a component's full API
from a single screen instance — that instance is one variant in one state.

- Each `<instance name="…">` in a screen references a master component in the
  library. The instance `name` is the component's canonical name — match it
  exactly (`Card Container`, not your guess `Card`; `Input Bar`, not `PromptInput`).
- To recover a component's **real variant/prop set**, call `get_design_context`
  on a representative instance (it returns the resolved styles + component
  properties like `variant`/`size`/`state`), and sample instances across
  different screens to see every variant/state before finalizing the API.
- Instance **frequency across the file** signals importance and how general the
  component must be. In this file (AI-UX-Pattern): `Button` (×529),
  `Card Container` (×179), `Icon Button` (×174), `Input Bar` (×115),
  `Primitive Chip` (×101), `Badge` (×74), plus `Tabs`, `Switch`, `Alert`,
  `Code Block`, `Tooltip`, `Separator`, `Menu`, `Select & Combobox`, nav/sidebars.
- The whole `Components` page metadata is multi-MB — never read it whole. Save
  the tool-result file and extract with a script: enumerate `<instance … name>`
  frequencies and locate sections, then drill into specific node ids.
- Gotcha: screenshots can mislead on exact token values — the dashboard "Connect"
  button *looked* blue-600 but the canonical component is **blue-500 + slate
  border + shadow-sm + rounded-lg + semibold**. Always confirm against the
  component, not the pixels.

## Step 2 — Map design variables to `--nx-*` tokens

Nucleux themes via CSS variables in `src/styles/globals.css` (see the
`impeccable`/shadcn "slate" system this design uses). Reconcile the Figma
variables to tokens **before** coding — if the design introduces a color the
tokens don't have, add a token; never hardcode hex.

| Figma variable            | Value      | `--nx-*` token            |
| ------------------------- | ---------- | ------------------------- |
| `general/background`      | `#ffffff`  | `--nx-background`         |
| `general/foreground`      | `#020617`  | `--nx-foreground`         |
| `general/primary`         | `#0f172a`  | `--nx-primary`            |
| `general/primary fg`      | `#f8fafc`  | `--nx-primary-foreground` |
| `general/muted foreground`| `#64748b`  | `--nx-muted-foreground`   |
| `general/border`          | `#e2e8f0`  | `--nx-border` / `--nx-input` |
| `blue/600`                | `#2563eb`  | `--nx-info` (blue CTA)    |
| `violet/500` / `violet/50`| `#8b5cf6`  | `--nx-brand` / `--nx-brand-muted` |
| `green/600`               | `#16a34a`  | `--nx-success`            |

Colors are stored as **HSL channels** (no `hsl()` wrapper) so Tailwind opacity
modifiers work (`bg-success/15`). Add both light and `.dark` values, and expose
any new token in `src/preset.ts`.

Type ramp seen in this system: heading-2 30/600, heading-4 20/600, paragraph
16/400/24, small 14, mini 12 — map to Tailwind `text-3xl/xl/base/sm/xs`.

## Step 3 — Decompose: primitive vs. composition vs. app-specific

Walk the layer tree and bucket every distinct piece:

- **Primitive** → ships in `src/components/`. A reusable, content-agnostic unit
  used (or plausibly reused) more than once: `Card`, `Badge`, `Button`, `Avatar`,
  `ActionTile`, `Checklist`. Repeated instances in the tree (e.g. two `Badge`s,
  three `Button`s) are the strongest signal.
- **Composition** → an example story only, in `src/examples/`. The whole screen
  or a section (`MeetingDashboard`) assembled from primitives. Never ship a
  screen as a component.
- **App-specific** → belongs in the consuming app, not the library (a
  `MeetingRow` bound to a specific data shape). Note it, don't build it here —
  but do extract any generic primitive it depends on.

Refactor rules: one component per file (kebab-case), no duplicated markup —
extract the shared piece; variants via a typed `Record<Variant, string>` map
(don't add `cva` for a handful of variants); compose parts (`Card` +
`CardHeader` + `CardContent`) rather than a props-explosion mega-component.

## Step 4 — Implement each primitive (definition of done)

For every primitive, all of the following (see `CLAUDE.md`):

- [ ] `src/components/<kebab-name>.tsx`, function component with `forwardRef`,
      `displayName` set.
- [ ] Props `interface` exported; extends the right DOM props and `Omit`s any
      clashing native attrs (e.g. `title` on a `<button>`).
- [ ] Classes via `cn()`; only semantic tokens (`bg-muted`, `text-foreground`,
      `border-border`, `text-success`…) — **no hex, no arbitrary colors.**
- [ ] Accessible: real semantics (`<button>`/`<ul>`/`role`), `aria-*`, visible
      `focus-visible:ring` on interactive elements.
- [ ] Exported from `src/index.ts` (component + Props type).
- [ ] Co-located `*.stories.tsx` covering the variants/states from the design.

## Step 5 — Compose the screen

Assemble the primitives into `src/examples/<screen>.stories.tsx` under a
`title: "Examples/…"` with `layout: "fullscreen"`. Match the Figma layout with
grid/flex + the measured gaps. This proves the primitives actually compose and
gives the consumer a copy-paste starting point.

## Step 6 — Verify

```bash
pnpm typecheck        # must be clean
pnpm build            # bundle + css must succeed
pnpm build-storybook  # every story (incl. the example) must compile
```

Then visually compare the rendered story against the screenshot from Step 1 and
fix spacing/color drift before declaring done.

## Anti-patterns

- Dumping the Figma-generated JSX as one component with hardcoded pixels/hex.
- Re-implementing something already in `get_code_connect_map`.
- Adding a runtime dependency for something `cn()` + a variant map can do.
- Shipping an app-specific, data-bound row as a "library component".
