import { Md3Disclosure } from "@nucleux/md3-disclosure";
import { Md3AgentAvatar } from "./index";

const AGENT = { name: "Aria", descriptor: "AI agent" };

/** Aria's approved mark: an abstract orbit, never a face. Swap in your own asset. */
function AriaMark() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="!size-full text-md-primary">
      <path d="M29.5 14.5A11 11 0 1 0 31 20" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <circle cx="20" cy="20" r="5.5" fill="currentColor" />
      <circle cx="30.5" cy="11.5" r="2.5" fill="currentColor" />
    </svg>
  );
}

/** The agent avatar as nucleux.in's live preview shows it: Aria at rest, with the "AI agent" label. */
export function SitePreview() {
  return (
    <div className="flex items-center gap-3">
      <Md3AgentAvatar name={AGENT.name} glyph={<AriaMark />} shape="circle" />
      <div className="flex items-center gap-2 text-base text-md-on-surface">
        {AGENT.name}
        <Md3Disclosure
          icon={null}
          label={AGENT.descriptor}
          className="h-6 !rounded-full border border-md-outline-variant bg-transparent px-2.5 text-sm font-medium tracking-[0.1px] text-md-tertiary"
        />
      </div>
    </div>
  );
}
