import { Button } from "@nucleux/button";
import { Nudge } from "./index";

const TIP = "Try uploading a PDF — the assistant can summarise it.";

/** A tip bubble pointing at the upload control, the moment it would help. */
export function SitePreview() {
  return (
    <div className="flex w-[28rem] items-start">
      <Nudge variant="tooltip-nudge" side="right" message={TIP} dismissible={false}>
        <Button
          variant="secondary"
          aria-label="Upload a PDF"
          className="mt-6 h-[34px] w-[54px] rounded-[8px] bg-[hsl(var(--nx-ink-25))] shadow-none"
        />
      </Nudge>
    </div>
  );
}
