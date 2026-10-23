import { StructuredInputSlots, type StructuredInputSlot } from "./index";

const SLOTS: StructuredInputSlot[] = [
  { name: "audience", label: "Audience", options: [{ value: "execs", label: "Execs" }, { value: "team", label: "Team" }, { value: "customers", label: "Customers" }] },
  { name: "length", label: "Length", options: [{ value: "3", label: "3 bullets" }, { value: "5", label: "5 bullets" }, { value: "para", label: "A paragraph" }] },
  { name: "topic", label: "Topic", wide: true },
  { name: "tags", label: "Tags", type: "tags", wide: true },
];

const VALUES = { audience: "execs", length: "3", topic: "Yesterday's standup", tags: "@sam, p:Apollo, Friday" };

/** The site's template glyph: a card with two lines of text. */
const TemplateIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M8 10h8M8 14h5" />
  </svg>
);

/** StructuredInputSlots as nucleux.in's live preview shows it: a structured prompt, filled in and ready to generate. */
export function SitePreview() {
  return (
    <StructuredInputSlots
      title="Structured prompt"
      icon={<TemplateIcon />}
      aside={
        <span className="rounded-full border border-border bg-[hsl(var(--nx-ink-25))] px-2 py-0.5 text-[10px] leading-[1.55] text-faint">
          Template
        </span>
      }
      slots={SLOTS}
      defaultValues={VALUES}
      onSubmit={() => {}}
      headerClassName="-mx-[18px] mb-1 px-[18px] py-3.5"
      className="w-[30rem] max-w-full gap-x-2 gap-y-2.5 overflow-hidden rounded-[14px] border border-border bg-background px-[34px] pb-[30px] pt-4 shadow-sm"
    />
  );
}
