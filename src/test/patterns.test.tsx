import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";

import knowledge from "../../packages/mcp/src/knowledge.json";

// Every curated pattern ships a typechecked example; here each one must also
// mount, stay accessible, and match the generated knowledge.json the MCP serves.
const examples = import.meta.glob<{ default: ComponentType }>("../../knowledge/patterns/*/example.tsx", {
  eager: true,
});
const root = resolve(__dirname, "../..");

const cases = knowledge.patterns.map((p) => ({ id: p.id, pattern: p }));

describe("curated patterns", () => {
  it("every pattern directory has an example and every example is a pattern", () => {
    const dirs = Object.keys(examples).map((k) => k.split("/").at(-2));
    expect(dirs.sort()).toEqual(knowledge.patterns.map((p) => p.id).sort());
  });

  it.each(cases)("$id: knowledge.json is up to date with knowledge/patterns/$id", ({ id, pattern }) => {
    const dir = resolve(root, "knowledge/patterns", id);
    const spec = JSON.parse(readFileSync(resolve(dir, "pattern.json"), "utf8"));
    const { packages: _packages, exampleSource, ...generated } = pattern;
    expect(generated).toEqual(spec);
    expect(exampleSource).toBe(readFileSync(resolve(dir, spec.example), "utf8").trim());
  });

  it.each(cases)("$id: example renders without axe violations", async ({ id }) => {
    const Example = examples[`../../knowledge/patterns/${id}/example.tsx`].default;
    const { container } = render(<Example />);
    expect(container.firstChild).not.toBeNull();
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results).toHaveNoViolations();
  });

  it("the shared workflow covers every stage and the core rules", () => {
    const w = knowledge.workflow;
    for (const stage of ["A. Inspect", "B. Choose the family", "C. Analyse", "D. Discover", "E. Plan", "F. Implement", "G. Validate", "H. Report"]) {
      expect(w).toContain(stage);
    }
    for (const tool of ["search_patterns", "get_pattern", "get_component", "get_setup"]) expect(w).toContain(tool);
    expect(w).toMatch(/Never guess a Nucleux export/);
    expect(w).toMatch(/report the gap/);
    expect(w).toMatch(/Material 3\n?\s*or shadcn\?/);
    expect(w).toMatch(/As on nucleux\.in/);
  });
});
