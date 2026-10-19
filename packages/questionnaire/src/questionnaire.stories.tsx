import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "./index";

const items = [
  { name: "direction", required: true, choices: [{ value: "delegation" }, { value: "questions" }, { value: "both" }] },
  { name: "signals", multiple: true, choices: [{ value: "progress" }, { value: "decisions" }, { value: "risks" }] },
  { name: "timing", required: true, choices: [{ value: "week" }, { value: "cycle" }, { value: "later" }] },
] as const;

const meta = {
  title: "Primitives/Questionnaire",
  component: Questionnaire,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { shortcuts: "letters" },
  argTypes: { shortcuts: { control: "inline-radio", options: [undefined, "letters", "numbers"] } },
} satisfies Meta<typeof Questionnaire>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AgentClarification: Story = {
  render: (args) => {
    const [result, setResult] = useState<string | null>(null);
    return (
      <div className="w-[32rem] max-w-full">
        <Questionnaire
          {...args}
          items={items}
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setResult(
              `Direction: ${data.get("direction") ?? "None"} · Signals: ${data.getAll("signals").join(", ") || "None"} · Timing: ${data.get("timing") ?? "None"}`,
            );
          }}
        >
          <QuestionnaireProgress />
          <QuestionnaireItem name="direction" required>
            <QuestionnaireTitle>What should we prototype next?</QuestionnaireTitle>
            <QuestionnaireDescription>Choose one direction or write another answer.</QuestionnaireDescription>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="delegation">
                <span className="font-medium">Sub-agent delegation</span>
                <QuestionnaireChoiceDescription>Show when work is delegated and what comes back.</QuestionnaireChoiceDescription>
              </QuestionnaireChoice>
              <QuestionnaireChoice value="questions">
                <span className="font-medium">Question prompts</span>
                <QuestionnaireChoiceDescription>Show choices while the agent waits for input.</QuestionnaireChoiceDescription>
              </QuestionnaireChoice>
              <QuestionnaireChoice value="both">
                <span className="font-medium">Both together</span>
                <QuestionnaireChoiceDescription>Explore one unified interaction pattern.</QuestionnaireChoiceDescription>
              </QuestionnaireChoice>
              <QuestionnaireInput aria-label="Another direction" placeholder="Type another direction…" />
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>
          <QuestionnaireItem name="signals" multiple>
            <QuestionnaireTitle>What should every progress update include?</QuestionnaireTitle>
            <QuestionnaireDescription>Select all that apply, or skip this question.</QuestionnaireDescription>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="progress">Progress</QuestionnaireChoice>
              <QuestionnaireChoice value="decisions">Decisions</QuestionnaireChoice>
              <QuestionnaireChoice value="risks">Risks</QuestionnaireChoice>
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>
          <QuestionnaireItem name="timing" required>
            <QuestionnaireTitle>When should this be revisited?</QuestionnaireTitle>
            <QuestionnaireDescription>Choose when this should be revisited.</QuestionnaireDescription>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="week">This week</QuestionnaireChoice>
              <QuestionnaireChoice value="cycle">Next cycle</QuestionnaireChoice>
              <QuestionnaireChoice value="later">Revisit later</QuestionnaireChoice>
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
        {result ? <p className="mt-4 text-sm text-muted-foreground">{result}</p> : null}
      </div>
    );
  },
};
