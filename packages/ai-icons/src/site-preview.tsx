import * as React from "react";
import { Button } from "@nucleux/button";
import { CardContainer, CardDivider } from "@nucleux/card";
import { AiIcons, AiSparkleIcon } from "./index";

const MESSAGE = "I've found three at-risk accounts in your pipeline. Want me to draft personalised outreach for each?";

/** The AI marks as nucleux.in's live preview shows them: the thinking orb on Aria, the sparkle on the one action that runs AI. */
export function SitePreview() {
  const [drafting, setDrafting] = React.useState(false);
  const viewAccounts = () => {};
  return (
    <div className="w-[28rem] max-w-full rounded-xl border border-border bg-background p-5 shadow-sm">
      <CardContainer className="overflow-hidden shadow-none">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5">
          <AiIcons variant="thinking-orb" />
          <div>
            <div className="text-[13px] font-semibold text-foreground">Aria</div>
            <div role="status" className="text-[11px] text-muted-foreground">
              Generating…
            </div>
          </div>
        </div>
        <CardDivider />
        <div className="p-3.5">
          <p className="mb-3.5 mt-0 text-[13px] leading-relaxed text-foreground">{MESSAGE}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" leftIcon={<AiSparkleIcon className="size-3" />} onClick={() => setDrafting(true)} className="font-medium">
              {drafting ? "Drafting…" : "Generate drafts"}
            </Button>
            <Button size="sm" variant="secondary" onClick={viewAccounts} className="font-medium shadow-none">
              View accounts
            </Button>
          </div>
        </div>
      </CardContainer>
    </div>
  );
}
