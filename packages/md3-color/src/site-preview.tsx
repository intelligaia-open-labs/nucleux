import { Md3AiColorStatus } from "./index";

/** The AI colour as nucleux.in's live preview shows it: Aria's task status, idle — colour, icon and words together. */
export function SitePreview() {
  return (
    <div className="grid h-40 w-[22.5rem] max-w-full place-items-center rounded-md-xl bg-md-surface-container-low">
      <Md3AiColorStatus status="available" label="Available" />
    </div>
  );
}
