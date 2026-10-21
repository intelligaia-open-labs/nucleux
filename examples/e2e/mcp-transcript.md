# MCP end-to-end transcript

## listTools

```
- list_components: List every Nucleux UI component with its package name and one-line description. …
- get_component: Get full details for one component. framework:'react' (default) returns descript…
- search_components: Search components by keyword across names, descriptions, and keywords. Use when …
- get_setup: Get install and theming setup for Nucleux. framework:'react' (default) covers th…
- list_examples: List runnable example compositions (agent chat, dashboards, card variations, set…
- get_example: Get the full source of one example composition by name (see list_examples). Retu…
```

## get_setup · react

```
# Nucleux setup (@nucleux/react@0.4.0)

**Full kit:** `pnpm add @nucleux/react @nucleux/tokens`
**Single component:** `pnpm add @nucleux/<component> @nucleux/tokens`

## Theme
- Import the theme once at your app root: import "@nucleux/tokens/styles.css";
- Add the Tailwind preset: presets: [require('@nucleux/tokens/preset')] in tailwind.config.
- react and react-dom are peer dependencies (>=18).

Every component is also re-exported from the @nucleux/react umbrella.

For plain HTML (no React), call get_setup with framework:"html".
```

## get_setup · html

```
# Nucleux setup for plain HTML (no React) — @nucleux/react@0.4.0

Nucleux styling is Tailwind + CSS variables, so any HTML page can use the component markup.

1) Install Tailwind + tokens:
```bash
npm i -D tailwindcss @nucleux/tokens
```
2) `tailwind.config.js`:
```js
module.exports = { presets: [require("@nucleux/tokens/preset")], content: ["./**/*.html"] };
```
3) `input.css` (pulls in the @tailwind layers + the --nx-* design tokens):
```css
@import "@nucleux/tokens/styles.css";
```
4) Build the stylesheet:
```bash
npx tailwindcss -i input.css -o output.css --minify
```
5) Link it, then paste component markup from `get_component` (framework:"html"):
```html
<link rel="stylesheet" href="output.css" />
```

Dark theme: add `class="dark"` on `<html>`. The static HTML carries styling only — for
interactive behavior use the React packages (framework:"react").
```

## search_components 'agent chat message tool call'

```
- Message (@nucleux/message) — Chat message row with avatar + bubble — Nucleux agentic UI for React.
- Md3Message (@nucleux/md3-message) — Material 3 chat message row — Nucleux agentic UI for React.
- Md3ToolCall (@nucleux/md3-tool-call) — Material 3 agent tool-call card — Nucleux agentic UI for React.
- Thread (@nucleux/thread) — Auto-scrolling chat transcript container — Nucleux agentic UI for React.
- ToolCall (@nucleux/tool-call) — Collapsible agent tool-call card — Nucleux agentic UI for React.
- Accordion (@nucleux/accordion) — Collapsible accordion panels — Nucleux agentic UI for React.
- ActionPlanStep (@nucleux/action-plan) — ActionPlan — a proposed agent plan the user can accept, edit, or reject — Nucleux agentic UI for React.
- AgentComposer (@nucleux/agent-composer) — Agent task composer with toolbar — Nucleux agentic UI for React.
- Alert (@nucleux/alert) — Contextual message banner (info/success/warning/error) — Nucleux agentic UI for React.
- AudioMessage (@nucleux/audio-message) — AudioMessage — a player for AI-generated voice output — Nucleux agentic UI for React.
- ChartTooltip (@nucleux/chart) — Composable chart primitives — Nucleux agentic UI for React.
- ConnectorCard (@nucleux/connector-card) — ConnectorCard — enable an external tool or data connector — Nucleux agentic UI for React.
```

## get_component md3-message · react

```
# Md3Message  (@nucleux/md3-message)

A Material Design 3 chat message row: a tonal avatar and a role-aware bubble
with MD3 shape and surface roles. Same API as {@link Message}.

**Kind:** component
**Install:** `pnpm add @nucleux/md3-message @nucleux/tokens`  (or the full kit: `pnpm add @nucleux/react @nucleux/tokens`)
**Import:** `import { Md3Message } from "@nucleux/md3-message";`

**Exports:**
```

## get_component md3-tool-call · react

```
# Md3ToolCall  (@nucleux/md3-tool-call)

A Material Design 3 tool-call card: name, live status, arguments, and result,
with a tonal surface and an on-color state layer. Same API as {@link ToolCall}.

**Kind:** component
**Install:** `pnpm add @nucleux/md3-tool-call @nucleux/tokens`  (or the full kit: `pnpm add @nucleux/react @nucleux/tokens`)
**Import:** `import { Md3ToolCall } from "@nucleux/md3-
```

## get_component md3-agent-steps · react

```
# Md3AgentStep  (@nucleux/md3-agent-steps)

A single step in an {@link Md3AgentSteps} tracker.

**Kind:** component
**Install:** `pnpm add @nucleux/md3-agent-steps @nucleux/tokens`  (or the full kit: `pnpm add @nucleux/react @nucleux/tokens`)
**Import:** `import { Md3AgentStep, Md3AgentSteps, Md3AgentStepStatus } from "@nucleux/md3-agent-steps";`

**Exports:** Md3AgentStep, Md3AgentSteps, Md3Agent
```

## get_component md3-action-plan · react

```
# Md3ActionPlanStep  (@nucleux/md3-action-plan)

A single step in an {@link Md3ActionPlan}. Numbered automatically by its order.

**Kind:** component
**Install:** `pnpm add @nucleux/md3-action-plan @nucleux/tokens`  (or the full kit: `pnpm add @nucleux/react @nucleux/tokens`)
**Import:** `import { Md3ActionPlanStep, Md3ActionPlan } from "@nucleux/md3-action-plan";`

**Exports:** Md3ActionPlanStep,
```

## get_component md3-agent-composer · react

```
# Md3AgentComposer  (@nucleux/md3-agent-composer)

A Material Design 3 agent task composer — a tonal surface with an auto-growing
prompt field, a toolbar, and a filled send/stop button with a state layer.
Enter submits, Shift+Enter newlines. Same API as {@link AgentComposer}.

**Kind:** component
**Install:** `pnpm add @nucleux/md3-agent-composer @nucleux/tokens`  (or the full kit: `pnpm add @nucl
```
