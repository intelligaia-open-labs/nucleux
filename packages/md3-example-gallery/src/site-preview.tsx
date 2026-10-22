import { useState } from "react";
import { FileText, MessagesSquare, Mic, Plus, Search, UserSearch } from "lucide-react";
import { Md3AgentComposer } from "@nucleux/md3-agent-composer";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3ExampleGallery, type ExampleGalleryExample } from "./index";

const EXAMPLES: ExampleGalleryExample[] = [
  { category: "Find", icon: <Search />, title: "Find unresolved decisions", description: "Decisions raised this week that still have no outcome.",
    needs: "Uses meetings in this workspace", prompt: "Find unresolved decisions from this week’s meetings." },
  { category: "Find", icon: <UserSearch />, title: "Show action items without owners", description: "Follow-ups nobody has claimed yet.",
    needs: "Uses meetings in this workspace", prompt: "Show this week’s action items that have no owner." },
  { category: "Summarize", icon: <FileText />, title: "Summarize today’s meeting", description: "Decisions, open questions and next steps.",
    needs: "Needs a meeting with a transcript", prompt: "Summarize today’s meeting: decisions, open questions and next steps." },
  { category: "Summarize", icon: <MessagesSquare />, title: "Compare feedback across customer calls", description: "Themes that repeat across calls tagged Customer.",
    needs: "Uses calls tagged Customer", prompt: "Compare customer feedback across this month’s customer calls." },
];

/** The Material 3 example gallery as nucleux.in's live preview shows it: grouped examples above the composer. */
export function SitePreview() {
  const [draft, setDraft] = useState("");
  return (
    <div className="flex w-full max-w-[35rem] flex-col gap-4">
      <Md3ExampleGallery variant="grouped-list" label="Try an example" examples={EXAMPLES} onSelect={setDraft} />
      <Md3AgentComposer
        value={draft}
        onValueChange={setDraft}
        onSubmit={() => setDraft("")}
        placeholder="Or describe your own task…"
        leftActions={<Md3IconButton aria-label="Add"><Plus /></Md3IconButton>}
        rightActions={
          <>
            <span className="text-sm font-medium text-md-primary">Balanced <span className="text-md-on-surface-variant">High</span></span>
            <Md3IconButton aria-label="Dictate"><Mic /></Md3IconButton>
          </>
        }
      />
    </div>
  );
}
