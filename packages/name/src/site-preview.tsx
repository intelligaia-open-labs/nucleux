import { AgentName } from "./index";

const AGENT = { name: "Aria", mark: "i", status: "drafting" };

/** The agent's name as nucleux.in's live preview shows it: "Aria is drafting", with the working dots. */
export function SitePreview() {
  return <AgentName variant="name-status" name={AGENT.name} avatarGlyph={AGENT.mark} status={AGENT.status} />;
}
