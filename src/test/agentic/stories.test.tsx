import { isValidElement, type ComponentType } from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { composeStories } from "@storybook/react";

// Every story of every agentic package (nucleux.in's Available patterns) and of
// its Material 3 twin must render and pass axe — the stories are the documented
// variants of each pattern.
const AGENTIC = [
  "agent-avatar", "ai-icons", "attachments", "autocomplete", "caveat", "color", "connectors", "consent",
  "disclaimer", "disclosure", "example-gallery", "gesture", "handwriting", "iconography", "initial-cta",
  "knowledge-base", "mcp-connection", "model-selection", "name", "nudges", "open-input", "personality",
  "proactive", "randomize", "structured-input", "suggested-prompts", "templates", "visual-input", "voice-input",
  // Prompt Scaffolds (0.7.0)
  "madlibs", "modes", "preset-styles", "prompt-enhancer", "suggestions", "voice-tone",
];

const modules = import.meta.glob("../../../packages/*/src/*.stories.tsx", { eager: true }) as Record<
  string,
  Parameters<typeof composeStories>[0]
>;
const BOTH = [...AGENTIC, ...AGENTIC.map((n) => `md3-${n}`)];
const byPackage = Object.entries(modules).filter(([path]) => BOTH.includes(path.split("/").at(-3)!));

describe("agentic pattern stories", () => {
  it("every agentic package and its Material 3 twin has stories", () => {
    expect(byPackage.map(([p]) => p.split("/").at(-3)).sort()).toEqual([...BOTH].sort());
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
