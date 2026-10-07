
== nucleux ==
   60.0  Enablement surface
         [info] CLAUDE.md present at system root.
         [warn] No llms.txt at the system root.
                fix: Ship an llms.txt listing the component set: the most commonly cited gap in the mid-2026 AI-readiness survey.
         [info] Hosted surface not probed (no docsUrl configured).
         [info] Machine-readable catalog found: pre-extracted catalog snapshot.
         [info] MCP server found in workspace package packages/mcp (@nucleux/mcp).
         [info] Skill bundles found: .claude/skills (2 skills).
         [info] No editor rules file (.cursorrules, .cursor/rules, .github/copilot-instructions.md).
         [info] No Code Connect files (*.figma.ts[x]) found.
                fix: Only 10% of systems in the survey have Code Connect mappings: lowest-adoption asset, but it unlocks the Tier-3 Figma-to-code eval.
         [info] No registry hint found (registry.json, publishConfig.registry).
         [info] Doc freshness unmeasured (not a git checkout).
   16.7  Catalog quality
         [info] 73 component dirs, 132 exports, 0 props documented, 319 inherited prop names recorded (not counted toward coverage), 88 export(s) expose only inherited props.
         [warn] 44/132 exports (33.3%) have zero documented props: AccordionTrigger, AccordionContent, Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, CardContainer, ….
                fix: These are more likely docgen extraction gaps (unresolved generics, forwardRef, re-exported third-party types) than genuinely prop-less components. Spot-check a few before trusting the 0.
         [warn] extraction-suspect: 33.3% of exports have no props. Treat the coverage numbers below as a lower bound.
                fix: Type/description/default coverage below is computed only over the exports that did return props; fix extraction and re-run to get a true reading.
         [warn] Only 66.7% of exports have a documented props table.
         [warn] Only 0% of props have a resolved type.
                fix: Untyped props force an agent to guess valid values instead of reading them.
         [warn] Only 0% of props have a description.
                fix: JSDoc on prop declarations flows straight into the catalog via docgen.
   n/a  Export hygiene
         [warn] No root barrel found at .bench-barrel/index.ts.
         [warn] package.json has no "types"/"typings" field.
                fix: Declare "types" so TypeScript-aware agent tooling can resolve prop types without a docgen catalog.
         [info] No declared entry point (main/module/exports["."]) points at built output.
                fix: A package usable outside its own monorepo (by an external agent workspace via npm install) needs a built dist entry, not source-aliased paths.
         [warn] No component directories with an index.ts found under .bench-barrel, and no custom-element declarations either. Reachability was not assessed and the score is withheld.
                fix: Point componentsSrc at the directory holding the component dirs, if this system has them. If its layout is genuinely neither shape, this check has nothing to measure for it.
   61.6  Vocabulary convention-distance
         [info] 10 concept(s) aligned with convention, 4 covered under a different name, 26 not represented in this catalog (n/a).
         [warn] Prop "color" (semantic-emphasis): models invented this name 49 time(s) across the mined sample; this system covers it as "variant" instead.
                fix: often variant/tone elsewhere
         [warn] Prop "alignItems" (stack-align): models invented this name 16 time(s) across the mined sample; this system covers it as "align" instead.
                fix: CSS vocabulary; align elsewhere
         [warn] Component "ModalHeader" (modal-compound-parts): models invented this name 9 time(s) across the mined sample; this system covers it as "DialogHeader" instead.
                fix: Chakra compound naming; ModalTitle/DialogHeader elsewhere
         [warn] Prop "severity" (alert-severity): models invented this name 9 time(s) across the mined sample; this system covers it as "variant" instead.
                fix: MUI Alert vocabulary; variant/tone elsewhere
   55.0  Token machine-readability
         [info] 45 CSS custom properties found.
         [warn] 0/45 vars (0%) reference another var: a semantic layer over primitives.
                fix: A flat token list without a semantic layer forces agents to pick raw values instead of intent-named ones.
         [info] Light/dark theming signal found (prefers-color-scheme, a data-*theme/color-scheme attribute, a .dark class selector, or a color-scheme declaration).
         [info] No DTCG (*.tokens.json / tokens.json with "$value") files found.
    0.0  Deprecation legibility
         [info] No @deprecated JSDoc annotations found (either nothing is deprecated, or deprecations are undocumented: static analysis can't tell which).
         [warn] No CHANGELOG*.md, MIGRATION*.md or UPGRADING*.md at the system root, the components package dir, or any workspace package.
                fix: A machine-readable changelog or migration guide is a Tier-1 migration eval prerequisite.
         [info] No codemods hint found.
   63.2  Docs greppability
         [info] 80 markdown file(s) found in the repo.
         [info] Catalog available: scoring per-component coverage mode.
         [info] 117/132 components (88.6%) are mentioned in at least one markdown file.
         [warn] 15 component(s) have no markdown mention: CardDivider, SheetDescription, SheetClose, TableCaption, RelatedPatternCard, RightSidebarLabel, RightSidebarAnchor, RightSidebarMeta, RightSidebarSeparator, SourceItem, ….
                fix: A component with zero markdown reach is invisible to any docs-grepping or retrieval-based agent workflow.
         [warn] No llms.txt found. Component list is not machine-listable in the ecosystem-standard location.

  AI-Readiness Score (basis: partial-behavioral)
    Surface                42.8
      weighted mean of 6/7 scoreable checks
    Lift                   n/a
      Run has no aggregates for bare context (system: nucleux). Lift needs both.
    Ceiling                30.8
      guided mean 61.6, guided non-fail rate 0% (0/16).
    Engagement             0.0
      16/16 ok cells ignored the design system entirely.
    Vocabulary-behavioral  100.0
      No hallucinated components/invented props in this run. Nothing to attribute.
    Composite              43.4
    Tier: Invested (composite 43.4 in [40, 70))

