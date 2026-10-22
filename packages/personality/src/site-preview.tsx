import { PersonalityVoiceCard } from "./index";

const SAMPLE = "Here's what I found. Two of these look unusual — I flagged them at the top. Want me to dig in?";
const VOICE = ["calm", "proactive"];

/** The personality as nucleux.in's live preview shows it: one line in the agent's voice, and the voice beneath it. */
export function SitePreview() {
  return <PersonalityVoiceCard quote={SAMPLE} tags={VOICE} className="w-[26rem] max-w-full" />;
}
