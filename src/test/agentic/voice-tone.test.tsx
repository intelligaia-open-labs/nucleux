import * as React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { composeStories } from "@storybook/react";
import * as P from "@nucleux/voice-tone";
import * as M from "@nucleux/md3-voice-tone";
import { VoiceTone } from "@nucleux/voice-tone";
import { Md3VoiceTone } from "@nucleux/md3-voice-tone";
import * as pStories from "../../../packages/voice-tone/src/voice-tone.stories";
import * as mStories from "../../../packages/md3-voice-tone/src/md3-voice-tone.stories";

const AXE = { rules: { "color-contrast": { enabled: false } } };

describe("stories render and pass axe", () => {
  for (const [fam, mod] of [["shadcn", pStories], ["md3", mStories]] as const) {
    for (const [name, Story] of Object.entries(composeStories(mod as never)) as [string, React.ComponentType][]) {
      it(`${fam} ${name}`, async () => {
        const { container } = render(<Story />);
        expect(container.firstChild).toBeTruthy();
        expect(await axe(container, AXE)).toHaveNoViolations();
      });
    }
  }
  it("same story names and args in both families", () => {
    const a = composeStories(pStories as never) as Record<string, { args?: unknown }>;
    const b = composeStories(mStories as never) as Record<string, { args?: unknown }>;
    expect(Object.keys(a)).toEqual(Object.keys(b));
    for (const k of Object.keys(a)) expect(JSON.stringify(a[k]!.args)).toEqual(JSON.stringify(b[k]!.args));
  });
});

describe("parity", () => {
  it("every component has an Md3 twin", () => {
    const comps = Object.keys(P).filter((k) => /^[A-Z]/.test(k) && typeof (P as Record<string, unknown>)[k] === "object" && "$$typeof" in ((P as unknown as Record<string, object>)[k] as object));
    expect(comps.length).toBeGreaterThan(0);
    expect(comps.filter((k) => !(`Md3${k}` in M))).toEqual([]);
  });
  it("Md3 props types are aliases", () => {
    const src = readFileSync(resolve(__dirname, "../../../packages/md3-voice-tone/src/index.tsx"), "utf8");
    expect(src).not.toMatch(/export\s+interface\s+Md3\w*Props\b/);
    const aliases = [...src.matchAll(/export\s+type\s+Md3(\w*Props)\s*=\s*([\w.]+)\s*;/g)];
    expect(aliases.length).toBeGreaterThan(0);
    for (const [, local, target] of aliases) expect(target!.endsWith(local!)).toBe(true);
    expect(src).toMatch(/from "@nucleux\/voice-tone"/);
  });
});

const cases = [
  { name: "VoiceTone", ui: <VoiceTone defaultValue="professional" rules={[{ id: "no-emojis", label: "No emojis" }]} defaultRuleValues={["no-emojis"]} /> },
  { name: "Md3VoiceTone", ui: <Md3VoiceTone variant="composer" defaultValue="professional" defaultDraft="Draft a product update for stakeholders." /> },
];
describe("render cases", () => {
  for (const c of cases)
    it(c.name, async () => {
      const { container } = render(c.ui);
      expect(container.firstChild).toBeTruthy();
      expect(await axe(container, AXE)).toHaveNoViolations();
    });
});

for (const [fam, C] of [["shadcn", VoiceTone], ["md3", Md3VoiceTone]] as const) {
  describe(`behaviour (${fam})`, () => {
    const Comp = C as typeof VoiceTone;

    it("chooses a preset with the arrow keys, updates the sample and reports rules", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onRulesChange = vi.fn();
      render(
        <Comp
          defaultValue="professional"
          rules={[{ id: "no-emojis", label: "No emojis" }, { id: "uk-english", label: "UK English spelling" }]}
          defaultRuleValues={["no-emojis"]}
          onValueChange={onValueChange}
          onRulesChange={onRulesChange}
        />,
      );
      const group = screen.getByRole("radiogroup", { name: "Tone preset" });
      expect(within(group).getByRole("radio", { name: /Professional/ })).toHaveAttribute("aria-checked", "true");
      expect(screen.getByText(/Please find the updated proposal/)).toBeInTheDocument();
      within(group).getByRole("radio", { name: /Professional/ }).focus();
      await user.keyboard("{ArrowRight}");
      expect(onValueChange).toHaveBeenLastCalledWith("friendly");
      expect(within(group).getByRole("radio", { name: /Friendly/ })).toHaveFocus();
      expect(screen.getByText(/Hey! Attached is the updated proposal/)).toBeInTheDocument();
      await user.click(screen.getByRole("checkbox", { name: "UK English spelling" }));
      expect(onRulesChange).toHaveBeenLastCalledWith(["no-emojis", "uk-english"]);
    });

    it("sets a tone from the composer chip and sends it as a setting, leaving the prompt untouched", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<Comp variant="composer" defaultDraft="Draft a product update." onSubmit={onSubmit} />);
      await user.click(screen.getByRole("button", { name: "Tone" }));
      const dialog = screen.getByRole("dialog", { name: /Tone/ });
      await user.click(within(dialog).getByRole("radio", { name: /Direct/ }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Tone Direct — change" })).toHaveFocus();
      expect(screen.getByRole("textbox", { name: "Describe what to write…" })).toHaveValue("Draft a product update.");
      await user.click(screen.getByRole("button", { name: "Send" }));
      expect(onSubmit).toHaveBeenCalledWith("Draft a product update.", { tone: "direct", rules: [] });
    });

    it("removes the tone with Undo, and Escape closes the picker back to the chip", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Comp variant="composer" defaultValue="friendly" onValueChange={onValueChange} />);
      await user.click(screen.getByRole("button", { name: "Remove tone Friendly" }));
      expect(onValueChange).toHaveBeenLastCalledWith(null);
      expect(screen.getByRole("status")).toHaveTextContent(/Tone removed/);
      await user.click(screen.getByRole("button", { name: "Undo" }));
      expect(onValueChange).toHaveBeenLastCalledWith("friendly");
      const chip = screen.getByRole("button", { name: "Tone Friendly — change" });
      await user.click(chip);
      expect(screen.getByRole("radio", { name: /Friendly/ })).toHaveFocus();
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(chip).toHaveFocus();
    });
  });
}
