import * as React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import { composeStories } from "@storybook/react";
import { PresetStyles } from "@nucleux/preset-styles";
import { Md3PresetStyles } from "@nucleux/md3-preset-styles";
import * as shadcnStories from "../../../packages/preset-styles/src/preset-styles.stories";
import * as md3Stories from "../../../packages/md3-preset-styles/src/md3-preset-styles.stories";

const writing = [
  { id: "normal", name: "Normal", description: "Aria’s default replies.", sample: "Normal sample." },
  { id: "concise", name: "Concise", description: "Shorter, more direct replies.", sample: "Concise sample." },
  { id: "formal", name: "Formal", description: "Clear, polished, professional replies.", sample: "Formal sample." },
];
const output = [
  { id: "photo", name: "Photo", swatch: "destructive" as const },
  { id: "illustration", name: "Illustration", swatch: "info" as const },
  { id: "isometric", name: "Isometric", swatch: "success" as const },
  { id: "sketch", name: "Sketch", swatch: "warning" as const },
];

const cases = [
  {
    name: "PresetStyles",
    ui: <PresetStyles styles={output} defaultValue="photo" allowReference lockable defaultLocked />,
  },
  {
    name: "Md3PresetStyles",
    ui: <Md3PresetStyles styles={output} defaultValue="photo" allowReference lockable defaultLocked />,
  },
];

for (const C of [PresetStyles, Md3PresetStyles]) {
  const PresetStylesUnderTest = C;
  describe(C.displayName!, () => {
    it("menu: preview follows focus, choosing applies at once, × returns to Normal with Undo", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onSubmit = vi.fn();
      render(
        <PresetStylesUnderTest
          variant="menu"
          styles={writing}
          previewPrompt="Summarize the October release."
          defaultMessage="Summarize the October release."
          onValueChange={onValueChange}
          onSubmit={onSubmit}
        />,
      );
      const trigger = screen.getByRole("button", { name: "Style" });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      await user.click(trigger);
      const dialog = screen.getByRole("dialog", { name: "Use style" });
      expect(dialog).toBeInTheDocument();
      const normal = screen.getByRole("radio", { name: /Normal/ });
      expect(normal).toHaveAttribute("aria-checked", "true");
      expect(normal).toHaveFocus();
      await user.keyboard("{ArrowDown}");
      const concise = screen.getByRole("radio", { name: /Concise/ });
      expect(concise).toHaveFocus();
      expect(screen.getByText("Preview · Concise")).toBeInTheDocument();
      expect(onValueChange).not.toHaveBeenCalled();
      await user.keyboard("{Enter}");
      expect(onValueChange).toHaveBeenLastCalledWith("concise");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("Concise applies to new messages, edits and retries.");
      const chip = screen.getByRole("button", { name: "Style Concise — change" });
      await waitFor(() => expect(chip).toHaveFocus());
      // The request text is never edited; the style travels with the send.
      expect(screen.getByRole("textbox")).toHaveValue("Summarize the October release.");
      await user.click(screen.getByRole("button", { name: /^Send/ }));
      expect(onSubmit).toHaveBeenCalledWith("Summarize the October release.", "concise");
      await user.click(screen.getByRole("button", { name: "Remove style Concise" }));
      expect(onValueChange).toHaveBeenLastCalledWith("normal");
      expect(screen.getByRole("status")).toHaveTextContent("Back to Normal.");
      await user.click(screen.getByRole("button", { name: "Undo" }));
      expect(onValueChange).toHaveBeenLastCalledWith("concise");
      expect(screen.getByRole("button", { name: "Style Concise — change" })).toBeInTheDocument();
    });

    it("grid: arrow keys move and select the style; the lock follows the choice", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onLockedChange = vi.fn();
      render(
        <PresetStylesUnderTest
          styles={output}
          defaultValue="photo"
          lockable
          defaultLocked
          onValueChange={onValueChange}
          onLockedChange={onLockedChange}
        />,
      );
      const group = screen.getByRole("radiogroup", { name: "Output style" });
      expect(group).toBeInTheDocument();
      await user.tab();
      expect(screen.getByRole("radio", { name: /Photo/ })).toHaveFocus();
      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("radio", { name: /Illustration/ })).toHaveFocus();
      expect(screen.getByRole("radio", { name: /Illustration/ })).toHaveAttribute("aria-checked", "true");
      expect(onValueChange).toHaveBeenLastCalledWith("illustration");
      expect(screen.getByText(/Style locked to/)).toHaveTextContent("Style locked to Illustration for this project");
      await user.click(screen.getByRole("button", { name: "Unlock" }));
      expect(onLockedChange).toHaveBeenCalledWith(false);
    });

    it("create: generates through the app's callback, shows an error with retry, then saves and uses the reviewed style", async () => {
      const user = userEvent.setup();
      const onSaveStyle = vi.fn();
      const onValueChange = vi.fn();
      const onGenerateStyle = vi
        .fn()
        .mockRejectedValueOnce(new Error("offline"))
        .mockResolvedValueOnce({
          name: "Release notes voice",
          description: "One line per change.",
          instructions: "Write one short line per change.",
          sample: "New: shared dashboards.",
        });
      render(
        <PresetStylesUnderTest
          variant="menu"
          styles={writing}
          onGenerateStyle={onGenerateStyle}
          onSaveStyle={onSaveStyle}
          onValueChange={onValueChange}
        />,
      );
      await user.click(screen.getByRole("button", { name: "Style" }));
      await user.click(screen.getByRole("button", { name: /Create & edit styles/ }));
      const card = screen.getByRole("region", { name: "Create a style" });
      expect(card).toHaveFocus();
      const generate = screen.getByRole("button", { name: /Generate style/ });
      expect(generate).toBeDisabled();
      await user.type(screen.getByLabelText("Paste writing you like"), "New: Slack digest.");
      await user.click(generate);
      expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't generate a style");
      expect(screen.getByLabelText("Paste writing you like")).toHaveValue("New: Slack digest.");
      await user.click(screen.getByRole("button", { name: /Try again/ }));
      expect(onGenerateStyle).toHaveBeenLastCalledWith({ source: "example", text: "New: Slack digest.", file: undefined });
      const review = await screen.findByRole("region", { name: /Style made by Aria/ });
      expect(review).toBeInTheDocument();
      const nameField = screen.getByLabelText("Style name");
      await user.clear(nameField);
      await user.type(nameField, "Changelog");
      await user.click(screen.getByRole("button", { name: "Save and use" }));
      expect(onSaveStyle).toHaveBeenCalledWith(
        expect.objectContaining({ id: "changelog", name: "Changelog", custom: true }),
        true,
      );
      expect(onValueChange).toHaveBeenLastCalledWith("changelog");
      expect(screen.getByRole("button", { name: "Style Changelog — change" })).toBeInTheDocument();
    });
  });
}

describe("render cases pass axe", () => {
  for (const c of cases) {
    it(c.name, async () => {
      const { container } = render(c.ui);
      expect(await axe(container)).toHaveNoViolations();
    });
  }
});

describe("every story renders and passes axe", () => {
  for (const [fam, mod] of [["shadcn", shadcnStories], ["md3", md3Stories]] as const) {
    const stories = composeStories(mod as never) as Record<string, React.FC>;
    for (const [name, Story] of Object.entries(stories)) {
      it(`${fam} › ${name}`, async () => {
        const { container } = render(<Story />);
        await act(async () => {});
        expect(await axe(container)).toHaveNoViolations();
      });
    }
  }
  it("same story names in both families", () => {
    const a = Object.keys(composeStories(shadcnStories as never)).sort();
    const b = Object.keys(composeStories(md3Stories as never)).sort();
    expect(a).toEqual(b);
  });
});
