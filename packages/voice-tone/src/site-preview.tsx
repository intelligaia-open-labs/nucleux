import { VoiceTone, type VoiceToneOption, type VoiceToneRule } from "./index";

const TONES: VoiceToneOption[] = [
  { id: "professional", name: "Professional", description: "Formal, clear", sample: "Please find the updated proposal attached for your review." },
  { id: "friendly", name: "Friendly", description: "Warm, easy", sample: "Hey! Attached is the updated proposal — let me know what you think!" },
  { id: "direct", name: "Direct", description: "Brief, blunt", sample: "Proposal attached. Review by Friday." },
];

const RULES: VoiceToneRule[] = [
  { id: "no-emojis", label: "No emojis" },
  { id: "uk-english", label: "UK English spelling" },
  { id: "no-passive", label: "Avoid passive voice" },
];

/** VoiceTone as nucleux.in's live preview shows it: Professional chosen, two rules on, and the sample sentence in that tone. */
export function SitePreview() {
  return (
    <VoiceTone
      variant="settings"
      tones={TONES}
      rules={RULES}
      defaultValue="professional"
      defaultRuleValues={["no-emojis", "uk-english"]}
      className="w-[30rem] max-w-full p-4"
    />
  );
}
