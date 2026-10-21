import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { composeStories } from "@storybook/react";
import { Modes } from "@nucleux/modes";
import { Md3Modes } from "@nucleux/md3-modes";
import * as shadcnStories from "../../../packages/modes/src/modes.stories";
import * as md3Stories from "../../../packages/md3-modes/src/md3-modes.stories";

const MODES = [
  { id: "brainstorm", name: "Brainstorm", description: "Explore several possible directions." },
  { id: "research", name: "Research", description: "Gather sources from the web.", unavailable: "Web access is turned off." },
  { id: "review", name: "Review", description: "Check existing work for gaps and risks." },
  { id: "plan", name: "Plan", description: "Break the work into steps with owners and dates." },
];

const FAMILIES = [
  ["Modes", Modes],
  ["Md3Modes", Md3Modes],
] as const;

describe.each(FAMILIES)("%s", (_name, Comp) => {
  // Report §4 render case
  it("render case passes axe", async () => {
    const { container } = render(
      <Comp
        variant="list"
        modes={[
          { id: "fast", name: "Fast", meta: "~3 seconds", description: "everyday asks and quick lookups" },
          { id: "balanced", name: "Balanced", meta: "~15 seconds", description: "most tasks" },
          { id: "deep", name: "Deep research", meta: "~1 minute", description: "multi-source, high-stakes", unavailable: "Not on this plan." },
        ]}
        defaultValue="fast"
      />,
    );
    expect(screen.getByRole("radio", { name: "Fast" })).toHaveAttribute("aria-checked", "true");
    expect(await axe(container)).toHaveNoViolations();
  });

  // Report §5 behaviour tests (identical body for both families)
  it("chooses a mode from the composer chip, keeps the text, and sends it with the mode", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Comp
        modes={MODES}
        defaultDraft="Help me prepare the release."
        onSubmit={onSubmit}
        onValueChange={onValueChange}
        placeholder="Ask Aria…"
      />,
    );
    const chip = screen.getByRole("button", { name: "Mode" });
    expect(chip).toHaveAttribute("aria-haspopup", "dialog");
    await user.click(chip);
    const picker = screen.getByRole("dialog", { name: "Choose a mode" });
    await user.click(within(picker).getByRole("radio", { name: "Plan" }));
    expect(onValueChange).toHaveBeenLastCalledWith("plan", expect.objectContaining({ id: "plan" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const set = screen.getByRole("button", { name: "Mode Plan — change" });
    expect(set).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Mode: Plan. Your text is unchanged.");
    const field = screen.getByRole("textbox", { name: "Ask Aria…" });
    expect(field).toHaveValue("Help me prepare the release.");
    await user.type(field, "{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("Help me prepare the release.", { mode: expect.objectContaining({ id: "plan" }) });
  });

  it("refuses an unavailable mode with its reason, then switches with Undo and clears", async () => {
    const user = userEvent.setup();
    const onUnavailable = vi.fn();
    render(<Comp modes={MODES} defaultValue="plan" onUnavailable={onUnavailable} />);
    await user.click(screen.getByRole("button", { name: "Mode Plan — change" }));
    const picker = screen.getByRole("dialog", { name: "Choose a mode" });
    const research = within(picker).getByRole("radio", { name: "Research" });
    expect(research).toHaveAttribute("aria-disabled", "true");
    expect(research).toHaveAccessibleDescription(/Web access is turned off/);
    await user.click(research);
    expect(onUnavailable).toHaveBeenCalledWith(expect.objectContaining({ id: "research" }));
    expect(within(picker).getByRole("alert")).toHaveTextContent("Research isn’t available here. Choose another mode.");
    expect(within(picker).getByRole("radio", { name: "Plan" })).toHaveAttribute("aria-checked", "true");
    await user.click(within(picker).getByRole("radio", { name: "Review" }));
    expect(screen.getByRole("status")).toHaveTextContent("Mode changed to Review. Your text is unchanged.");
    expect(screen.getByRole("button", { name: "Mode Review — change" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("button", { name: "Mode Plan — change" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove mode Plan" }));
    expect(screen.getByRole("button", { name: "Mode" })).toBeInTheDocument();
  });

  it("moves focus with arrow keys, chooses with Enter and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Comp modes={MODES} defaultValue="brainstorm" variant="chip" />);
    const chip = screen.getByRole("button", { name: "Mode Brainstorm — change" });
    await user.click(chip);
    expect(screen.getByRole("radio", { name: "Brainstorm" })).toHaveFocus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Review" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Mode Review — change" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog", { name: "Choose a mode" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mode Review — change" })).toHaveFocus();
  });
});

describe.each([
  ["shadcn", shadcnStories],
  ["md3", md3Stories],
] as const)("%s stories", (_f, mod) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stories = Object.entries(composeStories(mod as any)) as [string, React.ComponentType][];
  it.each(stories)("%s renders and passes axe", async (_n, Story) => {
    const { container } = render(<Story />);
    expect(await axe(container)).toHaveNoViolations();
  });
  it("same story names in both families", () => {
    expect(Object.keys(composeStories(shadcnStories as any))).toEqual(Object.keys(composeStories(md3Stories as any)));
  });
});
