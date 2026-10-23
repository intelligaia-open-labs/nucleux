import * as React from "react";
import { Button } from "@nucleux/button";
import { AiIcons } from "./index";

const MESSAGE = "I've found three at-risk accounts in your pipeline. Want me to draft personalised outreach for each?";

/** The site's sparkle, drawn high in its box as on nucleux.in. */
const Sparkle = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" />
  </svg>
);

const action = "h-auto gap-1.5 rounded-[8px] px-[13px] py-[7px] text-xs font-medium leading-[1.55] tracking-normal shadow-none";

/** The AI marks as nucleux.in's live preview shows them: the thinking orb on Aria, the sparkle on the one action that runs AI. */
export function SitePreview() {
  const [drafting, setDrafting] = React.useState(false);
  const viewAccounts = () => {};
  return (
    <div className="w-full max-w-[420px] overflow-hidden rounded-xl border border-border bg-background leading-[1.55] text-foreground">
      <div className="flex items-center gap-2.5 border-b border-border px-3.5 py-[11px]">
        <AiIcons variant="thinking-orb" className="size-[30px]" />
        <div>
          <div className="text-[13px] font-semibold">Aria</div>
          <div role="status" className="text-[10.5px] text-faint">
            Generating…
          </div>
        </div>
      </div>
      <div className="p-3.5">
        <p className="mb-3.5 mt-0 text-[12.5px]">{MESSAGE}</p>
        <div className="flex flex-wrap gap-[7px]">
          <Button
            leftIcon={<Sparkle />}
            onClick={() => setDrafting(true)}
            className={`${action} border-0`}
          >
            {drafting ? "✓ Drafting…" : "Generate drafts"}
          </Button>
          <Button variant="secondary" onClick={viewAccounts} className={`${action} border-input`}>
            View accounts
          </Button>
        </div>
      </div>
    </div>
  );
}
