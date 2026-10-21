import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isValidElement, type ComponentType } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { composeStories } from "@storybook/react";
import * as p from "@nucleux/madlibs";
import * as m from "@nucleux/md3-madlibs";
import * as pStories from "../../../packages/madlibs/src/madlibs.stories";
import * as mStories from "../../../packages/md3-madlibs/src/md3-madlibs.stories";

const { Madlibs, parseMadlibsTemplate, assembleMadlibsPrompt } = p;
const { Md3Madlibs } = m;

describe("parity", () => {
  it("every component has an Md3 twin", () => {
    const comps = Object.keys(p).filter((k) => /^[A-Z]/.test(k));
    expect(comps.length).toBeGreaterThan(0);
    expect(comps.filter((k) => !(`Md3${k}` in m))).toEqual([]);
  });
  it("Md3 props types are aliases", () => {
    const src = readFileSync(resolve(__dirname, "../../../packages/md3-madlibs/src/index.tsx"), "utf8");
    expect(src).not.toMatch(/export\s+interface\s+Md3\w*Props\b/);
    const aliases = [...src.matchAll(/export\s+type\s+Md3(\w*Props)\s*=\s*([\w.]+)\s*;/g)];
    expect(aliases.length).toBeGreaterThan(0);
    for (const [, local, target] of aliases) expect(target!.endsWith(local!)).toBe(true);
    expect(src).toMatch(/from "@nucleux\/madlibs"/);
  });
  it("story names match", () => {
    expect(Object.keys(composeStories(pStories as never))).toEqual(Object.keys(composeStories(mStories as never)));
  });
});

describe("template logic", () => {
  it("assembles with optional clause", () => {
    const parts = parseMadlibsTemplate("Summarize {document} for {audience}[, focusing on {topic}].");
    expect(assembleMadlibsPrompt(parts, { document: "Q3" })).toBe("Summarize Q3 for ….");
    expect(assembleMadlibsPrompt(parts, { document: "Q3", audience: "Leadership" })).toBe("Summarize Q3 for Leadership.");
    expect(assembleMadlibsPrompt(parts, { document: "Q3", audience: "Leadership", topic: "Risks" })).toBe(
      "Summarize Q3 for Leadership, focusing on Risks.",
    );
  });
});

for (const [pkg, mod] of [["madlibs", pStories], ["md3-madlibs", mStories]] as const) {
  describe(`${pkg} stories`, () => {
    for (const [name, Story] of Object.entries(composeStories(mod as never)) as [string, ComponentType & { args?: object }][]) {
      it(`${name} renders and passes axe`, async () => {
        const { container } = render(<Story />);
        expect(container.firstChild).toBeTruthy();
        const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
        expect(results).toHaveNoViolations();
        expect(Object.values(Story.args ?? {}).some((v) => isValidElement(v))).toBe(false);
      });
    }
  });
}

/* ── Report cases ─────────────────────────────────────────────────────────── */
const cases = [
  {
    name: "Madlibs",
    ui: (
      <Madlibs
        template="Summarize {document} for {audience}[, focusing on {topic}]."
        blanks={[
          { id: "document", label: "Document", options: ["Q3 Customer Research", "September release notes"] },
          { id: "audience", label: "Audience", options: ["Leadership", "Engineering"] },
          { id: "topic", label: "Topic", options: ["Onboarding issues", "Pricing feedback"] },
        ]}
        defaultValues={{ document: "Q3 Customer Research" }}
        onUse={() => {}}
      />
    ),
  },
  {
    name: "Md3Madlibs",
    ui: (
      <Md3Madlibs
        template="Summarize {document} for {audience}[, focusing on {topic}]."
        blanks={[
          { id: "document", label: "Document", options: ["Q3 Customer Research", "September release notes"] },
          { id: "audience", label: "Audience", options: ["Leadership", "Engineering"] },
          { id: "topic", label: "Topic", options: ["Onboarding issues", "Pricing feedback"] },
        ]}
        defaultValues={{ document: "Q3 Customer Research" }}
        onUse={() => {}}
      />
    ),
  },
];
describe("report cases", () => {
  it.each(cases)("$name renders and passes axe", async ({ ui }) => {
    const { container } = render(ui);
    expect(container.firstChild).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });
});

/* ── Behaviour tests, run unchanged against both exports ─────────────────── */
for (const [label, C] of [["Madlibs", Madlibs], ["Md3Madlibs", Md3Madlibs]] as const) {
  const Madlibs = C;
  describe(label, () => {
    it("assembles the sentence from picked and typed values and hands it to onUse without sending", async () => {
      const user = userEvent.setup();
      const onUse = vi.fn();
      render(
        <Madlibs
          template="Summarize {document} for {audience}[, focusing on {topic}]."
          blanks={[
            { id: "document", label: "Document", options: ["Q3 Customer Research", "September release notes"] },
            { id: "audience", label: "Audience", options: ["Leadership", "Engineering"] },
            { id: "topic", label: "Topic", options: ["Onboarding issues"] },
          ]}
          onUse={onUse}
          onUndo={() => {}}
        />,
      );
      const doc = screen.getByRole("combobox", { name: "Document" });
      await user.click(doc);
      expect(doc).toHaveAttribute("aria-expanded", "true");
      await user.click(screen.getByRole("option", { name: "Q3 Customer Research" }));
      expect(doc).toHaveValue("Q3 Customer Research");
      const audience = screen.getByRole("combobox", { name: "Audience" });
      await user.type(audience, "Lead");
      await user.keyboard("{ArrowDown}{Enter}");
      expect(audience).toHaveValue("Leadership");
      await user.type(screen.getByRole("combobox", { name: "Topic (optional)" }), "Churn risk");
      expect(screen.getByText("Summarize Q3 Customer Research for Leadership, focusing on Churn risk.", { exact: false })).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Use prompt" }));
      expect(onUse).toHaveBeenCalledWith("Summarize Q3 Customer Research for Leadership, focusing on Churn risk.", {
        document: "Q3 Customer Research",
        audience: "Leadership",
        topic: "Churn risk",
      });
      expect(screen.getByText("Placed in the composer. Edit it, then send.")).toBeInTheDocument();
      expect(screen.getByText("Placed in the composer")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
    });

    it("flags a missing required blank in words, moves focus to it and keeps what was entered", async () => {
      const user = userEvent.setup();
      const onUse = vi.fn();
      render(
        <Madlibs
          template="Summarize {document} for {audience}[, focusing on {topic}]."
          blanks={[
            { id: "document", label: "Document", options: ["Q3 Customer Research"] },
            { id: "audience", label: "Audience", options: ["Leadership"] },
            { id: "topic", label: "Topic", options: ["Risks"] },
          ]}
          defaultValues={{ document: "Q3 Customer Research", topic: "Risks" }}
          onUse={onUse}
        />,
      );
      await user.click(screen.getByRole("button", { name: "Use prompt" }));
      expect(onUse).not.toHaveBeenCalled();
      expect(screen.getByRole("alert")).toHaveTextContent("Add audience — it's required. Everything else you entered is kept.");
      const audience = screen.getByRole("combobox", { name: "Audience" });
      expect(audience).toHaveAttribute("aria-invalid", "true");
      expect(audience).toHaveFocus();
      expect(screen.getByRole("combobox", { name: "Document" })).toHaveValue("Q3 Customer Research");
      await user.keyboard("Sales");
      expect(audience).not.toHaveAttribute("aria-invalid");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("keeps an agent suggestion out of the request until Keep, then Undo returns to the blanks", async () => {
      const user = userEvent.setup();
      const onUse = vi.fn();
      const onUndo = vi.fn();
      render(
        <Madlibs
          template="Summarize {document} for {audience}."
          blanks={[
            { id: "document", label: "Document", options: ["Q3 Customer Research"] },
            { id: "audience", label: "Audience", options: ["Leadership"] },
          ]}
          defaultValues={{ document: "Q3 Customer Research" }}
          suggestion={{ blank: "audience", value: "Leadership", reason: "the owner is the leadership team." }}
          agentName="Aria"
          onUse={onUse}
          onUndo={onUndo}
        />,
      );
      expect(screen.getByRole("combobox", { name: "Audience" })).toHaveAttribute("readonly");
      expect(screen.getByText(/suggested by Aria/)).toBeInTheDocument();
      expect(screen.getByText("Summarize Q3 Customer Research for ….", { exact: false })).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Keep" }));
      expect(screen.queryByText(/suggested by Aria/)).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Use prompt" }));
      expect(onUse).toHaveBeenCalledWith("Summarize Q3 Customer Research for Leadership.", expect.any(Object));
      await user.click(screen.getByRole("button", { name: "Undo" }));
      expect(onUndo).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("combobox", { name: "Audience" })).toHaveValue("Leadership");
    });
  });
}
