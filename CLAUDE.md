# Nucleux — project guide for Claude

Agentic UI component library for React (AI chat / agent interfaces), published
as a **pnpm-workspace monorepo** under the `@nucleux` scope: one package per
component plus an umbrella.

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
src/test/        -> the validation suite (imports @nucleux/react)
scripts/         -> alias-map.json (drives Storybook/Vitest source aliases), build helpers
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
