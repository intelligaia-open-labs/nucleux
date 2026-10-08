# Changelog

All notable changes to the Nucleux design system are documented here.
This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The format is machine-readable: each version heading starts with `## ` followed
by a version tag and date, and entries are grouped under `### Added`, `### Changed`,
`### Deprecated`, `### Removed`, `### Fixed`, `### Security` sub-headings.

## [Unreleased]

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
[Unreleased]: https://github.com/intelligaia-open-labs/nucleux/compare/v0.1.5...HEAD
[0.1.5]: https://github.com/intelligaia-open-labs/nucleux/releases/tag/v0.1.5
[0.1.4]: https://github.com/intelligaia-open-labs/nucleux/releases/tag/v0.1.4
[0.1.3]: https://github.com/intelligaia-open-labs/nucleux/releases/tag/v0.1.3
[0.1.0]: https://github.com/intelligaia-open-labs/nucleux/releases/tag/v0.1.0
