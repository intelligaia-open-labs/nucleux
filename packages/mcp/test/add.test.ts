import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runAdd, type AddEnv } from "../src/add";

let home: string;
let cwd: string;
let out: string[];
let runs: string[][];
let claudeHas: Set<string>;

const env = (over: Partial<AddEnv> = {}): AddEnv => ({
  home,
  cwd,
  platform: "darwin",
  has: (cmd) => claudeHas.has(cmd),
  run: (cmd, args) => {
    runs.push([cmd, ...args]);
    // `claude mcp get nucleux` fails until it has been added.
    if (args[1] === "get") return runs.some((r) => r[2] === "add") ? 0 : 1;
    return 0;
  },
  log: (line) => out.push(line),
  ...over,
});
const json = (f: string) => JSON.parse(readFileSync(f, "utf8"));

beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), "nucleux-add-home-"));
  cwd = mkdtempSync(join(tmpdir(), "nucleux-add-app-"));
  writeFileSync(join(cwd, "package.json"), "{}");
  out = [];
  runs = [];
  claudeHas = new Set();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  rmSync(home, { recursive: true, force: true });
  rmSync(cwd, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("nucleux-mcp add", () => {
  it("connects every detected agent and leaves undetected ones alone", () => {
    mkdirSync(join(home, ".cursor"));
    mkdirSync(join(home, ".codex"));
    mkdirSync(join(home, "Library/Application Support/Code/User"), { recursive: true });
    claudeHas.add("claude");

    expect(runAdd([], env())).toBe(0);

    expect(runs).toContainEqual(["claude", "mcp", "add", "--scope", "user", "nucleux", "--", "npx", "-y", "@nucleux/mcp"]);
    expect(json(join(home, ".cursor/mcp.json")).mcpServers.nucleux).toEqual({ command: "npx", args: ["-y", "@nucleux/mcp"] });
    expect(json(join(home, "Library/Application Support/Code/User/mcp.json")).servers.nucleux).toEqual({
      type: "stdio",
      command: "npx",
      args: ["-y", "@nucleux/mcp"],
    });
    expect(readFileSync(join(home, ".codex/config.toml"), "utf8")).toContain(
      '[mcp_servers.nucleux]\ncommand = "npx"\nargs = ["-y","@nucleux/mcp"]',
    );
    expect(existsSync(join(home, ".gemini"))).toBe(false);
    expect(existsSync(join(home, ".codeium"))).toBe(false);
    // Project guidance: a Claude skill, the Codex skill and the AGENTS.md section.
    expect(existsSync(join(cwd, ".claude/skills/nucleux-design/SKILL.md"))).toBe(true);
    expect(existsSync(join(cwd, ".agents/skills/nucleux-design/SKILL.md"))).toBe(true);
    expect(readFileSync(join(cwd, "AGENTS.md"), "utf8")).toContain("## UI: Nucleux design system");
    expect(out.join("\n")).toMatch(/Found: Claude Code, Cursor, VS Code \(Copilot\), Codex/);
  });

  it("keeps other servers and settings, and is safe to run twice", () => {
    mkdirSync(join(home, ".cursor"));
    writeFileSync(join(home, ".cursor/mcp.json"), JSON.stringify({ mcpServers: { other: { command: "x" } }, keep: 1 }));
    mkdirSync(join(home, ".codex"));
    writeFileSync(join(home, ".codex/config.toml"), 'model = "o4"\n');

    runAdd([], env());
    const firstCursor = readFileSync(join(home, ".cursor/mcp.json"), "utf8");
    const firstCodex = readFileSync(join(home, ".codex/config.toml"), "utf8");
    out = [];
    expect(runAdd([], env())).toBe(0);

    const cursor = json(join(home, ".cursor/mcp.json"));
    expect(cursor.keep).toBe(1);
    expect(Object.keys(cursor.mcpServers)).toEqual(["other", "nucleux"]);
    expect(readFileSync(join(home, ".cursor/mcp.json"), "utf8")).toBe(firstCursor);
    expect(firstCodex.startsWith('model = "o4"\n\n[mcp_servers.nucleux]')).toBe(true);
    expect(readFileSync(join(home, ".codex/config.toml"), "utf8")).toBe(firstCodex);
    expect(out.join("\n")).toMatch(/Cursor\s+already connected/);
    expect(out.join("\n")).toMatch(/skip {3}AGENTS\.md/);
  });

  it("--dry-run changes nothing", () => {
    mkdirSync(join(home, ".cursor"));
    claudeHas.add("claude");
    expect(runAdd(["--dry-run"], env())).toBe(0);
    expect(existsSync(join(home, ".cursor/mcp.json"))).toBe(false);
    expect(existsSync(join(cwd, "AGENTS.md"))).toBe(false);
    expect(existsSync(join(cwd, ".claude"))).toBe(false);
    expect(runs.some((r) => r[2] === "add")).toBe(false);
    expect(out.join("\n")).toMatch(/would connect Nucleux/);
  });

  it("never rewrites a config it can't parse, and says what to add", () => {
    mkdirSync(join(home, ".cursor"));
    writeFileSync(join(home, ".cursor/mcp.json"), '{ // mine\n "mcpServers": {} }');
    expect(runAdd(["--no-project"], env())).toBe(2);
    expect(readFileSync(join(home, ".cursor/mcp.json"), "utf8")).toBe('{ // mine\n "mcpServers": {} }');
    expect(out.join("\n")).toMatch(/One step left:[\s\S]*Cursor: .*"nucleux"/);
  });

  it("--only targets one agent even if it isn't detected; --no-project writes nothing here", () => {
    mkdirSync(join(home, ".cursor"));
    expect(runAdd(["--only", "gemini", "--no-project"], env())).toBe(0);
    expect(json(join(home, ".gemini/settings.json")).mcpServers.nucleux.command).toBe("npx");
    expect(existsSync(join(home, ".cursor/mcp.json"))).toBe(false);
    expect(existsSync(join(cwd, "AGENTS.md"))).toBe(false);
  });

  it("uses cmd /c on Windows and the APPDATA paths", () => {
    const appData = join(home, "AppData/Roaming");
    mkdirSync(join(appData, "Claude"), { recursive: true });
    expect(runAdd(["--no-project"], env({ platform: "win32", appData }))).toBe(0);
    expect(json(join(appData, "Claude/claude_desktop_config.json")).mcpServers.nucleux).toEqual({
      command: "cmd",
      args: ["/c", "npx", "-y", "@nucleux/mcp"],
    });
  });

  it("says so when no agent is found, and rejects unknown options", () => {
    expect(runAdd([], env())).toBe(1);
    expect(out.join("\n")).toMatch(/No coding agents found/);
    expect(runAdd(["--only", "emacs"], env())).toBe(1);
    expect(runAdd(["--bogus"], env())).toBe(1);
  });

  it("skips project files outside a project folder", () => {
    rmSync(join(cwd, "package.json"));
    mkdirSync(join(home, ".cursor"));
    expect(runAdd([], env())).toBe(0);
    expect(existsSync(join(cwd, "AGENTS.md"))).toBe(false);
    expect(out.join("\n")).toMatch(/not in a project folder/);
  });
});
