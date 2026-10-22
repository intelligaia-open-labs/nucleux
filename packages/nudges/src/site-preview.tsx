import { Button } from "@nucleux/button";
import { Nudge } from "./index";

const TIP = "Try uploading a PDF — the assistant can summarise it.";

/** A tip bubble pointing at the upload control, the moment it would help. */
export function SitePreview() {
  return (
    <div className="flex h-36 w-[28rem] items-center">
      <Nudge variant="tooltip-nudge" side="right" message={TIP} dismissible={false}>
        <Button variant="secondary" aria-label="Upload a PDF" className="h-[34px] w-[54px] bg-muted/40 shadow-none" />
      </Nudge>
    </div>
  );
}
