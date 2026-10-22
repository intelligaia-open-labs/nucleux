import * as React from "react";
import { ProactiveSuggestion } from "./index";

const FINDING = "Three renewals expire this week";
const RECOMMENDATION = "Acme, Globex, and TechCorp are all due by Friday — want Aria to draft outreach for each?";

/** The agent noticed something specific: the finding, one action, and a way to dismiss it. */
export function SitePreview() {
  const [drafting, setDrafting] = React.useState(false);

  return (
    <div className="w-[26rem] rounded-lg border border-border bg-background p-5 shadow-sm">
      <ProactiveSuggestion
        agentName="Aria"
        title={FINDING}
        description={RECOMMENDATION}
        actionLabel={drafting ? "✓ Drafting…" : "Draft now"}
        onAction={() => setDrafting(true)}
        dismissDisplay="button"
        dismissLabel="Dismiss"
      />
    </div>
  );
}
