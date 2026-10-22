import { Captions } from "lucide-react";
import { Badge } from "@nucleux/badge";
import { StructuredInputSlots, type StructuredInputSlot } from "./index";

const SLOTS: StructuredInputSlot[] = [
  { name: "audience", label: "Audience", options: [{ value: "execs", label: "Execs" }, { value: "team", label: "Team" }, { value: "customers", label: "Customers" }] },
  { name: "length", label: "Length", options: [{ value: "3", label: "3 bullets" }, { value: "5", label: "5 bullets" }, { value: "para", label: "A paragraph" }] },
  { name: "topic", label: "Topic", wide: true },
  { name: "tags", label: "Tags", type: "tags", wide: true },
];

const VALUES = { audience: "execs", length: "3", topic: "Yesterday's standup", tags: "@sam, p:Apollo, Friday" };

/** StructuredInputSlots as nucleux.in's live preview shows it: a structured prompt, filled in and ready to generate. */
export function SitePreview() {
  return (
    <div className="w-full max-w-[30rem] rounded-2xl border border-border bg-background px-4 py-7 shadow-sm">
      <StructuredInputSlots
        title="Structured prompt"
        icon={<Captions />}
        aside={<Badge variant="outline" className="rounded-full font-normal text-muted-foreground">Template</Badge>}
        slots={SLOTS}
        defaultValues={VALUES}
        onSubmit={() => {}}
        className="gap-x-2 gap-y-4 px-4"
      />
    </div>
  );
}
