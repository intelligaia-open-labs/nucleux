# @nucleux/voice-tone

Voice & Tone — say how the reply should sound (named presets, a rules list, a sample line), sent beside the prompt and never editing it — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

A Material 3 twin with the same API ships as [`@nucleux/md3-voice-tone`](https://www.npmjs.com/package/@nucleux/md3-voice-tone).

## Exports

- **`VoiceTone`** — `variant="settings"` (default): a preferences panel with tone presets, a rules list and a sample sentence. `variant="composer"`: a composer with a Tone chip that opens the tone picker (cards, list, segmented or slider; sample line; recommendation marked, never applied; “Or describe a tone”), then names the choice and can be changed or removed with Undo. `variant="chip"`: the chip and picker alone, for your own composer.
- **`useVoiceTone`** — the shared state and keyboard model (used by the Material 3 twin).
- **`defaultVoiceTones`**, **`defaultVoiceToneRules`**, **`VOICE_TONE_CUSTOM`**
- Types: `VoiceToneProps`, `VoiceToneOption`, `VoiceToneRule`, `VoiceToneSetting`, `VoiceToneVariant`, `VoiceToneLayout`, `VoiceToneNotice`, `VoiceToneState`

## Install

```bash
pnpm add @nucleux/voice-tone @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { VoiceTone, defaultVoiceToneRules } from "@nucleux/voice-tone";

// Preferences: set once, applied to every reply.
<VoiceTone defaultValue="professional" rules={defaultVoiceToneRules} onValueChange={saveTone} onRulesChange={saveRules} />

// In the composer: the tone travels with the request as a setting — the prompt is never edited.
<VoiceTone variant="composer" onSubmit={(text, setting) => send(text, { tone: setting })} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
