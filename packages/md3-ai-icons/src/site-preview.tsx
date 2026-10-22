import * as React from "react";
import { Link2, Paperclip } from "lucide-react";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Card } from "@nucleux/md3-card";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3AiIconLegend, Md3AiSparkleIcon } from "./index";

const DRAFT =
  "We fixed a bunch of stuff in onboarding and the export thing should work better now, plus some small UI changes people asked about.";

/** The AI marks as nucleux.in's live preview shows them: Rewrite carries the AI-action mark, and the icon language explains it. */
export function SitePreview() {
  const [draft, setDraft] = React.useState(DRAFT);
  const rewrite = () => {};
  return (
    <div className="flex w-[37.5rem] max-w-full flex-col gap-7">
      <Md3Card className="shadow-none">
        <div role="toolbar" aria-label="Release note tools" className="flex items-center gap-1 border-b border-md-outline-variant py-3 pl-4 pr-2">
          <span className="mr-auto text-base font-medium text-md-on-surface">Release note · September</span>
          <Md3IconButton aria-label="Add a link">
            <Link2 aria-hidden="true" />
          </Md3IconButton>
          <Md3IconButton aria-label="Attach a file">
            <Paperclip aria-hidden="true" />
          </Md3IconButton>
          <span aria-hidden="true" className="mx-2 h-6 w-px bg-md-outline-variant" />
          <Md3Button variant="tonal" icon={<Md3AiSparkleIcon />} onClick={rewrite} disabled={!draft.trim()}>
            Rewrite
          </Md3Button>
        </div>
        <label className="m-4 block rounded-t-md-xs border-b-2 border-md-on-surface-variant bg-md-surface-container-high px-4 pb-2 pt-2">
          <span className="block text-xs tracking-[0.4px] text-md-on-surface-variant">What changed</span>
          <textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="block w-full resize-none bg-transparent text-base text-md-on-surface outline-none"
          />
        </label>
      </Md3Card>
      <Md3AiIconLegend current="ai-action" />
    </div>
  );
}
