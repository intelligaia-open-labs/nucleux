# @nucleux/questionnaire

Multi-step questionnaire with single, multiple, freeform and skippable answers — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`Questionnaire`** — the `<form>` root; `item` / `defaultItem` / `onItemChange`, `items`, `shortcuts` (`"letters"` | `"numbers"`), `onSubmit` (runs once every enabled item validates)
- **`QuestionnaireProgress`** — "Question 1 of 3" progressbar (`render` for a custom format)
- **`QuestionnaireItem`** — one step (`<fieldset>`); `name`, `required`, `multiple`, `disabled`, `invalid`, `onStatusChange`
- **`QuestionnaireTitle`** (legend), **`QuestionnaireDescription`**, **`QuestionnaireError`**
- **`QuestionnaireChoices`**, **`QuestionnaireChoice`** (`value`, `defaultChecked`, `disabled`), **`QuestionnaireChoiceDescription`**, **`QuestionnaireInput`** (freeform answer)
- **`QuestionnaireActions`** — layout row for **`QuestionnairePrevious`**, **`QuestionnaireSkip`**, **`QuestionnaireNext`**, **`QuestionnaireSubmit`**

## Install

```bash
pnpm add @nucleux/questionnaire @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Questionnaire, QuestionnaireProgress, QuestionnaireItem, QuestionnaireTitle, QuestionnaireChoices, QuestionnaireChoice, QuestionnaireInput, QuestionnaireError, QuestionnaireActions, QuestionnairePrevious, QuestionnaireSkip, QuestionnaireNext, QuestionnaireSubmit } from "@nucleux/questionnaire";

<Questionnaire
  shortcuts="letters"
  onSubmit={(event) => {
    event.preventDefault();
    const answers = new FormData(event.currentTarget); // answers.get("direction"), answers.getAll("signals")
  }}
>
  <QuestionnaireProgress />
  <QuestionnaireItem name="direction" required>
    <QuestionnaireTitle>What should we prototype next?</QuestionnaireTitle>
    <QuestionnaireChoices>
      <QuestionnaireChoice value="delegation">Sub-agent delegation</QuestionnaireChoice>
      <QuestionnaireChoice value="questions">Question prompts</QuestionnaireChoice>
      <QuestionnaireInput aria-label="Another direction" placeholder="Type another direction…" />
    </QuestionnaireChoices>
    <QuestionnaireError />
  </QuestionnaireItem>
  <QuestionnaireItem name="signals" multiple>
    <QuestionnaireTitle>What should every update include?</QuestionnaireTitle>
    <QuestionnaireChoices>
      <QuestionnaireChoice value="progress">Progress</QuestionnaireChoice>
      <QuestionnaireChoice value="risks">Risks</QuestionnaireChoice>
    </QuestionnaireChoices>
    <QuestionnaireError />
  </QuestionnaireItem>
  <QuestionnaireActions>
    <QuestionnairePrevious />
    <QuestionnaireSkip />
    <QuestionnaireNext />
    <QuestionnaireSubmit>Save answers</QuestionnaireSubmit>
  </QuestionnaireActions>
</Questionnaire>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
