# @nucleux/voice-input

VoiceInput — a live dictation bar with a waveform — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Install

```bash
pnpm add @nucleux/voice-input @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { VoiceInput } from "@nucleux/voice-input";

<VoiceInput
  variant="transcript-stream"       // "waveform" (default) | "mic-button" | "transcript-stream"
  state={state}                     // "idle" | "recording" | "paused" | "transcribing" | "error"
  duration="0:14"
  transcript={finalWords}
  interimTranscript={wordsStillBeingHeard}
  listeningLabel="Aria is listening"
  onStart={start}
  onPause={pause}
  onResume={resume}
  onCancel={discard}                // typed text stays
  onConfirm={stop}                  // puts the transcript in the field — never sends
  onRetry={retry}
/>
```

Speech recognition is the app's job; this component renders the states. Keep the verbs distinct:
**Pause** (mic off, keep progress), **Resume**, **Stop** (end, keep what was said, do not send) and
**Cancel** (discard this recording). State changes are announced through a polite live region, and the
waveform, caret and pulse stop under `prefers-reduced-motion`.

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
