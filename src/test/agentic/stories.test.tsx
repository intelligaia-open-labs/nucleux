import { isValidElement, type ComponentType } from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { composeStories } from "@storybook/react";

// Every story of every agentic package (nucleux.in's Available patterns) must
// render and pass axe — the stories are the documented variants of each pattern.
const AGENTIC = [
  "agent-avatar", "ai-icons", "attachments", "autocomplete", "caveat", "color", "connectors", "consent",
  "disclaimer", "disclosure", "example-gallery", "gesture", "handwriting", "iconography", "initial-cta",
  "knowledge-base", "mcp-connection", "model-selection", "name", "nudges", "open-input", "personality",
  "proactive", "randomize", "structured-input", "suggested-prompts", "templates", "visual-input", "voice-input",
];

const modules = import.meta.glob("../../../packages/*/src/*.stories.tsx", { eager: true }) as Record<
  string,
  Parameters<typeof composeStories>[0]
>;
const byPackage = Object.entries(modules).filter(([path]) => AGENTIC.includes(path.split("/").at(-3)!));

describe("agentic pattern stories", () => {
  it("every agentic package has stories", () => {
    expect(byPackage.map(([p]) => p.split("/").at(-3)).sort()).toEqual([...AGENTIC].sort());
  });

  for (const [path, mod] of byPackage) {
    const pkg = path.split("/").at(-3);
    describe(pkg!, () => {
      for (const [name, Story] of Object.entries(composeStories(mod)) as [string, ComponentType & { args?: object }][]) {
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
});
