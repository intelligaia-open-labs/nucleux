<!-- Generated from knowledge/workflow.md by scripts/gen-agent-files.mjs. Do not edit. -->

## UI: Nucleux design system

This project builds its UI with Nucleux (`@nucleux/react`). Use the `nucleux`
MCP server (`npx -y @nucleux/mcp`) for patterns and component contracts; the
`nucleux-design` skill holds the same workflow.

Nucleux (`@nucleux/react`) is a React + Tailwind design system in two families:
shadcn-style (`Button`, `Disclosure`, …) and Material 3 (`Md3Button`,
`Md3Disclosure`, …). The `nucleux` MCP server holds its curated page patterns and
exact component contracts. Work design-first: find the pattern, read the
contracts, then write code.

### Rules

1. Inspect the project before changing files. Keep its framework, router,
   state management, business logic and file layout.
2. Look for a Nucleux pattern (`search_patterns`) before laying out any page.
   Prefer a whole pattern over assembling unrelated components.
3. Read the contract (`get_component`) before using a component. Use only the
   imports, props and variant values it lists. Never guess a Nucleux export,
   prop or variant. If it is not in the catalog, it does not exist.
4. Pick one family per app and do not mix them: Material 3 (`Md3*`) when the
   project already uses Material Design or the user asks for it, otherwise
   shadcn. Patterns are written with shadcn components; in a Material 3 app use
   each one's `Md3` twin, and where Material 3 has none (e.g. `DataTable`), the
   shadcn component under the `md3-theme` class. Agentic components have the
   same props in both families.
5. For AI features use the agentic components (nucleux.in's patterns):
   `Disclosure` and `Caveat` for AI output, `Consent` before acting,
   `OpenInput`/`InitialCta`/`SuggestedPrompts` for asking, `Attachments`,
   `VoiceInput` and friends for input, `ModelSelection`, `KnowledgeBase`,
   `Connector` and `McpConnection` for context. Search for them with
   `search_components` instead of building your own.
6. Do not rebuild something Nucleux already ships (navigation, tables, cards,
   dialogs, sheets, form controls, empty/error states). If you must, say why
   in your summary.
7. Style with the semantic token classes (`bg-background`, `text-foreground`,
   `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`…;
   in a Material 3 app the `md-*` roles: `bg-md-surface`, `text-md-on-surface`,
   `bg-md-primary-container`…).
   No hex colors, no arbitrary color values. Use the same variant for the same
   meaning everywhere (one `cta` primary action per page, `destructive` only
   for destructive actions).
8. Every page must work from 360px wide: follow each pattern's responsive rules.
9. Accessibility is part of done: labels for every control, `aria-label` on
   icon-only buttons, visible focus, status not conveyed by color alone.
10. Every data view handles loading, empty and error (the `page-states` pattern).
11. When Nucleux has no pattern or component for a need, build it from Nucleux
   primitives (or the ShadCN equivalent the tools name), keep it on Nucleux
   tokens, and report the gap. Never present an invented component as Nucleux.
12. Nucleux is not mandatory. If the project already uses another component
    system and the user did not ask to switch, extend that system and say so.

### Workflow

**A. Inspect the project.** Find the framework (Vite, Next.js, Remix…), package
manager (lockfile), TypeScript, Tailwind version and config, router, existing
component system, and any installed `@nucleux/*` packages. If Nucleux is not set
up, call `get_setup` and follow it exactly.

**B. Analyse the request.** List the pages, the main user journeys, the key
interactions on each page, and what matters most on each screen. Ask only about
ambiguities that change the architecture; pick sensible defaults otherwise.

**C. Discover.** For each page call `search_patterns` with what the page is for,
then `get_pattern` for the best match (`app-shell` for the frame, plus one
pattern per page). Call `get_component` for every component you will use that
you have not read in this session. Use `search_components` for needs inside a
page that no pattern covers.

**D. Plan.** Write a short plan: shared layout, then each route →
pattern(s) → components → app-specific pieces you will write → states. Mark
anything Nucleux does not cover. Check the plan with `validate_design` (pattern
ids plus the components and props you intend to use) and fix every error.

**E. Implement.** Build the shared shell once and wrap every route in it.
Start each page from its pattern's example, replace the sample data with the
app's data model, and keep app-specific components (a TaskCard bound to your
data) in the app, composed from Nucleux parts.

**F. Validate.** Run the project's type check, lint, tests and production build;
fix every error. Re-check each page against its pattern's responsive and
accessibility rules.

**G. Report.** Summarise the pages built, the patterns and components used per
page, design decisions, the checks you ran and their results, anything you built
custom and why, and the gaps or open issues.
