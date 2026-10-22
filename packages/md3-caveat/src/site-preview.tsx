import { ChevronRight, RefreshCw } from "lucide-react";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Caveat } from "./index";

const MESSAGE = "2 of 8 interviews could not be opened, so this summary reflects 6.";
const DETAIL = "Themes raised only in those two calls are missing, not just under-counted.";

/** Md3Caveat as nucleux.in's live preview shows it: the specific gap as a tonal card, with the steps that close it. */
export function SitePreview() {
  return (
    <Md3Caveat
      variant="output-footer"
      aria-label="Caveat about this summary"
      detail={DETAIL}
      className="mt-0 max-w-xl"
      actions={
        <>
          <Md3Button variant="text" icon={<ChevronRight aria-hidden="true" />} aria-expanded={false}>
            Review sources
          </Md3Button>
          <Md3Button variant="text" icon={<RefreshCw aria-hidden="true" />}>
            Reconnect
          </Md3Button>
        </>
      }
    >
      {MESSAGE}
    </Md3Caveat>
  );
}
