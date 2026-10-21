# @nucleux/md3-voice-input

Material 3 Voice Input — speak the request into the composer, review the words, send them yourself — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

This is the Material 3 twin of [`@nucleux/voice-input`](https://www.npmjs.com/package/@nucleux/voice-input) (`VoiceInput`). It shares the twin's API exactly — the props types are the twin's own — so you can switch families by changing only the import. Only the look differs: MD3 colour roles, shape, elevation, state layers and motion (stilled under reduced motion).

## Exports

- **`Md3VoiceInput`** — waveform / mic-button / transcript-stream; a lit secondary mic state over a soft gradient, Pause/Resume, Cancel and Stop (which never sends), an MD3 loading indicator while transcribing
- Types: `Md3VoiceInputProps`, `Md3VoiceInputState`, `Md3VoiceInputVariant`

## Install

```bash
pnpm add @nucleux/md3-voice-input @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3VoiceInput } from "@nucleux/md3-voice-input";

<Md3VoiceInput state={state} duration="0:08" onStart={start} onPause={pause} onConfirm={stop} onCancel={cancel} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
