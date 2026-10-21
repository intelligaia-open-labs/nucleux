# @nucleux/personality

Personality — the voice and tone the assistant speaks in — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

- **`Personality`** — the `tone-matrix`: a radio group of tones with roving focus (arrow keys, Home/End). `options` (`ToneOption`: `value`, `label`, `icon`, `description`), `value` / `defaultValue` / `onValueChange`, `label`; **`defaultTones`**
- **`PersonalityVoiceCard`** — the `voice-card`: `quote` + `tags`
- **`PersonalitySampleDialog`** — the `sample-dialog`: `turns` (`from` user/agent, `text`, `fixed`) built on Bubble; `fixed` lines carry a lock and "Same in every personality"

Tone changes how the agent writes, never what it may do: keep permission, caveat and refusal strings outside it.

## Install

```bash
pnpm add @nucleux/personality @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Personality, PersonalityVoiceCard, PersonalitySampleDialog } from "@nucleux/personality";

<PersonalityVoiceCard quote="Here's what I found. Want me to dig in?" tags={["calm", "proactive"]} />
<Personality value={tone} onValueChange={setTone} />
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
