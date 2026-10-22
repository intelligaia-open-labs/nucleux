import { useState } from "react";
import { ListTodo } from "lucide-react";
import { Md3OpenInput, Md3OpenInputModelChip } from "@nucleux/md3-open-input";
import { Md3StructuredInputSlots, type StructuredInputSlot } from "./index";

const SLOTS: StructuredInputSlot[] = [
  { name: "task", label: "Task", required: true, wide: true, helper: "What needs doing, in a few words." },
  {
    name: "owner",
    label: "Owner",
    required: true,
    helper: "Who will do it.",
    options: [{ value: "maya", label: "Maya Chen" }, { value: "dev", label: "Dev Patel" }, { value: "sam", label: "Sam Ortiz" }],
  },
  { name: "due", label: "Due date", type: "date", required: true, helper: "When it should be done." },
  {
    name: "priority",
    label: "Priority",
    type: "segmented",
    required: true,
    options: [{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }],
  },
];

const SUGGESTED = { task: "Fix export timeout", owner: "maya", due: "2026-12-10", priority: "high" };

/** Md3StructuredInputSlots as nucleux.in's live preview shows it: Aria's follow-up task form, filled from the blocker, above the composer. */
export function SitePreview() {
  const [value, setValue] = useState("");

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3 text-md-on-surface">
      <p className="ml-auto max-w-[80%] rounded-md-xl bg-md-primary-container/60 px-4 py-3">
        <span className="block text-xs text-md-on-surface-variant">You</span>
        Create a follow-up task for this blocker
      </p>
      <p className="mr-12 rounded-md-xl bg-md-surface-container px-4 py-3">
        <span className="block text-xs text-md-on-surface-variant">Aria</span>
        Here’s a follow-up task. I suggested some values from the blocker — check them before I create it.
      </p>
      <Md3StructuredInputSlots
        title="Follow-up task"
        icon={<ListTodo />}
        aside={
          <>
            For blocker <b className="font-semibold text-md-on-surface">EXP-210</b> · CSV export times out
          </>
        }
        slots={SLOTS}
        defaultValues={SUGGESTED}
        showProgress
        onCancel={() => {}}
        onSubmit={() => {}}
        submitLabel="Review"
        className="rounded-md-xl border border-md-outline-variant bg-md-surface-container-lowest p-4"
      />
      <Md3OpenInput
        aria-label="Message Aria"
        placeholder="Or just say it — “assign it to Dev”…"
        value={value}
        onValueChange={setValue}
        onSubmit={() => setValue("")}
        onAdd={() => {}}
        model={<Md3OpenInputModelChip name="Balanced" detail="High" />}
        onVoice={() => {}}
      />
    </div>
  );
}
