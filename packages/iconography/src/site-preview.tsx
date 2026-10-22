import { Button } from "@nucleux/button";
import { Iconography } from "./index";

/** The AI action as nucleux.in's live preview shows it: the sparkle marks Generate, and only Generate. */
export function SitePreview() {
  const generate = () => {};
  const save = () => {};
  return (
    <div className="inline-flex gap-2.5 rounded-xl border border-border bg-background p-3.5 shadow-sm">
      <Iconography label="Generate" agentName="Aria" onClick={generate} className="font-medium [&_svg]:size-3" />
      <Button variant="secondary" onClick={save} className="font-medium text-muted-foreground shadow-none">
        Save
      </Button>
    </div>
  );
}
