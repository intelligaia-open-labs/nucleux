
== nucleux ==
   75.0  Enablement surface
         [info] CLAUDE.md present at system root.
         [info] llms.txt present at system root.
         [info] llms.txt (local) is 21.7 KB.
         [info] Hosted surface not probed (no docsUrl configured).
         [info] Machine-readable catalog found: pre-extracted catalog snapshot.
         [info] MCP server found in workspace package packages/mcp (@nucleux/mcp).
         [info] Skill bundles found: .claude/skills (2 skills).
         [info] No editor rules file (.cursorrules, .cursor/rules, .github/copilot-instructions.md).
         [info] No Code Connect files (*.figma.ts[x]) found.
                fix: Only 10% of systems in the survey have Code Connect mappings: lowest-adoption asset, but it unlocks the Tier-3 Figma-to-code eval.
         [info] No registry hint found (registry.json, publishConfig.registry).
         [warn] Enablement docs (AGENTS.md/CLAUDE.md/llms.txt) predate the newest component source change (git history), so they may be stale.
                fix: Re-check AGENTS.md/llms.txt after component API changes; agents will confidently cite the stale version.
   88.9  Catalog quality
         [info] 73 component dirs, 136 exports, 376 props documented.
   n/a  Export hygiene
         [warn] package.json has no "types"/"typings" field.
                fix: Declare "types" so TypeScript-aware agent tooling can resolve prop types without a docgen catalog.
         [info] No declared entry point (main/module/exports["."]) points at built output.
                fix: A package usable outside its own monorepo (by an external agent workspace via npm install) needs a built dist entry, not source-aliased paths.
         [warn] No component directories with an index.ts found under packages, and no custom-element declarations either. Reachability was not assessed and the score is withheld.
                fix: Point componentsSrc at the directory holding the component dirs, if this system has them. If its layout is genuinely neither shape, this check has nothing to measure for it.
  100.0  Vocabulary convention-distance
         [info] 15 concept(s) aligned with convention, 0 covered under a different name, 25 not represented in this catalog (n/a).
   73.3  Token machine-readability
         [info] 64 CSS custom properties found.
         [info] 39/64 vars (60.9%) reference another var: a semantic layer over primitives.
         [info] Light/dark theming signal found (prefers-color-scheme, a data-*theme/color-scheme attribute, a .dark class selector, or a color-scheme declaration).
         [info] No DTCG (*.tokens.json / tokens.json with "$value") files found.
   60.0  Deprecation legibility
         [info] 3 @deprecated annotation(s) found across 3 file(s).
         [info] CHANGELOG.md present (changelog) with 4 machine-readable version heading(s).
         [info] No codemods hint found.
  100.0  Docs greppability
         [info] 83 markdown file(s) found in the repo.
         [info] Catalog available: scoring per-component coverage mode.
         [info] 136/136 components (100%) are mentioned in at least one markdown file.
         [info] llms.txt lists 136/136 components (100%).

  AI-Readiness Score (basis: full-behavioral)
    Surface                83.7
      weighted mean of 6/7 scoreable checks
    Lift                   73.7 (raw +23.7)
      guided mean 75.3 - bare mean 51.6 = +23.7 points.
    Ceiling                37.6
      guided mean 75.3, guided non-fail rate 0% (0/17).
    Engagement             42.3
      15/26 ok cells ignored the design system entirely.
    Vocabulary-behavioral  100.0
      0/3 hallucinated names match a convention-lexicon entry exactly.
    Composite              67.5
    Tier: Invested (composite 67.5 in [40, 70))

