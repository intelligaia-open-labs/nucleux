import { useState } from "react";
import { KnowledgeBase, KnowledgeBaseCoverage, KnowledgeBaseSources, type KnowledgeSource, type KnowledgeBaseSourceRef } from "./index";

const BASES: KnowledgeSource[] = [
  { id: "docs", name: "Product docs", meta: "412 pages" },
  { id: "playbook", name: "Sales playbook", meta: "38 pages" },
];

const ANSWER = "Renewals require 90 days notice unless waived by the account executive.";

const READ: KnowledgeBaseSourceRef[] = [
  { id: "playbook-4-1", name: "Renewal Playbook v3", section: "§4.1" },
  { id: "msa-12", name: "MSA Template", section: "§12" },
  { id: "faq", name: "Sales Ops FAQ" },
];

/** The knowledge base as nucleux.in's live preview shows it: the bases in use, a grounded answer with its sources, and coverage. */
export function SitePreview() {
  const [selected, setSelected] = useState(["docs", "playbook"]);
  return (
    <div className="flex w-full max-w-[30rem] flex-col gap-2.5">
      <KnowledgeBase
        variant="chips"
        heading="Grounded in"
        sources={BASES}
        value={selected}
        onValueChange={setSelected}
        onAdd={() => {}}
        addLabel="add base"
        className="p-3.5"
      />
      <div className="rounded-xl border border-border bg-background p-3.5">
        <p className="border-b border-border pb-3 text-sm text-foreground">{ANSWER}</p>
        <KnowledgeBaseSources sources={READ} className="mt-2.5" />
      </div>
      <KnowledgeBaseCoverage level="high" matches={14} className="self-start" />
    </div>
  );
}
