---
name: validate-component
description: >-
  End-to-end validation harness for Nucleux components. Use after building or
  changing a component to prove it is production-ready: type-safe, renders,
  forwards refs, is accessible, behaves on interaction, bundles, and its stories
  compile. Runs `pnpm validate` (typecheck → vitest → tsup build → Storybook
  build) and explains how to extend coverage for a new component.
---

# Component validation harness

Proves a component is production-ready across every layer, in one command:

```bash
pnpm validate    # typecheck → test → build → build-storybook
```

Each stage gates the next, so the first failure stops the chain.

## What each stage checks

| Stage | Command | Catches |
| ----- | ------- | ------- |
| **Types** | `pnpm typecheck` (`tsc --noEmit`) | Bad props, missing exports, unsafe generics |
| **Behavior** | `pnpm test` (`vitest run`) | Render crashes, a11y violations, broken refs/interactions |
| **Bundle** | `pnpm build` (tsup + Tailwind CLI) | ESM/CJS/d.ts emit, `"use client"` banner, CSS build |
| **Docs** | `pnpm build-storybook` | Every `*.stories.tsx` (incl. examples) compiles |

## The test layer (`src/test/`)

`components.test.tsx` is **data-driven** — a single `cases` array pairs each
exported component with a minimal valid render, and three suites run over it:

1. **Smoke** — mounts and produces DOM (`container.firstChild` is truthy).
2. **Accessibility** — `jest-axe` finds no violations. `color-contrast` is
   disabled because jsdom has no rendered CSS; contrast is covered by the token
   system + Storybook visual review.
3. **Refs & interaction** — `forwardRef` reaches the DOM node; clicks, keyboard
   submit, and expand/collapse behave.

Setup lives in `src/test/setup.ts` (jest-dom + axe matchers, `cleanup`, and a
jsdom `scrollTo` polyfill). Matcher types are augmented in `src/test/vitest.d.ts`.

## Bringing a NEW component under validation (the one required step)

Add one entry to the `cases` array in `src/test/components.test.tsx` with a
minimal, **accessible** render:

```tsx
{ name: "MyThing", ui: <MyThing aria-label="…" requiredProp="…" /> },
```

That single line enrolls it in the smoke + a11y suites. Add a dedicated
`interaction` test only if it has stateful behavior (toggle, submit, select).

### Rules for a valid case

- Provide every **required** prop and an **accessible name** for inputs/icon
  buttons (`aria-label`), or axe will (correctly) fail.
- If a component manages scroll/layout, confirm the jsdom polyfills in
  `setup.ts` cover it — extend them rather than weakening the component.
- A real a11y failure is a component bug: fix the component (semantics,
  `aria-*`, focus), don't silence the rule.

## When to run

Run `pnpm validate` before committing a component and before declaring the
`figma-to-nucleux` pipeline's Step 6 (Verify) done. In CI, `pnpm validate` is
the single required check.
