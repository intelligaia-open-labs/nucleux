import { CardContainer } from "@nucleux/card";
import { PromptEnhancer, type PromptEnhancerSuggestion } from "./index";

const PROMPT = "summarise yesterday's standup";

/** What the app's enhancer returned for this prompt (no model is called by the component). */
const SUGGESTION: PromptEnhancerSuggestion = {
  text: "Summarise yesterday's standup in 3 bullets for the leadership review",
};

const enhance = () => Promise.resolve(SUGGESTION);

/** PromptEnhancer as nucleux.in's live preview shows it: what you wrote beside the enhanced prompt, then Use enhanced or Keep original. */
export function SitePreview() {
  return (
    <CardContainer className="w-full max-w-[30rem] p-4">
      <PromptEnhancer
        defaultValue={PROMPT}
        hint="Aria will expand this prompt"
        onEnhance={enhance}
        defaultState="enhanced"
        defaultSuggestion={SUGGESTION}
        showChanges={false}
        allowEdit={false}
      />
    </CardContainer>
  );
}
