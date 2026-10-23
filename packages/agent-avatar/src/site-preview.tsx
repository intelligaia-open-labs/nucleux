import { AgentAvatar } from "./index";

const AGENT = { name: "Intelligaia", mark: "i", status: "agent · online" };

/** The agent avatar as nucleux.in's live preview shows it: a header chip with the mark, the name and its state. */
export function SitePreview() {
  return (
    <div className="inline-flex items-center gap-3.5 rounded-[8px] border border-border bg-background p-4 leading-[1.55] text-foreground shadow-[0_1px_2px_0_hsl(var(--nx-ink-800)/0.04),0_1px_3px_0_hsl(var(--nx-ink-800)/0.06)]">
      <AgentAvatar name={AGENT.name} glyph={AGENT.mark} size="xl" />
      <div>
        <div className="text-[14px] font-semibold">{AGENT.name}</div>
        <div className="text-[12px] text-faint">{AGENT.status}</div>
      </div>
    </div>
  );
}
