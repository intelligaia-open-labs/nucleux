import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import catalog from "../../packages/mcp/src/catalog.json";

const root = resolve(__dirname, "../..");
const exportsSet = new Set(catalog.packages.flatMap((p) => p.exports));

describe("agent-facing docs", () => {
  it("CLAUDE.md only names components that exist", () => {
    const md = readFileSync(resolve(root, "CLAUDE.md"), "utf8");
    const section = md.slice(md.indexOf("**Available components**"), md.indexOf("Common props follow"));
    // Component names are PascalCase words outside "(+Sub/Parts)" shorthands.
    const names = [...section.replace(/\(\+[^)]*\)/g, "").matchAll(/\b([A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)*)\b/g)]
      .map((m) => m[1])
      .filter((n) => !["Layout", "Actions", "Feedback", "Overlays", "Inputs", "Navigation", "Content", "Agentic", "Material", "Available"].includes(n));
    expect(names.length).toBeGreaterThan(40);
    expect(names.filter((n) => !exportsSet.has(n))).toEqual([]);
  });

  it("CLAUDE.md states the real Button variants", () => {
    const md = readFileSync(resolve(root, "CLAUDE.md"), "utf8");
    const button = catalog.packages.find((p) => p.name === "button")!.props[0] as {
      members: Array<{ name: string; values?: string[] }>;
    };
    const values = button.members.find((m) => m.name === "variant")!.values!;
    expect(md).toMatch(new RegExp(`Button \\(variant: ${values.join("/")}[;)]`));
  });

  it("generated skill and AGENTS.md match knowledge/workflow.md", () => {
    expect(() =>
      execFileSync("node", [resolve(root, "scripts/gen-agent-files.mjs"), "--check"], { stdio: "pipe" }),
    ).not.toThrow();
  });

  it("llms.txt lists exactly the packages in the catalog", () => {
    expect(() => execFileSync("node", [resolve(root, "scripts/gen-llms.mjs"), "--check"], { stdio: "pipe" })).not.toThrow();
  });
});
