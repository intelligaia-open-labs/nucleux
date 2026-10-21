# @nucleux/md3-voice-tone

Material 3 Voice & Tone — say how the reply should sound (tone cards, a rules list, a sample line), shown as a Tone chip in the composer and never editing the prompt — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

**Same API as the shadcn twin.** The props, callbacks, keyboard model and accessible names are those of [`@nucleux/voice-tone`](https://www.npmjs.com/package/@nucleux/voice-tone) (`VoiceTone`) — the props types are re-exported from it and the logic is its `useVoiceTone` — so you switch families by changing only the import. Only the look differs: Material 3 colour roles, shape, elevation, state layers and motion (reduced under `prefers-reduced-motion`).

## Exports

- **`Md3VoiceTone`** — a Tone chip in `Md3AgentComposer` (outlined assist chip; set, a secondary-container chip “Tone Professional” with change and remove) opening a surface-container picker of tone cards with a sample line, the recommendation marked and an outlined “Or describe a tone” field; or (`variant="settings"`) an outlined card with tone presets, `Md3Checkbox` rules and a sample sentence
- Re-exported from the twin: `useVoiceTone`, `defaultVoiceTones`, `defaultVoiceToneRules`, `VOICE_TONE_CUSTOM`
- Types: `Md3VoiceToneProps`, `VoiceToneOption`, `VoiceToneRule`, `VoiceToneSetting`, `VoiceToneVariant`, `VoiceToneLayout`, `VoiceToneNotice`, `VoiceToneState`

## Install

```bash
pnpm add @nucleux/md3-voice-tone @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3VoiceTone } from "@nucleux/md3-voice-tone";

<Md3VoiceTone
  variant="composer"
  defaultValue="professional"
  onSubmit={(text, setting) => send(text, { tone: setting })}
/>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
