# Changelog

All notable changes to the Nucleux design system are documented here.
This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The format is machine-readable: each version heading starts with `## ` followed
by a version tag and date, and entries are grouped under `### Added`, `### Changed`,
`### Deprecated`, `### Removed`, `### Fixed`, `### Security` sub-headings.

## [0.7.0] — 2026-10-21

nucleux.in marked six more patterns *Available* (Initially → Prompt Scaffolds).
Each ships in both families with one API, as the other agentic patterns do.

### Added
- `@nucleux/suggestions` / `@nucleux/md3-suggestions` — `Suggestions`,
  `SuggestionsComposer`: a few details Aria suggests adding to the request being
  written; appended only when chosen, confirmed with Undo, never sent.
- `@nucleux/madlibs` / `@nucleux/md3-madlibs` — `Madlibs`: a request written as a
  sentence with labelled blanks (`{blank}`, `[optional clause]`), placed in the
  composer for editing before sending.
- `@nucleux/prompt-enhancer` / `@nucleux/md3-prompt-enhancer` — `PromptEnhancer`:
  a clearer version of the request, every addition marked, explained and
  removable; the original is kept until the person chooses.
- `@nucleux/modes` / `@nucleux/md3-modes` — `Modes` (+`Segmented`, `List`, `Chip`,
  `Picker`, `Note`): how the agent approaches the task, chosen in the composer.
- `@nucleux/voice-tone` / `@nucleux/md3-voice-tone` — `VoiceTone`: how the reply
  should sound, sent beside the prompt as a setting.
- `@nucleux/preset-styles` / `@nucleux/md3-preset-styles` — `PresetStyles`: named
  styles for replies or outputs, previewed and switchable, plus create-a-style.

### Changed
- `@nucleux/suggestions` and `@nucleux/prompt-enhancer` are names again: 0.7.0 is
  nucleux.in's pattern, with a new API. Their 0.5.x versions stay deprecated
  (Suggestions 0.5.x became `SuggestedPrompts`).

## [0.6.0] — 2026-10-21

### Package set matches nucleux.in (breaking)

Every package now belongs to one of three lists, and nothing else ships:

- **shadcn family basics:** every component in shadcn/ui's list (67 of 67).
- **Material 3 family basics:** every component in Material 3's list (36 of 36,
  `md3-*`).
- **Agentic:** the 29 patterns marked *Available* on nucleux.in, each in both
  families (`<name>` and `md3-<name>`) with the same props.

#### Upgrading from 0.5.x
- Rename imports using the table below. At release the 0.5.x packages are deprecated on npm
  with a message naming the replacement (`scripts/deprecations.json`).
- **`@nucleux/select` changed meaning.** In 0.5.x it was a styled native
  `<select>`; that is now `@nucleux/native-select` (`NativeSelect`). In 0.6.0,
  `@nucleux/select` is shadcn's custom listbox (`Select`, `SelectTrigger`,
  `SelectValue`, `SelectContent`, `SelectItem`).
- `@nucleux/sidebar` is now shadcn's Sidebar (`SidebarProvider`, `Sidebar`,
  `SidebarMenu*`…); the 0.5.x icon rail (`SidebarItem`, `footer`) is gone.
- The `nucleux` MCP server's `get_component` names each component's twin in
  the other family; agents are told to pick one family per app.

#### Renamed and removed (phase 1)

##### Renamed (old name → new name)
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

#### Added (phase 5: Material 3 twins of the agentic patterns)
- 29 `md3-<name>` packages, the Material 3 twin of every agentic pattern
  (`Md3Disclosure`, `Md3Consent`, `Md3OpenInput`, `Md3Attachments`, …), styled
  from nucleux.in's Material 3 pages. Their props types are the shadcn twin's own
  types, so switching families is an import change; behaviour is the same and
  each twin passes the shadcn package's test suite.
- `md3-progress`: the indeterminate spinner and linear pulse stop under
  reduced motion.

#### Added (phase 4: nucleux.in's agentic patterns, shadcn family)
- 17 new packages, built from each pattern's spec on nucleux.in (variants,
  behaviour rules, copy): `agent-avatar`, `name` (`AgentName`), `iconography`,
  `color` (`AiColor`), `ai-icons`, `example-gallery`, `nudges` (`Nudge`),
  `disclaimer`, `initial-cta`, `proactive` (`ProactiveSuggestion`), `randomize`,
  `autocomplete`, `mcp-connection`, `attachments`, `visual-input`, `handwriting`
  (`HandwritingInput`), `gesture` (`GestureInput`). Recognition, suggestions and
  connections are always the app's callbacks; nothing calls a network.
- The 12 existing agentic packages were reviewed against their specs and gained
  the missing variants and behaviour (additive): e.g. Disclosure (first-run
  banner, details in place), Consent (`ConsentDialog`, `ConsentToggle`, policy
  link), OpenInput (async send with retry, `sendKey`, counter), Templates
  (`TemplatesList`, `TemplatesBrowser`), ModelSelection (trade-off and
  auto-route), KnowledgeBase (sources, coverage), Connectors (scope picker, live
  pill), VoiceInput (mic-button, live transcript, pause), StructuredInput
  (named slots, tag input, wizard).
- Behaviour changes: OpenInput's send button sits in a footer row; SuggestedPrompts
  shows at most `max` (5) items; Connector's root is now a column.
- Fixed: Personality and StructuredInput radio groups gain arrow-key roving
  focus; ModelSelection's dropdown is keyboard operable.

#### Added (phase 3: the remaining Material 3 basics)
- `md3-button-group` (standard and connected, five sizes, single and multiple
  selection), `md3-split-button` (four styles, menu with keyboard support),
  `md3-toolbar` (docked and floating, vertical, roving focus), `md3-fab-menu`,
  `md3-loading-indicator` (M3 Expressive shape morph; still under reduced
  motion), `md3-side-sheet` (standard and modal) and `md3-carousel`
  (multi-browse, uncontained, hero and full-screen, on embla). Every component in
  Material 3's list now has an `md3-*` package.

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
