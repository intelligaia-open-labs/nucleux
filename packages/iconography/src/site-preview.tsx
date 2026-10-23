import { Button } from "@nucleux/button";
import { Iconography } from "./index";

const chip = "h-auto gap-2 rounded-[8px] px-3.5 py-2 text-xs font-medium leading-[1.55] tracking-normal shadow-none";

/** The AI action as nucleux.in's live preview shows it: the sparkle marks Generate, and only Generate. */
export function SitePreview() {
  const generate = () => {};
  const save = () => {};
  return (
    <div className="inline-flex gap-2.5 rounded-[8px] border border-border bg-background p-3.5 leading-[1.55] shadow-[0_1px_2px_0_hsl(var(--nx-ink-800)/0.04),0_1px_3px_0_hsl(var(--nx-ink-800)/0.06)]">
      <Iconography
        label="Generate"
        agentName="Aria"
        onClick={generate}
        className={`${chip} border-0 bg-foreground text-background hover:bg-foreground/90 [&_svg]:size-3`}
      />
      <Button variant="secondary" onClick={save} className={`${chip} text-muted-foreground`}>
        Save
      </Button>
    </div>
  );
}
