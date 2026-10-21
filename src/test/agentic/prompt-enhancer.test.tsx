import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  PromptEnhancer,
  buildEnhancedPrompt,
  getPromptEnhancerSegments,
  type PromptEnhancerProps,
  type PromptEnhancerState,
} from "@nucleux/prompt-enhancer";
import { Md3PromptEnhancer } from "@nucleux/md3-prompt-enhancer";

const ORIGINAL = "Summarize customer feedback.";
const SUGGESTION = {
  changes: [
    { id: "time", text: " from the last quarter", reason: "A time range makes it comparable.", assumption: "Assumes you mean the last quarter." },
    { id: "theme", text: ", grouped by recurring theme", reason: "Themes are easier to act on." },
  ],
};

const FAMILIES: Array<[string, React.ComponentType<PromptEnhancerProps>]> = [
  ["PromptEnhancer", PromptEnhancer],
  ["Md3PromptEnhancer", Md3PromptEnhancer],
];

describe("helpers", () => {
  it("builds the enhanced prompt from kept changes", () => {
    expect(buildEnhancedPrompt(ORIGINAL, SUGGESTION.changes)).toBe(
      "Summarize customer feedback from the last quarter, grouped by recurring theme.",
    );
    expect(buildEnhancedPrompt(ORIGINAL, SUGGESTION.changes, ["time"])).toBe(
      "Summarize customer feedback, grouped by recurring theme.",
    );
    expect(getPromptEnhancerSegments(ORIGINAL, SUGGESTION, ["time"]).map((s) => s.type)).toEqual([
      "text",
      "removed",
      "text",
      "added",
      "text",
    ]);
  });
});

const STATES: PromptEnhancerState[] = ["original", "enhancing", "enhanced", "editing", "accepted", "reverted", "failed"];

describe.each(FAMILIES)("%s", (_name, Comp) => {
  it.each(STATES)("state %s renders and passes axe", async (state) => {
    const { container } = render(
      <Comp
        defaultValue={ORIGINAL}
        defaultState={state}
        defaultSuggestion={SUGGESTION}
        hint="Aria will expand this prompt"
        onEnhance={() => SUGGESTION}
        onSubmit={() => {}}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it.each([
    ["wand-button", { variant: "wand-button" as const }],
    ["auto-enhance-toggle", { variant: "auto-enhance-toggle" as const, onSubmit: () => {} }],
    ["inline", { defaultState: "enhanced" as const, defaultSuggestion: SUGGESTION, diffStyle: "inline" as const }],
    ["text-only suggestion", { defaultState: "enhanced" as const, defaultSuggestion: { text: "A precise ask" } }],
    ["no explain / no edit / no keep", { defaultState: "enhanced" as const, defaultSuggestion: SUGGESTION, explain: false, allowEdit: false, allowKeepOriginal: false }],
  ])("variant %s renders and passes axe", async (_n, extra) => {
    const { container } = render(<Comp defaultValue={ORIGINAL} onEnhance={() => SUGGESTION} {...extra} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  // ── The report's behaviour tests (written against PromptEnhancer; also run on Md3) ──

  it("enhances, lets a change be removed, and Use updates the composer without sending", async () => {
    const user = userEvent.setup();
    const onEnhance = vi.fn().mockResolvedValue({
      changes: [
        { id: "time", text: " from the last quarter", reason: "A time range makes it comparable.", assumption: "Assumes you mean the last quarter." },
        { id: "theme", text: ", grouped by recurring theme", reason: "Themes are easier to act on." },
      ],
    });
    const onSubmit = vi.fn();
    const onUse = vi.fn();
    render(<Comp defaultValue="Summarize customer feedback." onEnhance={onEnhance} onSubmit={onSubmit} onUse={onUse} />);

    await user.click(screen.getByRole("button", { name: "Enhance this prompt with AI" }));
    const review = await screen.findByRole("region", { name: "Suggested improvements to your prompt" });
    expect(onEnhance).toHaveBeenCalledWith("Summarize customer feedback.", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(within(review).getByText("2 of 2 changes")).toBeInTheDocument();
    expect(within(review).getByText("Assumes you mean the last quarter.")).toBeInTheDocument();

    await user.click(within(review).getByRole("checkbox", { name: "Add “from the last quarter”" }));
    expect(within(review).getByRole("checkbox", { name: "Add “from the last quarter”" })).toHaveAttribute("aria-checked", "false");
    expect(within(review).getByText("1 of 2 changes")).toBeInTheDocument();

    await user.click(within(review).getByRole("button", { name: "Use enhanced" }));
    expect(screen.getByRole("textbox")).toHaveValue("Summarize customer feedback, grouped by recurring theme.");
    expect(onUse).toHaveBeenCalledWith("Summarize customer feedback, grouped by recurring theme.", "Summarize customer feedback.");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Prompt updated. Nothing was sent.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("textbox")).toHaveValue("Summarize customer feedback.");
    expect(screen.getByText("Your original prompt is back.")).toBeInTheDocument();
  });

  it("on failure says so, keeps the original, and Try again retries", async () => {
    const user = userEvent.setup();
    const onEnhance = vi
      .fn()
      .mockRejectedValueOnce(new Error("model down"))
      .mockResolvedValueOnce({ text: "Summarise yesterday's standup in 3 bullets for the leadership review" });
    render(<Comp defaultValue="summarise yesterday's standup" onEnhance={onEnhance} />);

    await user.click(screen.getByRole("button", { name: "Enhance this prompt with AI" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Your original is unchanged.");
    expect(screen.getByRole("textbox")).toHaveValue("summarise yesterday's standup");

    await user.click(within(alert).getByRole("button", { name: "Try again" }));
    const review = await screen.findByRole("region", { name: "Suggested improvements to your prompt" });
    expect(within(review).getByText("Summarise yesterday's standup in 3 bullets for the leadership review")).toBeInTheDocument();
    expect(onEnhance).toHaveBeenCalledTimes(2);
  });

  it("can cancel while enhancing, and Escape in the review keeps the original", async () => {
    const user = userEvent.setup();
    let resolve!: (v: { text: string }) => void;
    const onEnhance = vi.fn(
      (_p: string, { signal }: { signal: AbortSignal }) =>
        new Promise<{ text: string }>((r) => {
          resolve = r;
          signal.addEventListener("abort", () => r({ text: "ignored" }));
        }),
    );
    const onKeepOriginal = vi.fn();
    render(<Comp defaultValue="plan the offsite" onEnhance={onEnhance} onKeepOriginal={onKeepOriginal} />);

    await user.click(screen.getByRole("button", { name: "Enhance this prompt with AI" }));
    await user.click(screen.getByRole("button", { name: "Cancel enhancing" }));
    expect(onEnhance.mock.calls[0][1].signal.aborted).toBe(true);
    expect(screen.queryByRole("region", { name: "Suggested improvements to your prompt" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Enhance this prompt with AI" }));
    resolve({ text: "Plan a two-day offsite for 12 people in March" });
    const review = await screen.findByRole("region", { name: "Suggested improvements to your prompt" });
    await user.click(within(review).getByRole("button", { name: "Edit" }));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(within(review).queryByRole("textbox")).not.toBeInTheDocument());
    within(review).getByRole("button", { name: "Use enhanced" }).focus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("region", { name: "Suggested improvements to your prompt" })).not.toBeInTheDocument();
    expect(onKeepOriginal).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("textbox")).toHaveValue("plan the offsite");
  });

  it("auto-enhance sends the enhanced prompt when on, and the plain one when off", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <Comp
        variant="auto-enhance-toggle"
        defaultAutoEnhance
        defaultValue="summarise standup"
        onEnhance={() => Promise.resolve({ text: "Summarise standup in 3 bullets" })}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("Summarise standup in 3 bullets"));
    await user.click(screen.getByRole("switch", { name: "Auto-enhance prompts" }));
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenLastCalledWith("summarise standup");
  });

  it("wand-button applies in place with Undo", async () => {
    const user = userEvent.setup();
    render(<Comp variant="wand-button" defaultValue="summarise standup" onEnhance={() => ({ text: "Summarise standup in 3 bullets" })} />);
    await user.click(screen.getByRole("button", { name: "Enhance this prompt with AI" }));
    expect(screen.getByRole("textbox")).toHaveValue("Summarise standup in 3 bullets");
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("textbox")).toHaveValue("summarise standup");
  });
});
