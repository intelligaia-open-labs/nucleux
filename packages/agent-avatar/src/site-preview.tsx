import { AgentAvatar } from "./index";

const AGENT = { name: "Intelligaia", mark: "i", status: "agent · online" };

/** The agent avatar as nucleux.in's live preview shows it: a header chip with the mark, the name and its state. */
export function SitePreview() {
  return (
    <div className="inline-flex items-center gap-3.5 rounded-xl border border-border bg-background px-4 py-4 shadow-sm">
      <AgentAvatar name={AGENT.name} glyph={AGENT.mark} size="xl" />
      <div>
        <div className="text-sm font-semibold text-foreground">{AGENT.name}</div>
        <div className="text-xs text-muted-foreground">{AGENT.status}</div>
      </div>
    </div>
  );
}
