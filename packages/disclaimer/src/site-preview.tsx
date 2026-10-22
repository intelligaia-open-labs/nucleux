import { Disclaimer } from "./index";

const CAPABILITIES = ["Summarise documents", "Draft replies", "Pull from connected sources"];
const CUTOFF = "Apr 2026";

/** What the assistant can do, with its knowledge cutoff — shown at the start of the experience. */
export function SitePreview() {
  return <Disclaimer className="w-[23rem]" title="What this can do" items={CAPABILITIES} cutoff={CUTOFF} />;
}
