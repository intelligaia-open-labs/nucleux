import { existsSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runInit } from "../src/init";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "nucleux-init-"));
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

const claudeSkill = () => join(dir, ".claude/skills/nucleux-design/SKILL.md");
const codexSkill = () => join(dir, ".agents/skills/nucleux-design/SKILL.md");

describe("nucleux-mcp init", () => {
  it("installs the skill for Claude Code and Codex by default", () => {
    expect(runInit([], dir)).toBe(0);
    for (const f of [claudeSkill(), codexSkill()]) {
      const skill = readFileSync(f, "utf8");
      expect(skill.startsWith("---\nname: nucleux-design\ndescription: ")).toBe(true);
      expect(skill).toContain("search_patterns");
    }
  });

  it("installs only the requested target", () => {
    runInit(["--codex"], dir);
    expect(existsSync(codexSkill())).toBe(true);
    expect(existsSync(claudeSkill())).toBe(false);
  });

  it("never overwrites an existing skill without --force", () => {
    mkdirSync(join(dir, ".claude/skills/nucleux-design"), { recursive: true });
    writeFileSync(claudeSkill(), "mine");
    runInit(["--claude"], dir);
    expect(readFileSync(claudeSkill(), "utf8")).toBe("mine");
    runInit(["--claude", "--force"], dir);
    expect(readFileSync(claudeSkill(), "utf8")).not.toBe("mine");
  });

  it("appends the AGENTS.md section once and keeps existing content", () => {
    writeFileSync(join(dir, "AGENTS.md"), "# Project rules\n\nUse pnpm.\n");
    runInit(["--codex", "--agents-md"], dir);
    runInit(["--codex", "--agents-md"], dir);
    const md = readFileSync(join(dir, "AGENTS.md"), "utf8");
    expect(md.startsWith("# Project rules\n\nUse pnpm.\n")).toBe(true);
    expect(md.match(/## UI: Nucleux design system/g)).toHaveLength(1);
  });

  it("rejects unknown options", () => {
    expect(runInit(["--cursor"], dir)).toBe(1);
    expect(existsSync(join(dir, ".claude"))).toBe(false);
  });
});
