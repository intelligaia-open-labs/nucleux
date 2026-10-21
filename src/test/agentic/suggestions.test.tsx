import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import * as shadcn from "@nucleux/suggestions";
import * as md3 from "@nucleux/md3-suggestions";

const RELEASE = [
  { id: "blockers", label: "Include unresolved blockers" },
  { id: "owner", label: "Group the work by owner" },
  { id: "august", label: "Compare with the August release" },
];
const DRAFT = "Summarize the September release.";

const FAMILIES = [
  { name: "shadcn", Suggestions: shadcn.Suggestions, SuggestionsComposer: shadcn.SuggestionsComposer },
  { name: "md3", Suggestions: md3.Md3Suggestions, SuggestionsComposer: md3.Md3SuggestionsComposer },
] as const;

describe("appendSuggestion", () => {
  it("adds after the draft, never replacing it", () => {
    expect(shadcn.appendSuggestion(DRAFT, "Include unresolved blockers")).toBe(
      "Summarize the September release and include unresolved blockers.",
    );
    expect(shadcn.appendSuggestion("", "add examples")).toBe("Add examples.");
  });
});

describe.each(FAMILIES)("$name", ({ Suggestions, SuggestionsComposer }) => {
  // ── report §4 render cases ──
  it("render case passes axe", async () => {
    const { container } = render(
      <div>
        <Suggestions suggestions={RELEASE} label="Aria suggests" reason="3 blockers are open." actionLabel="Add to prompt" onDismiss={() => {}} />
        <Suggestions variant="follow-up" aria-label="Suggested follow-ups" suggestions={RELEASE} pendingId="owner" />
        <Suggestions variant="selection" aria-label="Actions for the selected text" suggestions={RELEASE} />
        <Suggestions suggestions={RELEASE} status="accepted" accepted={RELEASE[0]} onUndo={() => {}} />
        <Suggestions suggestions={[]} status="loading" />
        <Suggestions suggestions={[]} status="error" onRetry={() => {}} />
        <SuggestionsComposer defaultValue={DRAFT} suggestions={RELEASE} label="Composer suggests" reason="Why." onSubmit={() => {}} />
      </div>,
    );
    expect(screen.getAllByRole("button", { name: "Add to prompt: Include unresolved blockers" })).toHaveLength(2);
    expect(await axe(container)).toHaveNoViolations();
  });

  // ── report §5 behaviour tests (bodies identical for both families) ──
  it("adds a chosen suggestion after the person's words, confirms it with Undo, and never sends", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SuggestionsComposer defaultValue="Summarize the September release." suggestions={RELEASE} label="Aria suggests" onSubmit={onSubmit} />,
    );
    expect(screen.getByRole("group", { name: "Aria suggests" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add to prompt: Include unresolved blockers" }));
    const field = screen.getByRole("textbox");
    expect(field).toHaveValue("Summarize the September release and include unresolved blockers.");
    expect(field).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Added “Include unresolved blockers” to your request");
    expect(onSubmit).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(field).toHaveValue("Summarize the September release.");
    expect(screen.getByRole("button", { name: "Add to prompt: Group the work by owner" })).toBeInTheDocument();
  });

  it("explains itself on request, moves with arrow keys and dismisses with Escape", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Suggestions suggestions={RELEASE} label="Aria suggests" reason="3 blockers are open." onDismiss={onDismiss} />,
    );
    const why = screen.getByRole("button", { name: "Why these suggestions" });
    expect(why).toHaveAttribute("aria-expanded", "false");
    await user.click(why);
    expect(why).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("3 blockers are open.")).toBeVisible();
    const chips = RELEASE.map((s) => screen.getByRole("button", { name: s.label }));
    chips[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(chips[1]).toHaveFocus();
    await user.keyboard("{End}");
    expect(chips[2]).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(chips[0]).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("withdraws quietly when the request no longer fits, and loads new ones after a pause", async () => {
    const user = userEvent.setup();
    const loadSuggestions = vi.fn(async (draft: string) => (/release/i.test(draft) ? RELEASE : []));
    render(
      <SuggestionsComposer
        defaultValue="Summarize the September release."
        loadSuggestions={loadSuggestions}
        pauseMs={20}
        isRelevant={(draft) => /release/i.test(draft)}
        label="Aria suggests"
        onSubmit={() => {}}
      />,
    );
    expect(await screen.findByRole("group", { name: "Aria suggests" })).toBeInTheDocument();
    const field = screen.getByRole("textbox");
    await user.clear(field);
    await user.type(field, "Draft the roadmap");
    expect(screen.queryByRole("group", { name: "Aria suggests" })).not.toBeInTheDocument();
    await user.clear(field);
    await user.type(field, "Summarize the October release");
    expect(await screen.findByRole("button", { name: "Add to prompt: Include unresolved blockers" })).toBeInTheDocument();
    expect(loadSuggestions).toHaveBeenLastCalledWith("Summarize the October release", expect.objectContaining({ signal: expect.anything() }));
  });

  it("shows no longer relevant when an offered row stops fitting", async () => {
    const user = userEvent.setup();
    render(
      <SuggestionsComposer defaultValue="Summarize the September release." suggestions={RELEASE} isRelevant={(d) => /release/i.test(d)} onSubmit={() => {}} />,
    );
    const field = screen.getByRole("textbox");
    await user.tripleClick(field);
    await user.keyboard("Draft");
    expect(screen.getByRole("status")).toHaveTextContent("no longer fit");
  });

  it("dismisses for this request and sends only on Send", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SuggestionsComposer defaultValue={DRAFT} suggestions={RELEASE} label="Aria suggests" onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Dismiss suggestions" }));
    expect(screen.getByRole("status")).toHaveTextContent("Suggestions dismissed");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledWith(DRAFT);
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("shows loading then error with Retry", async () => {
    const user = userEvent.setup();
    let fail = true;
    const load = vi.fn(() => (fail ? Promise.reject(new Error("x")) : Promise.resolve(RELEASE)));
    render(<SuggestionsComposer defaultValue={DRAFT} loadSuggestions={load} onSubmit={() => {}} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn’t load suggestions");
    fail = false;
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("button", { name: "Add to prompt: Group the work by owner" })).toBeInTheDocument();
  });
});
