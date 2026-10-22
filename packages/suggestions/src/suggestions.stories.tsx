import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { OpenInput } from "@nucleux/open-input";
import { Suggestions, SuggestionsComposer, type SuggestionItem } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const RELEASE: SuggestionItem[] = [
  { id: "blockers", label: "Include unresolved blockers" },
  { id: "owner", label: "Group the work by owner" },
  { id: "august", label: "Compare with the August release" },
];
const REFINE: SuggestionItem[] = [
  { id: "shorter", label: "Make it shorter" },
  { id: "formal", label: "Make it formal" },
  { id: "examples", label: "Add examples" },
];
const FOLLOW_UPS: SuggestionItem[] = [
  { id: "why", label: "Why Acme?" },
  { id: "outreach", label: "Draft outreach" },
  { id: "at-risk", label: "See all at-risk" },
];
const SELECTION: SuggestionItem[] = [
  { id: "rewrite", label: "Rewrite" },
  { id: "shorten", label: "Shorten" },
  { id: "expand", label: "Expand" },
];
const REASON = "Release summaries are read to decide what still needs attention — 3 blockers are open.";
const DRAFT = "Summarize the September release.";
const fitsRelease = (draft: string) => /release/i.test(draft) && !/blocker/i.test(draft);

const meta = {
  title: "Agent/Suggestions",
  component: Suggestions,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { suggestions: RELEASE },
} satisfies Meta<typeof Suggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/**
 * The site's live preview: follow-up chips (↳) under an answer, quick-edit
 * chips just above the draft. Each chip only fills or runs the next step —
 * nothing is sent until the person sends. (Fixed content; the other
 * stories take args.)
 */
export const LivePreview: Story = {
  args: {},
  render: () => {
    const [draft, setDraft] = useState("");
    const [pending, setPending] = useState<string>();
    return (
      <div className="flex w-[30rem] flex-col gap-2.5 rounded-xl border border-border bg-background p-4 shadow-sm">
        <div className="rounded-xl border border-border bg-background p-3.5">
          <p className="border-b border-border pb-3 text-sm leading-6 text-foreground">
            Three accounts are flagged for renewal risk this quarter. Acme Corp carries the highest ARR at $240k.
          </p>
          <Suggestions
            suggestions={FOLLOW_UPS}
            variant="follow-up"
            aria-label="Suggested follow-ups"
            pendingId={pending}
            onSelect={(item) => setPending(item.id)}
            className="mt-2.5"
          />
        </div>
        <Suggestions
          suggestions={REFINE}
          aria-label="Quick edits"
          onSelect={(item) => setDraft((d) => (d ? `${d.trim()} ${item.label}.` : `${item.label}.`))}
        />
        <OpenInput
          variant="single-line"
          value={draft}
          onValueChange={setDraft}
          onSubmit={() => setDraft("")}
          placeholder="Edit your draft…"
          aria-label="Edit your draft"
          sendLabel="Send"
          className="rounded-xl"
        />
      </div>
    );
  },
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
    <div className="w-[34rem]">
      <SuggestionsComposer
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
      <div className="flex w-[30rem] flex-col gap-2.5">
        <Suggestions {...args} onSelect={(item) => setDraft(`${item.label}.`)} />
        <OpenInput value={draft} onValueChange={setDraft} onSubmit={() => setDraft("")} placeholder="Edit your draft…" aria-label="Edit your draft" sendLabel="Send" />
      </div>
    );
  },
};

/** Post-output chips: what to ask next, under an answer. A chosen chip shows it is running. */
export const PostOutputChips: Story = {
  args: { suggestions: FOLLOW_UPS, variant: "follow-up", "aria-label": "Suggested follow-ups", pendingId: "outreach" },
  render: (args) => (
    <div className="w-[30rem] rounded-xl border border-border bg-background p-3.5">
      <p className="border-b border-border pb-3 text-sm leading-6 text-foreground">
        Three accounts flagged for renewal risk. Acme Corp is the largest by ARR.
      </p>
      <Suggestions {...args} className="mt-2.5" />
    </div>
  ),
};

/** Selection popover: actions targeted at exactly the highlighted text. */
export const SelectionPopover: Story = {
  args: { suggestions: SELECTION, variant: "selection", "aria-label": "Actions for the selected text" },
  render: (args) => (
    <div className="relative w-[26rem] pt-12">
      <Suggestions {...args} className="absolute left-6 top-0" />
      <p className="text-sm leading-6 text-foreground">
        <mark className="rounded bg-brand/15 px-0.5 text-foreground">The agreement is non-binding</mark> until both parties
        sign the final schedule.
      </p>
    </div>
  ),
};

/** Suggestions are on their way (an async `loadSuggestions` is pending). */
export const Loading: Story = {
  args: { suggestions: [], status: "loading" },
  render: (args) => (
    <div className="w-[34rem]">
      <Suggestions {...args} />
    </div>
  ),
};

/** Loading failed: the request is untouched and Retry asks again. */
export const LoadError: Story = {
  args: { suggestions: [], status: "error" },
  render: (args) => (
    <div className="w-[34rem]">
      <Suggestions {...args} onRetry={() => {}} />
    </div>
  ),
};

/** A suggestion was added after the person’s words: one line, with Undo. */
export const Accepted: Story = {
  args: { suggestions: RELEASE, status: "accepted", accepted: RELEASE[0] },
  render: (args) => (
    <div className="w-[34rem]">
      <Suggestions {...args} onUndo={() => {}} />
    </div>
  ),
};

/** Dismissed: gone for this request. */
export const Dismissed: Story = {
  args: { suggestions: RELEASE, status: "dismissed" },
  render: (args) => (
    <div className="w-[34rem]">
      <Suggestions {...args} />
    </div>
  ),
};

/** The request changed so the suggestions no longer fit; they withdrew on their own. */
export const NoLongerRelevant: Story = {
  args: { suggestions: RELEASE, status: "irrelevant" },
  render: (args) => (
    <div className="w-[34rem]">
      <Suggestions {...args} />
    </div>
  ),
};

/** Suggestions fetched by the app after a pause (simulated, 800 ms) — the component shows loading and then the chips. */
export const AsyncSuggestions: Story = {
  args: { suggestions: RELEASE, label: "Aria suggests", reason: REASON, actionLabel: "Add to prompt" },
  render: (args) => (
    <div className="w-[34rem]">
      <SuggestionsComposer
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
