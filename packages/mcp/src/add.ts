import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

import { installProjectFiles } from "./init.js";

const USAGE = `Usage: npx -y @nucleux/mcp add [--only <agents>] [--no-project] [--dry-run]

Connects Nucleux to every coding agent installed on this machine, and adds the
nucleux-design guidance to the current project. Safe to run again: anything
already set up is left alone.

  --only <agents>  comma-separated subset: ${"claude-code,cursor,vscode,codex,windsurf,claude-desktop,gemini"}
  --no-project     only connect the agents; write nothing into this folder
  --dry-run        show what would change, change nothing`;

export type AgentId = "claude-code" | "cursor" | "vscode" | "codex" | "windsurf" | "claude-desktop" | "gemini";
const AGENT_IDS: AgentId[] = ["claude-code", "cursor", "vscode", "codex", "windsurf", "claude-desktop", "gemini"];

export interface AddEnv {
  home: string;
  cwd: string;
  platform: NodeJS.Platform;
  /** %APPDATA% on Windows. */
  appData?: string;
  /** Is this command on PATH? */
  has: (cmd: string) => boolean;
  /** Runs a command; returns its exit status. */
  run: (cmd: string, args: string[]) => number;
  log: (line: string) => void;
}

function defaultEnv(): AddEnv {
  const platform = process.platform;
  return {
    home: homedir(),
    cwd: process.cwd(),
    platform,
    appData: process.env.APPDATA,
    has: (cmd) => spawnSync(platform === "win32" ? "where" : "which", [cmd], { stdio: "ignore" }).status === 0,
    run: (cmd, args) =>
      spawnSync(cmd, args, { stdio: "ignore", shell: platform === "win32" }).status ?? 1,
    log: (line) => console.log(line),
  };
}

/** The server command. Windows clients need `cmd /c` to start npx. */
function serverCommand(platform: NodeJS.Platform) {
  return platform === "win32"
    ? { command: "cmd", args: ["/c", "npx", "-y", "@nucleux/mcp"] }
    : { command: "npx", args: ["-y", "@nucleux/mcp"] };
}

/** Where each editor keeps its user settings folder. */
function appSupport(env: AddEnv, app: string) {
  if (env.platform === "darwin") return join(env.home, "Library", "Application Support", app);
  if (env.platform === "win32") return join(env.appData ?? join(env.home, "AppData", "Roaming"), app);
  return join(env.home, ".config", app);
}

type Outcome = "added" | "already" | "manual";
interface Agent {
  id: AgentId;
  name: string;
  detected: boolean;
  connect: (dryRun: boolean) => { outcome: Outcome; where: string; hint?: string };
  /** Reads AGENTS.md / a skill folder in the project. */
  reads: "claude-skill" | "agents-md" | "none";
}

/** Adds `nucleux` to a JSON config under `key`, keeping everything else. Never rewrites a file it can't parse. */
function jsonServer(file: string, key: "mcpServers" | "servers", entry: object, dryRun: boolean) {
  let data: Record<string, unknown> = {};
  if (existsSync(file)) {
    try {
      const text = readFileSync(file, "utf8");
      data = text.trim() ? JSON.parse(text) : {};
    } catch {
      return {
        outcome: "manual" as const,
        where: file,
        hint: `couldn't read it as plain JSON (comments?); add under "${key}": "nucleux": ${JSON.stringify(entry)}`,
      };
    }
  }
  const servers = (data[key] ?? {}) as Record<string, unknown>;
  if (servers.nucleux) return { outcome: "already" as const, where: file };
  if (!dryRun) {
    data[key] = { ...servers, nucleux: entry };
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  }
  return { outcome: "added" as const, where: file };
}

function agents(env: AddEnv): Agent[] {
  const srv = serverCommand(env.platform);
  const codexDir = join(env.home, ".codex");
  const vscodeUser = join(appSupport(env, "Code"), "User");
  const desktopDir = appSupport(env, "Claude");
  return [
    {
      id: "claude-code",
      name: "Claude Code",
      detected: env.has("claude"),
      reads: "claude-skill",
      connect: (dryRun) => {
        const where = "claude mcp (user scope)";
        if (env.run("claude", ["mcp", "get", "nucleux"]) === 0) return { outcome: "already", where };
        if (dryRun) return { outcome: "added", where };
        const ok = env.run("claude", ["mcp", "add", "--scope", "user", "nucleux", "--", srv.command, ...srv.args]) === 0;
        return ok
          ? { outcome: "added", where }
          : { outcome: "manual", where, hint: `run: claude mcp add --scope user nucleux -- ${[srv.command, ...srv.args].join(" ")}` };
      },
    },
    {
      id: "cursor",
      name: "Cursor",
      detected: existsSync(join(env.home, ".cursor")) || env.has("cursor"),
      reads: "agents-md",
      connect: (dryRun) => jsonServer(join(env.home, ".cursor", "mcp.json"), "mcpServers", srv, dryRun),
    },
    {
      id: "vscode",
      name: "VS Code (Copilot)",
      detected: existsSync(vscodeUser),
      reads: "agents-md",
      connect: (dryRun) => jsonServer(join(vscodeUser, "mcp.json"), "servers", { type: "stdio", ...srv }, dryRun),
    },
    {
      id: "codex",
      name: "Codex",
      detected: existsSync(codexDir) || env.has("codex"),
      reads: "agents-md",
      connect: (dryRun) => {
        const file = join(codexDir, "config.toml");
        const current = existsSync(file) ? readFileSync(file, "utf8") : "";
        if (/^\[mcp_servers\.nucleux\]/m.test(current)) return { outcome: "already", where: file };
        if (!dryRun) {
          const block = `[mcp_servers.nucleux]\ncommand = ${JSON.stringify(srv.command)}\nargs = ${JSON.stringify(srv.args)}\n`;
          mkdirSync(codexDir, { recursive: true });
          const sep = current && !current.endsWith("\n\n") ? (current.endsWith("\n") ? "\n" : "\n\n") : "";
          writeFileSync(file, current + sep + block);
        }
        return { outcome: "added", where: file };
      },
    },
    {
      id: "windsurf",
      name: "Windsurf",
      detected: existsSync(join(env.home, ".codeium", "windsurf")),
      reads: "agents-md",
      connect: (dryRun) => jsonServer(join(env.home, ".codeium", "windsurf", "mcp_config.json"), "mcpServers", srv, dryRun),
    },
    {
      id: "claude-desktop",
      name: "Claude Desktop",
      detected: existsSync(desktopDir),
      reads: "none",
      connect: (dryRun) => jsonServer(join(desktopDir, "claude_desktop_config.json"), "mcpServers", srv, dryRun),
    },
    {
      id: "gemini",
      name: "Gemini CLI",
      detected: existsSync(join(env.home, ".gemini")) || env.has("gemini"),
      reads: "agents-md",
      connect: (dryRun) => jsonServer(join(env.home, ".gemini", "settings.json"), "mcpServers", srv, dryRun),
    },
  ];
}

/** `nucleux-mcp add`: connect every installed coding agent and add the project guidance. */
export function runAdd(args: string[], env: AddEnv = defaultEnv()): number {
  if (args.includes("--help") || args.includes("-h")) {
    env.log(USAGE);
    return 0;
  }
  const dryRun = args.includes("--dry-run");
  const noProject = args.includes("--no-project");
  let only: AgentId[] | undefined;
  const rest = args.filter((a) => a !== "--dry-run" && a !== "--no-project");
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    const value = a === "--only" ? rest[++i] : a.startsWith("--only=") ? a.slice(7) : undefined;
    if (value === undefined) {
      console.error(`Unknown option: ${a}\n\n${USAGE}`);
      return 1;
    }
    const ids = value.split(",").map((s) => s.trim()).filter(Boolean);
    const bad = ids.filter((id) => !AGENT_IDS.includes(id as AgentId));
    if (!ids.length || bad.length) {
      console.error(`Unknown agent: ${bad.join(", ") || "(none)"}. Use: ${AGENT_IDS.join(", ")}`);
      return 1;
    }
    only = ids as AgentId[];
  }

  const all = agents(env);
  // --only connects what was asked for even if we can't see it installed.
  const chosen = only ? all.filter((a) => only!.includes(a.id)) : all.filter((a) => a.detected);
  if (!chosen.length) {
    env.log(
      `No coding agents found. Pick one with --only (${AGENT_IDS.join(", ")}),\n` +
        "or see https://github.com/intelligaia-open-labs/nucleux/tree/main/packages/mcp#readme",
    );
    return 1;
  }

  const pad = Math.max(...chosen.map((a) => a.name.length));
  env.log(`${dryRun ? "Dry run — nothing is changed.\n" : ""}Found: ${chosen.map((a) => a.name).join(", ")}`);
  const manual: string[] = [];
  const restart: string[] = [];
  for (const a of chosen) {
    const r = a.connect(dryRun);
    const mark = r.outcome === "manual" ? "!" : "✓";
    const what = r.outcome === "added" ? (dryRun ? "would connect Nucleux" : "Nucleux connected") : r.outcome === "already" ? "already connected" : "needs one step";
    env.log(`  ${mark} ${a.name.padEnd(pad)}  ${what} — ${r.where}`);
    if (r.hint) manual.push(`  ${a.name}: ${r.hint}`);
    if (r.outcome === "added" && a.id !== "claude-code" && a.id !== "codex" && a.id !== "gemini") restart.push(a.name);
  }

  const inProject = existsSync(join(env.cwd, "package.json")) || existsSync(join(env.cwd, ".git"));
  if (!noProject && inProject) {
    const reads = new Set(chosen.map((a) => a.reads));
    for (const line of installProjectFiles({
      cwd: env.cwd,
      claude: reads.has("claude-skill"),
      codex: chosen.some((a) => a.id === "codex"),
      agentsMd: reads.has("agents-md"),
      force: false,
      dryRun,
    })) {
      env.log(`  ✓ ${"project".padEnd(pad)}  ${line}`);
    }
  } else if (!noProject) {
    env.log("  (not in a project folder, so no project files were written; run it again from your app's root)");
  }

  if (manual.length) env.log(`\nOne step left:\n${manual.join("\n")}`);
  env.log(
    `\n${dryRun ? "Run it without --dry-run to apply." : "Done."}` +
      (restart.length && !dryRun ? ` Restart ${restart.join(", ")}.` : "") +
      ` Then ask your agent: "Build a settings page with Nucleux".`,
  );
  return manual.length ? 2 : 0;
}
