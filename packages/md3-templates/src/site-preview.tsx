import { FileText, Flag, MessagesSquare } from "lucide-react";
import { Md3TemplatesList, type TemplatesListItem } from "./index";

const TEMPLATES: TemplatesListItem[] = [
  { icon: <FileText />, title: "Weekly product update",
    description: "A Friday update from this week’s meetings: what happened, what was decided and what’s next.",
    meta: "3 inputs · Meeting knowledge, Google Drive" },
  { icon: <MessagesSquare />, title: "Customer feedback digest",
    description: "Themes from this month’s customer calls, with quotes and how often each came up.",
    meta: "2 inputs · Meeting knowledge" },
  { icon: <Flag />, title: "Launch readiness check",
    description: "Open risks, owners and dates from the meetings about a release.",
    meta: "2 inputs · Meeting knowledge" },
];

/** The Material 3 templates as nucleux.in's live preview shows them: a titled list of three templates. */
export function SitePreview() {
  // Open the chosen template's inputs in your app.
  const openTemplate = (_prompt: string, _template: TemplatesListItem) => {};
  return (
    <section aria-labelledby="templates-heading" className="flex w-full max-w-[35rem] flex-col gap-3">
      <h2 id="templates-heading" className="text-[22px] font-medium leading-7 text-md-on-surface">
        Templates
      </h2>
      <Md3TemplatesList variant="grouped" aria-labelledby="templates-heading" items={TEMPLATES} onSelect={openTemplate} />
    </section>
  );
}
