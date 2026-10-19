import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const USAGE = `Usage: npx -y @nucleux/mcp init [--claude] [--codex] [--agents-md] [--force]

Installs the nucleux-design skill into the current project.
  --claude     .claude/skills/nucleux-design/SKILL.md   (Claude Code)
  --codex      .agents/skills/nucleux-design/SKILL.md   (Codex)
  --agents-md  append the Nucleux section to ./AGENTS.md (once)
  --force      overwrite an existing SKILL.md
With no target flags, installs for both Claude Code and Codex.`;

/** `nucleux-mcp init`: copy the shipped skill into the project. Never touches other files. */
export function runInit(args: string[], cwd = process.cwd()): number {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(USAGE);
    return 0;
  }
  const known = new Set(["--claude", "--codex", "--agents-md", "--force"]);
  const unknown = args.filter((a) => !known.has(a));
  if (unknown.length) {
    console.error(`Unknown option: ${unknown.join(" ")}\n\n${USAGE}`);
    return 1;
  }
  // dist/index.js → package root (skills/ and templates/ ship beside dist/).
  const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const skill = readFileSync(join(pkgRoot, "skills", "nucleux-design", "SKILL.md"), "utf8");
  const force = args.includes("--force");
  const both = !args.includes("--claude") && !args.includes("--codex");
  const targets = [
    ...(both || args.includes("--claude") ? [".claude/skills"] : []),
    ...(both || args.includes("--codex") ? [".agents/skills"] : []),
  ];

  for (const base of targets) {
    const file = join(cwd, base, "nucleux-design", "SKILL.md");
    if (existsSync(file) && !force) {
      console.log(`skip   ${relative(cwd, file)} (exists; --force to overwrite)`);
      continue;
    }
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, skill);
    console.log(`wrote  ${relative(cwd, file)}`);
  }

  if (args.includes("--agents-md")) {
    const section = readFileSync(join(pkgRoot, "templates", "AGENTS.md"), "utf8");
    const file = join(cwd, "AGENTS.md");
    const current = existsSync(file) ? readFileSync(file, "utf8") : "";
    if (current.includes("## UI: Nucleux design system")) {
      console.log("skip   AGENTS.md (already has the Nucleux section)");
    } else {
      appendFileSync(file, `${current && !current.endsWith("\n\n") ? "\n" : ""}${section}`);
      console.log(`${current ? "append" : "wrote "} AGENTS.md`);
    }
  }

  console.log(`
Next, connect the MCP server the skill uses:
  Claude Code:  claude mcp add nucleux -- npx -y @nucleux/mcp
  Codex:        codex mcp add nucleux -- npx -y @nucleux/mcp`);
  return 0;
}
