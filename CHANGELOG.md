# Changelog

All notable changes to the Nucleux design system are documented here.
This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The format is machine-readable: each version heading starts with `## ` followed
by a version tag and date, and entries are grouped under `### Added`, `### Changed`,
`### Deprecated`, `### Removed`, `### Fixed`, `### Security` sub-headings.

## [Unreleased]

### 0.6.0: package set matches nucleux.in (breaking)

The package set now follows nucleux.in: shadcn/ui's component list, Material 3's
component list (`md3-*`), and the agentic patterns marked *Available*. This
section covers phase 1 (renames and removals); new components follow.

#### Renamed (old name → new name)
| Package | Exports |
|---|---|
| `menu` → `dropdown-menu` | `Menu`/`MenuItem`/`MenuLabel`/`MenuSeparator` → `DropdownMenu` + `DropdownMenuTrigger`/`Content`/`Item`/`Label`/`Group`/`Separator`/`Shortcut` (shadcn API: owns its trigger, open state and keyboard navigation) |
| `error-state` → `empty` | `ErrorState` → `Empty` + `EmptyHeader`/`EmptyMedia`/`EmptyTitle`/`EmptyDescription`/`EmptyContent` (shadcn API; for failures add `role="alert"`) |
| `select` → `native-select` | `Select` → `NativeSelect` (+ `NativeSelectOption`, `NativeSelectOptGroup`) |
| `thread` → `message-scroller` | `Thread` → `MessageScroller` |
| `attachment-tile` → `attachment` | `AttachmentTile` → `Attachment`, `AttachmentTray` → `AttachmentGroup` |
| `ai-disclosure` → `disclosure` + `caveat` | `AiDisclosure` → `Disclosure`; `AiCaveat` → `Caveat` (own package) |
| `modular-consent` → `consent` | `ModularConsent` → `Consent` |
| `tone-selector` → `personality` | `ToneSelector` → `Personality` |
| `prompt-template` → `templates` | `PromptTemplate` → `Templates` |
| `suggestions` → `suggested-prompts` | `Suggestions` → `SuggestedPrompts`, `SuggestionChip` → `SuggestedPrompt` |
| `model-selector` → `model-selection` | `ModelSelector` → `ModelSelection` |
| `knowledge-base-picker` → `knowledge-base` | `KnowledgeBasePicker` → `KnowledgeBase` |
| `connector-card` → `connectors` | `ConnectorCard` → `Connector` |
| `input-bar` → `open-input` | `InputBar` → `OpenInput` |

#### Removed (not on nucleux.in; old versions stay on npm, deprecated)
action-confirmation, action-plan, action-tile, activity-log, agent-composer,
agent-steps, audio-message, capability-overview, checklist, chip, citation,
confidence-indicator, follow-up, getting-started-pill, icon-button,
inline-feedback, link-button, media-card, memory-summary, page-header,
privacy-notice, prompt-enhancer, reasoning, related-patterns-grid,
response-comparison, rewrite-menu, rich-checkbox-group, right-sidebar,
search-input, session-recap, streaming-text, tool-call, typing-indicator,
md3-action-plan, md3-activity-log, md3-agent-steps, md3-reasoning, md3-thread,
md3-tool-call. Replacements: `IconButton` → `Button size="icon" | "icon-sm" |
"icon-lg"`; `LinkButton` → `Button variant="link" asChild` around an `<a>`;
`SearchInput` → `Input type="search"`; `PageHeader` → a `<header>` with an
`<h1>`. `global-nav` and `nav-panel` go when the shadcn `sidebar` lands.

#### Added (phase 2: the remaining shadcn/ui basics)
- New packages, ported from shadcn/ui without Radix, keeping shadcn's exports,
  props and `data-slot` attributes: `bubble`, `button-group`, `direction`,
  `drawer` (native: focus trap, scroll lock, drag to dismiss), `field`,
  `input-group`, `item`, `kbd`, `marker`, `questionnaire`, `select` (custom
  listbox: keyboard, typeahead, form submission), `sonner` (the `sonner`
  library, themed with Nucleux tokens), `spinner`, `trace`.
- `sidebar` is rebuilt as shadcn's Sidebar (`SidebarProvider`, `Sidebar` with
  offcanvas/icon/none collapse and sidebar/floating/inset variants, a sheet on
  phones, ⌘B / Ctrl+B, `SidebarMenu*`, `useSidebar`). The old icon-rail API
  (`SidebarItem`, the `footer` prop) is gone.

#### Removed (phase 2)
- `global-nav` and `nav-panel`; use `sidebar` and a header inside `SidebarInset`.

#### Added (phase 1)
- `Button`: `variant="link"`, sizes `icon-sm`/`icon-lg`, and `asChild`.
- `Slot` in `@nucleux/utils` (powers `asChild`).
- `scripts/gen-llms.mjs`: the catalog section of `llms.txt` is generated from
  the MCP catalog and checked by the test suite.

#### Fixed
- `Alert`'s default variant and Consent's permission options used a `bg-card`
  color that doesn't exist in the preset, so they had no background.
- `pnpm-workspace.yaml` sets `verifyDepsBeforeRun: false`. pnpm 10+ ignores the
  `.npmrc` setting, so every `pnpm run` reinstalled and rewrote the lockfile.
- `DatePicker`, `OpenInput`, `Md3AgentComposer` and `useAutoScroll` no longer warn
  about `useLayoutEffect` when server-rendered.


### Added
- `llms.txt` at the repo root — machine-listable component catalog for AI agents
  (install instructions, token conventions, naming conventions, full 77-package
  listing with exports).
- `audits/` directory with AI-readiness audit reports (open-design-system-bench
  Tier-1 static audit + Tier-2 behavioral benchmark).
- `CHANGELOG.md` (this file) — machine-readable changelog for migration tooling.

### Changed
- _Nothing yet in this section._

### Deprecated
- Added deprecated compatibility aliases so agents trained on MUI/Chakra
  vocabulary resolve to the canonical Nucleux API (1:1 mapping, no behavior change):
  - `Alert` prop `severity` (maps to `variant`; `"error"` maps to `"destructive"`)
  - `Button` prop `color` (maps to `variant`)
  - `PopoverContent` prop `alignItems` (maps to `align`)
  - `ModalHeader`/`ModalTitle`/`ModalDescription`/`ModalFooter` re-export
    aliases of `DialogHeader`/`DialogTitle`/`DialogDescription`/`DialogFooter`
  - Prefer the canonical names in all new code.

### Removed
- _Nothing yet._

### Fixed
- _Nothing yet._

### Security
- _Nothing yet._

## [0.5.0] — 2026-10-08

Merged release: the Material Design 3 component line (published as 0.4.0)
and the AI-readiness audit remediation line, in one coherent version.

### Added
- **Material Design 3 component set** (`@nucleux/md3-*`): faithful MD3
  variants of the agentic components, with a tonal token layer
  (`--nx-md-*`) exposed as the `md` Tailwind color group.
- **Complete shadcn base component set** — every primitive a consumer
  needs is either a `@nucleux/*` package or a documented ShadCN fallback.
- **MCP HTML serving**: `get_component` with `framework:"html"` returns
  static Tailwind-class HTML snippets (paste-and-render ids, or `{{id}}`
  template slots); `get_setup` with `framework:"html"` for non-React
  projects. `@nucleux/mcp` bumped through 0.4.x internally.
- **AI-readiness assets**: `llms.txt` (machine-listable catalog),
  import-first consumer guidance in `CLAUDE.md`, barrel drift guard in
  `pnpm validate`, Exports sections in sub-component READMEs.
- **Semantic token layer**: raw palette primitives (`--nx-slate-*`,
  `--nx-blue-*`, `--nx-violet-*`, …) under intent-named semantic tokens
  (`--nx-background`, `--nx-success`, …) that now reference them via
  `var()` — re-theme by re-pointing semantics, not editing raw values.

### Changed
- **JSDoc on every component Props interface** (369 props documented,
  0 zero-prop exports) — the docgen catalog now carries prop types,
  descriptions and defaults.
- MCP server instructions announce the ShadCN fallback policy on
  initialize.

### Deprecated
- MUI/Chakra-vocabulary compatibility aliases (1:1 mapping, no behavior
  change): `Alert` `severity` (→ `variant`; `"error"` → `"destructive"`),
  `Button` `color` (→ `variant`), `PopoverContent` `alignItems` (→
  `align`), and `ModalHeader`/`ModalTitle`/`ModalDescription`/
  `ModalFooter` re-export aliases of the `Dialog*` names.

### Fixed
- Catalog extraction misclassification that showed 0% prop coverage
  despite JSDoc existing in source (bench `componentsSrc` correction).


## [0.1.5] — 2026-08-14

### Added
- ShadCN fallback policy in `@nucleux/mcp`: the MCP server now recommends
  shadcn/ui primitives for components Nucleux does not ship (Calendar,
  DatePicker, Combobox, etc.).
- Object-control safety allow-list in the `figma-to-nucleux` skill — only safe
  control types are enabled; everything else is disabled to prevent React
  error #31 in Storybook.
- Documentation for the global object-control enhancer in the skill.

### Fixed
- Storybook crash from React elements in story args (`ff662b1`).
- Object-control disabling keyed off type, not the not-yet-set control (`8f41d3d`).
- Globally disable object controls to stop React error #31 (`6890601`).

### Changed
- `@nucleux/mcp` catalog refreshed; bumped to 0.1.2 (`1be6c6b`).

## [0.1.4] — 2026-08-07

### Added
- 25 new agentic components from the Agentic Design System Figma file
  (`9252243`): agent-steps, reasoning, tool-call, confidence-indicator,
  streaming-text, typing-indicator, and more.

## [0.1.3] — 2026-07-29

### Added
- `@nucleux/mcp` — MCP (Model Context Protocol) server for AI coding agents
  (`a50e03d`). Exposes the component catalog via MCP tools so agents can
  discover and use Nucleux components programmatically.
- End-user guide in `@nucleux/mcp` README; bumped to 0.1.1 (`edab7e2`).
- Card Variations example gallery (MediaCard family) (`0580eab`).
- GitHub Actions workflow to auto-deploy Storybook to Pages (`2c7127a`).

## [0.1.0] — 2026-07-20

### Added
- Initial release of the Nucleux agentic UI component library.
- 48 React components under the `@nucleux` scope (pnpm-workspace monorepo).
- `@nucleux/react` umbrella barrel re-exporting all components.
- `@nucleux/tokens` — CSS custom properties (`--nx-*`) + Tailwind preset.
- Storybook (react-vite) for development and documentation.
- Vitest + Testing Library + jest-axe validation suite.
- `figma-to-nucleux` and `validate-component` Claude skills.

---

<!-- Link definitions for machine-readable version comparison -->
[Unreleased]: https://github.com/intelligaia-open-labs/nucleux/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/intelligaia-open-labs/nucleux/releases/tag/v0.5.0
[0.1.5]: https://github.com/intelligaia-open-labs/nucleux/releases/tag/v0.1.5
[0.1.4]: https://github.com/intelligaia-open-labs/nucleux/releases/tag/v0.1.4
[0.1.3]: https://github.com/intelligaia-open-labs/nucleux/releases/tag/v0.1.3
[0.1.0]: https://github.com/intelligaia-open-labs/nucleux/releases/tag/v0.1.0
