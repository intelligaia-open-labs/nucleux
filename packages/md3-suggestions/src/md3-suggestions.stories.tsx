import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Md3AgentComposer } from "@nucleux/md3-agent-composer";
import { Md3Suggestions, Md3SuggestionsComposer, type Md3SuggestionItem } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const RELEASE: Md3SuggestionItem[] = [
  { id: "blockers", label: "Include unresolved blockers" },
  { id: "owner", label: "Group the work by owner" },
  { id: "august", label: "Compare with the August release" },
];
const REFINE: Md3SuggestionItem[] = [
  { id: "shorter", label: "Make it shorter" },
  { id: "formal", label: "Make it formal" },
  { id: "examples", label: "Add examples" },
];
const FOLLOW_UPS: Md3SuggestionItem[] = [
  { id: "why", label: "Why Acme?" },
  { id: "outreach", label: "Draft outreach" },
  { id: "at-risk", label: "See all at-risk" },
];
const SELECTION: Md3SuggestionItem[] = [
  { id: "rewrite", label: "Rewrite" },
  { id: "shorten", label: "Shorten" },
  { id: "expand", label: "Expand" },
];
const REASON = "Release summaries are read to decide what still needs attention — 3 blockers are open.";
const DRAFT = "Summarize the September release.";
const fitsRelease = (draft: string) => /release/i.test(draft) && !/blocker/i.test(draft);

const meta = {
  title: "Material 3 Agent/Md3Suggestions",
  component: Md3Suggestions,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { suggestions: RELEASE },
} satisfies Meta<typeof Md3Suggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };


/**
 * The site's live preview: after a pause on “Summarize the September
 * release.”, “Aria suggests” chips sit just above the composer with Why and
 * Dismiss. Adding one appends its words after yours, with Undo; nothing is
 * sent. (Fixed content; the other stories take args.)
 */
export const LivePreview: Story = {
  args: {},
  render: () => (
    <div className="w-[38rem] rounded-md-xl bg-md-surface p-8">
      <Md3SuggestionsComposer
        defaultValue={DRAFT}
        suggestions={RELEASE}
        label="Aria suggests"
        reason={REASON}
        isRelevant={fitsRelease}
        onSubmit={() => {}}
      />
    </div>
  ),
};

/**
 * Wired to the composer: after a pause on “Summarize the September release.”
 * three chips appear, marked as Aria’s, with Why and Dismiss. Adding one
 * appends its words after yours, with Undo. Edit the request so it no longer
 * mentions a release and they withdraw.
 */
export const AboveComposer: Story = {
  args: { suggestions: RELEASE, label: "Aria suggests", reason: REASON, actionLabel: "Add to prompt" },
  render: (args) => (
    <div className="w-[34rem] bg-md-surface p-4">
      <Md3SuggestionsComposer
        defaultValue={DRAFT}
        suggestions={args.suggestions}
        label={args.label}
        reason={args.reason}
        actionLabel={args.actionLabel}
        isRelevant={fitsRelease}
        onSubmit={() => {}}
      />
    </div>
  ),
};

/** Compose chips: quick edits just above the composer — tap to drop into the input. */
export const ComposeChips: Story = {
  args: { suggestions: REFINE, variant: "compose", "aria-label": "Quick edits" },
  render: (args) => {
    const [draft, setDraft] = useState("");
    return (
      <div className="flex w-[30rem] flex-col gap-3 bg-md-surface p-4">
        <Md3Suggestions {...args} onSelect={(item) => setDraft(`${item.label}.`)} />
        <Md3AgentComposer value={draft} onValueChange={setDraft} onSubmit={() => setDraft("")} placeholder="Edit your draft…" />
      </div>
    );
  },
};

/** Post-output chips: what to ask next, under an answer. A chosen chip shows it is running. */
export const PostOutputChips: Story = {
  args: { suggestions: FOLLOW_UPS, variant: "follow-up", "aria-label": "Suggested follow-ups", pendingId: "outreach" },
  render: (args) => (
    <div className="w-[30rem] rounded-md-lg border border-md-outline-variant bg-md-surface p-4">
      <p className="border-b border-md-outline-variant pb-3 text-sm leading-6 text-md-on-surface">
        Three accounts flagged for renewal risk. Acme Corp is the largest by ARR.
      </p>
      <Md3Suggestions {...args} className="mt-3" />
    </div>
  ),
};

/** Selection popover: actions targeted at exactly the highlighted text. */
export const SelectionPopover: Story = {
  args: { suggestions: SELECTION, variant: "selection", "aria-label": "Actions for the selected text" },
  render: (args) => (
    <div className="relative w-[26rem] bg-md-surface pt-12">
      <Md3Suggestions {...args} className="absolute left-6 top-0" />
      <p className="text-sm leading-6 text-md-on-surface">
        <mark className="rounded-md-xs bg-md-primary-container px-0.5 text-md-on-primary-container">The agreement is non-binding</mark> until
        both parties sign the final schedule.
      </p>
    </div>
  ),
};

/** Suggestions are on their way (an async `loadSuggestions` is pending). */
export const Loading: Story = {
  args: { suggestions: [], status: "loading" },
  render: (args) => (
    <div className="w-[34rem] bg-md-surface p-4">
      <Md3Suggestions {...args} />
    </div>
  ),
};

/** Loading failed: the request is untouched and Retry asks again. */
export const LoadError: Story = {
  args: { suggestions: [], status: "error" },
  render: (args) => (
    <div className="w-[34rem] bg-md-surface p-4">
      <Md3Suggestions {...args} onRetry={() => {}} />
    </div>
  ),
};

/** A suggestion was added after the person’s words: one line, with Undo. */
export const Accepted: Story = {
  args: { suggestions: RELEASE, status: "accepted", accepted: RELEASE[0] },
  render: (args) => (
    <div className="w-[34rem] bg-md-surface p-4">
      <Md3Suggestions {...args} onUndo={() => {}} />
    </div>
  ),
};

/** Dismissed: gone for this request. */
export const Dismissed: Story = {
  args: { suggestions: RELEASE, status: "dismissed" },
  render: (args) => (
    <div className="w-[34rem] bg-md-surface p-4">
      <Md3Suggestions {...args} />
    </div>
  ),
};

/** The request changed so the suggestions no longer fit; they withdrew on their own. */
export const NoLongerRelevant: Story = {
  args: { suggestions: RELEASE, status: "irrelevant" },
  render: (args) => (
    <div className="w-[34rem] bg-md-surface p-4">
      <Md3Suggestions {...args} />
    </div>
  ),
};

/** Suggestions fetched by the app after a pause (simulated, 800 ms) — the component shows loading and then the chips. */
export const AsyncSuggestions: Story = {
  args: { suggestions: RELEASE, label: "Aria suggests", reason: REASON, actionLabel: "Add to prompt" },
  render: (args) => (
    <div className="w-[34rem] bg-md-surface p-4">
      <Md3SuggestionsComposer
        defaultValue={DRAFT}
        label={args.label}
        reason={args.reason}
        actionLabel={args.actionLabel}
        loadSuggestions={(draft, { signal }) =>
          new Promise((resolve, reject) => {
            const t = setTimeout(() => resolve(fitsRelease(draft) ? args.suggestions : []), 800);
            signal.addEventListener("abort", () => {
              clearTimeout(t);
              reject(new DOMException("Aborted", "AbortError"));
            });
          })
        }
        isRelevant={fitsRelease}
        onSubmit={() => {}}
      />
    </div>
  ),
};
