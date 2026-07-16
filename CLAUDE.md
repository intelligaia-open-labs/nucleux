# Nucleux — project guide for Claude

Agentic UI component library for React (AI chat / agent interfaces).

## Stack

- **React 18 + TypeScript** (strict), function components with `forwardRef`.
- **Tailwind CSS v3** — tokens as CSS variables (`--nx-*`) in `src/styles/globals.css`,
  exposed to consumers via `src/preset.ts` (shipped as `nucleux/preset`). The palette
  is the shadcn/Tailwind "slate" system; semantic accents: `info` (blue CTA),
  `brand` (violet feature icons), `success`, `destructive`.
- **tsup** bundles `src/index.ts` → `dist/` (ESM + CJS + `.d.ts`), with a
  `"use client"` banner for RSC safety. CSS is built separately by the Tailwind CLI.
- **Storybook (react-vite)** for dev + docs; stories are co-located as `*.stories.tsx`.
- **pnpm** package manager.

## Conventions

- One component per file in `src/components/`, kebab-case filenames, PascalCase exports.
- Merge classes with `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge).
- Style with Tailwind utilities referencing semantic tokens (`bg-muted`, `text-foreground`,
  `border-border`, `text-destructive`, etc.) — never hardcode hex colors.
- Custom animations live in the preset (`animate-nx-*`), not inline keyframes.
- Every new component must: export its `Props` type, be added to `src/index.ts`, and
  ship a `*.stories.tsx`.
- Keep runtime deps minimal (currently `clsx`, `tailwind-merge`, `lucide-react`).

## Commands

- `pnpm dev` — Storybook. `pnpm typecheck` — `tsc --noEmit`. `pnpm build` — library bundle.
- Verify changes with `pnpm typecheck` before considering work done.

## Building components from Figma

When implementing a Figma screen, follow the **`figma-to-nucleux`** skill
(`.claude/skills/figma-to-nucleux/SKILL.md`) — it's the harness for reading a
design, mapping variables to `--nx-*` tokens, decomposing into primitives vs.
example compositions, and shipping each to the conventions above. Screen
compositions live in `src/examples/*.stories.tsx`, primitives in `src/components/`.
