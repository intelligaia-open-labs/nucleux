# @nucleux/md3-personality

Material 3 Personality — choose how the agent writes while the trust language stays fixed — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

The Material 3 twin of [`@nucleux/personality`](https://www.npmjs.com/package/@nucleux/personality): it shares that package's API — the props types are re-exported from it — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, state layers and motion (with reduced-motion handling).

## Exports

- **`Md3Personality`** — the tone-matrix: a radio group of M3 filter chips with roving focus; `options`, `value`, `defaultValue`, `onValueChange`, `label`
- **`Md3PersonalityVoiceCard`** — one sample utterance plus voice tags
- **`Md3PersonalitySampleDialog`** — a short exchange; `fixed` lines carry a lock and "Same in every personality"
- `defaultTones`, types `ToneOption`, `PersonalitySampleTurn` (shared with `@nucleux/personality`)
- Types: `Md3PersonalityProps`, `Md3PersonalityVoiceCardProps`, `Md3PersonalitySampleDialogProps`

## Install

```bash
pnpm add @nucleux/md3-personality @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Personality } from "@nucleux/md3-personality";

<Md3Personality defaultValue="professional" onValueChange={setTone} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
