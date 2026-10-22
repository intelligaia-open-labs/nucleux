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

export interface ProjectFilesOptions {
  cwd: string;
  /** .claude/skills/nucleux-design/SKILL.md */
  claude: boolean;
  /** .agents/skills/nucleux-design/SKILL.md */
  codex: boolean;
  /** The Nucleux section in ./AGENTS.md (appended once). */
  agentsMd: boolean;
  force: boolean;
  dryRun?: boolean;
}

/** Writes the skill / AGENTS.md section into a project; returns one line per file. Shared by `init` and `add`. */
export function installProjectFiles(o: ProjectFilesOptions): string[] {
  // dist/index.js → package root (skills/ and templates/ ship beside dist/).
  const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const out: string[] = [];
  const targets = [...(o.claude ? [".claude/skills"] : []), ...(o.codex ? [".agents/skills"] : [])];
  for (const base of targets) {
    const file = join(o.cwd, base, "nucleux-design", "SKILL.md");
    if (existsSync(file) && !o.force) {
      out.push(`skip   ${relative(o.cwd, file)} (exists; --force to overwrite)`);
      continue;
    }
    if (!o.dryRun) {
      const skill = readFileSync(join(pkgRoot, "skills", "nucleux-design", "SKILL.md"), "utf8");
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, skill);
    }
    out.push(`${o.dryRun ? "would write" : "wrote "} ${relative(o.cwd, file)}`);
  }
  if (o.agentsMd) {
    const file = join(o.cwd, "AGENTS.md");
    const current = existsSync(file) ? readFileSync(file, "utf8") : "";
    if (current.includes("## UI: Nucleux design system")) {
      out.push("skip   AGENTS.md (already has the Nucleux section)");
    } else {
      if (!o.dryRun) {
        const section = readFileSync(join(pkgRoot, "templates", "AGENTS.md"), "utf8");
        appendFileSync(file, `${current && !current.endsWith("\n\n") ? "\n" : ""}${section}`);
      }
      out.push(`${o.dryRun ? "would " : ""}${current ? "append" : o.dryRun ? "write" : "wrote "} AGENTS.md`);
    }
  }
  return out;
}

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
  const lines = installProjectFiles({
    cwd,
    claude: args.includes("--claude") || !args.includes("--codex"),
    codex: args.includes("--codex") || !args.includes("--claude"),
    agentsMd: args.includes("--agents-md"),
    force: args.includes("--force"),
  });
  for (const line of lines) console.log(line);

  console.log(`
Next, connect the MCP server the skill uses (or run \`npx -y @nucleux/mcp add\` to do it for every agent):
  Claude Code:  claude mcp add nucleux -- npx -y @nucleux/mcp
  Codex:        codex mcp add nucleux -- npx -y @nucleux/mcp`);
  return 0;
}
