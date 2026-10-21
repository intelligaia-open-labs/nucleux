import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { RequestSettings, mergeRequestSettingsItems } from "@nucleux/open-input";
import { Md3RequestSettings } from "@nucleux/md3-open-input";
import { Modes } from "@nucleux/modes";
import { Md3Modes } from "@nucleux/md3-modes";
import { VoiceTone } from "@nucleux/voice-tone";
import { Md3VoiceTone } from "@nucleux/md3-voice-tone";
import { PresetStyles } from "@nucleux/preset-styles";
import { Md3PresetStyles } from "@nucleux/md3-preset-styles";
import { PromptEnhancer } from "@nucleux/prompt-enhancer";
import { Md3PromptEnhancer } from "@nucleux/md3-prompt-enhancer";

const ITEMS = [
  { id: "mode", label: "Mode", value: "Plan", set: true },
  { id: "tone", label: "Tone", value: "Professional", set: true },
  { id: "style", label: "Style", value: "Normal" },
  { id: "improve", label: "Improve prompt" },
];

describe.each([
  ["RequestSettings", RequestSettings],
  ["Md3RequestSettings", Md3RequestSettings],
] as const)("%s", (_name, Comp) => {
  it("names what is set, opens a menu of rows with values, and passes axe", async () => {
    const user = userEvent.setup();
    const { container } = render(<Comp items={ITEMS} />);
    const button = screen.getByRole("button", { name: "Request settings: Mode Plan, Tone Professional" });
    expect(button).toHaveAttribute("aria-haspopup", "menu");
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    const menu = screen.getByRole("menu", { name: "Request settings" });
    const rows = within(menu).getAllByRole("menuitem");
    expect(rows.map((r) => r.textContent)).toEqual(["ModePlan", "ToneProfessional", "StyleNormal", "Improve prompt"]);
    rows.forEach((r) => expect(r).toHaveAttribute("aria-haspopup", "dialog"));
    expect(rows[0]).toHaveFocus();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("moves with Arrow keys, Home and End, selects with Enter and returns focus to the control", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Comp items={ITEMS} onSelect={onSelect} />);
    const button = screen.getByRole("button", { name: /^Request settings/ });
    await user.click(button);
    const rows = screen.getAllByRole("menuitem");
    await user.keyboard("{ArrowDown}");
    expect(rows[1]).toHaveFocus();
    await user.keyboard("{End}");
    expect(rows[3]).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(rows[0]).toHaveFocus();
    await user.keyboard("{ArrowUp}{Home}{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("tone");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it("closes on Escape and on an outside press", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Comp items={ITEMS.map((i) => ({ ...i, set: false }))} />
        <p>Outside</p>
      </div>,
    );
    const button = screen.getByRole("button", { name: "Request settings" });
    await user.click(button);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(button).toHaveFocus();
    await user.click(button);
    await user.click(screen.getByText("Outside"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

it("mergeRequestSettingsItems keeps the site's order and the pattern's own row", () => {
  const merged = mergeRequestSettingsItems({ id: "tone", label: "Tone", value: "Friendly", set: true }, [
    { id: "improve", label: "Improve prompt" },
    { id: "tone", label: "Tone", value: "Default" },
    { id: "mode", label: "Mode", value: "None" },
  ]);
  expect(merged.map((i) => `${i.id}:${i.value ?? ""}`)).toEqual(["mode:None", "tone:Friendly", "improve:"]);
});

const MODES = [
  { id: "review", name: "Review", description: "Check existing work." },
  { id: "plan", name: "Plan", description: "Break the work into steps." },
];

describe.each([
  ["Modes", Modes],
  ["Md3Modes", Md3Modes],
] as const)("%s trigger=settings", (_name, Comp) => {
  it("has no Mode chip; the Mode row opens the picker, which has a close × and returns focus on Escape", async () => {
    const user = userEvent.setup();
    const onSettingsSelect = vi.fn();
    const { container } = render(
      <Comp
        modes={MODES}
        defaultValue="plan"
        trigger="settings"
        defaultDraft="Help me prepare the release."
        settingsItems={[{ id: "tone", label: "Tone", value: "Default" }]}
        onSettingsSelect={onSettingsSelect}
      />,
    );
    expect(screen.queryByRole("button", { name: /^Mode Plan/ })).not.toBeInTheDocument();
    const tune = screen.getByRole("button", { name: "Request settings: Mode Plan" });
    expect(await axe(container)).toHaveNoViolations();

    await user.click(tune);
    expect(screen.getAllByRole("menuitem").map((r) => r.textContent)).toEqual(["ModePlan", "ToneDefault"]);
    await user.click(screen.getByRole("menuitem", { name: /Tone/ }));
    expect(onSettingsSelect).toHaveBeenCalledWith("tone");

    await user.click(tune);
    await user.click(screen.getByRole("menuitem", { name: /Mode/ }));
    const picker = screen.getByRole("dialog", { name: "Choose a mode" });
    expect(within(picker).getByRole("radio", { name: "Plan" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(tune).toHaveFocus();

    await user.click(tune);
    await user.click(screen.getByRole("menuitem", { name: /Mode/ }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(tune);
    await user.click(screen.getByRole("menuitem", { name: /Mode/ }));
    await user.click(within(screen.getByRole("dialog", { name: "Choose a mode" })).getByRole("radio", { name: "Review" }));
    expect(screen.getAllByText("Mode changed to Review. Your text is unchanged.").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Request settings: Mode Review" })).toHaveFocus();
    expect(screen.getByRole("textbox")).toHaveValue("Help me prepare the release.");
  });

  it("keeps the chip by default", () => {
    render(<Comp modes={MODES} defaultValue="plan" />);
    expect(screen.getByRole("button", { name: "Mode Plan — change" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Request settings/ })).not.toBeInTheDocument();
  });
});

describe.each([
  ["VoiceTone", VoiceTone],
  ["Md3VoiceTone", Md3VoiceTone],
] as const)("%s trigger=settings", (_name, Comp) => {
  it("lists Tone with its value; its row opens the picker and a choice updates the control's name", async () => {
    const user = userEvent.setup();
    render(<Comp variant="composer" trigger="settings" defaultDraft="Draft an update." />);
    expect(screen.queryByRole("button", { name: /^Tone/ })).not.toBeInTheDocument();
    const tune = screen.getByRole("button", { name: "Request settings" });
    await user.click(tune);
    expect(screen.getByRole("menuitem", { name: /Tone/ })).toHaveTextContent("ToneDefault");
    await user.click(screen.getByRole("menuitem", { name: /Tone/ }));
    const picker = screen.getByRole("dialog");
    expect(within(picker).getByRole("button", { name: "Close" })).toBeInTheDocument();
    await user.click(within(picker).getByRole("radio", { name: /Friendly/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Request settings: Tone Friendly" })).toHaveFocus();
  });
});

const STYLES = [
  { id: "normal", name: "Normal", description: "Aria’s default replies." },
  { id: "concise", name: "Concise", description: "Shorter, more direct replies." },
];

describe.each([
  ["PresetStyles", PresetStyles],
  ["Md3PresetStyles", Md3PresetStyles],
] as const)("%s trigger=settings", (_name, Comp) => {
  it("opens Use style from the Style row, closes with ×, and names the chosen style on the control", async () => {
    const user = userEvent.setup();
    render(<Comp variant="menu" styles={STYLES} trigger="settings" defaultMessage="Summarize the release." />);
    expect(screen.queryByRole("button", { name: /^Style/ })).not.toBeInTheDocument();
    const tune = screen.getByRole("button", { name: "Request settings" });
    await user.click(tune);
    expect(screen.getByRole("menuitem", { name: /Style/ })).toHaveTextContent("StyleNormal");
    await user.click(screen.getByRole("menuitem", { name: /Style/ }));
    expect(screen.getByRole("dialog", { name: "Use style" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(tune).toHaveFocus();
    await user.click(tune);
    await user.click(screen.getByRole("menuitem", { name: /Style/ }));
    await user.click(screen.getByRole("radio", { name: /Concise/ }));
    expect(screen.getByRole("button", { name: "Request settings: Style Concise" })).toHaveFocus();
  });
});

describe.each([
  ["PromptEnhancer", PromptEnhancer],
  ["Md3PromptEnhancer", Md3PromptEnhancer],
] as const)("%s trigger=settings", (_name, Comp) => {
  it("has no Enhance tool; Improve prompt starts enhancing and shows the review", async () => {
    const user = userEvent.setup();
    const onEnhance = vi.fn(() => ({ changes: [{ id: "q", text: " from the last quarter" }] }));
    render(<Comp trigger="settings" defaultValue="Summarize customer feedback." onEnhance={onEnhance} />);
    expect(screen.queryByRole("button", { name: /this prompt with AI/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Request settings" }));
    await user.click(screen.getByRole("menuitem", { name: "Improve prompt" }));
    expect(onEnhance).toHaveBeenCalledWith("Summarize customer feedback.", expect.anything());
    expect(screen.getByRole("region", { name: "Suggested improvements to your prompt" })).toBeInTheDocument();
  });

  it("marks Improve prompt unavailable while there is nothing to improve", async () => {
    const user = userEvent.setup();
    const onEnhance = vi.fn(() => ({ text: "x" }));
    render(<Comp trigger="settings" onEnhance={onEnhance} />);
    await user.click(screen.getByRole("button", { name: "Request settings" }));
    const row = screen.getByRole("menuitem", { name: "Improve prompt" });
    expect(row).toHaveAttribute("aria-disabled", "true");
    await user.click(row);
    expect(onEnhance).not.toHaveBeenCalled();
  });
});
