import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, hostname } from "node:os";
import { dirname, join } from "node:path";

import { AuthError, credentialsPath, exchangeCode, normalizeCode, who, writeCredentials, type AuthEnv } from "./auth.js";
import { installProjectFiles } from "./init.js";

const USAGE = `Usage: npx -y @nucleux/mcp add [--code <XXXX-XXXX> | --local] [--only <agents>] [--no-project] [--dry-run]

Connects Nucleux to every coding agent installed on this machine, and adds the
nucleux-design guidance to the current project. Safe to run again: anything
already set up is left alone.

  --code <code>    sign in to the hosted server (https://nucleux.in/mcp) with the
                   one-time code from https://nucleux.in/mcp/connect. The token is
                   saved once on this machine (never in agent configs) and every
                   agent runs \`npx -y @nucleux/mcp remote\`; replaces a local
                   nucleux entry. Without --code, agents run the open local server.
  --local          switch agents set up with --code back to the open local
                   server (replaces a remote nucleux entry; keeps the saved token)
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
  /** Runs a command and returns its stdout (undefined if it failed). Used to inspect an existing Claude Code entry. */
  output?: (cmd: string, args: string[]) => string | undefined;
  /** For `--code`: process.env, fetch and the label sent with the exchange. */
  vars?: Record<string, string | undefined>;
  fetch?: typeof fetch;
  hostname?: () => string;
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
    output: (cmd, args) => {
      const r = spawnSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], shell: platform === "win32" });
      return r.status === 0 ? r.stdout : undefined;
    },
    vars: process.env,
    fetch: (...a) => fetch(...a),
    hostname,
  };
}

/**
 * The server command. Windows clients need `cmd /c` to start npx. `remote` is
 * the signed-in proxy to the hosted server; it reads the token from the
 * credentials file, so no secret ever goes into an agent's config.
 */
function serverCommand(platform: NodeJS.Platform, remote = false) {
  const pkg = ["-y", "@nucleux/mcp", ...(remote ? ["remote"] : [])];
  return platform === "win32" ? { command: "cmd", args: ["/c", "npx", ...pkg] } : { command: "npx", args: pkg };
}

/** Where each editor keeps its user settings folder. */
function appSupport(env: AddEnv, app: string) {
  if (env.platform === "darwin") return join(env.home, "Library", "Application Support", app);
  if (env.platform === "win32") return join(env.appData ?? join(env.home, "AppData", "Roaming"), app);
  return join(env.home, ".config", app);
}

type Outcome = "added" | "replaced" | "already" | "manual";
interface Agent {
  id: AgentId;
  name: string;
  detected: boolean;
  connect: (dryRun: boolean) => { outcome: Outcome; where: string; hint?: string };
  /** Reads AGENTS.md / a skill folder in the project. */
  reads: "claude-skill" | "agents-md" | "none";
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Adds `nucleux` to a JSON config under `key`, keeping everything else. Never rewrites a file it can't parse.
 * With `replace` (signing in), an existing different `nucleux` entry is swapped for `entry`.
 */
function jsonServer(file: string, key: "mcpServers" | "servers", entry: object, dryRun: boolean, replace = false) {
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
  if (servers.nucleux && (!replace || same(servers.nucleux, entry))) return { outcome: "already" as const, where: file };
  const outcome = servers.nucleux ? ("replaced" as const) : ("added" as const);
  if (!dryRun) {
    data[key] = { ...servers, nucleux: entry };
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  }
  return { outcome, where: file };
}

/** The `[mcp_servers.nucleux]` table (and any `[mcp_servers.nucleux.*]` sub-tables) in a Codex config. */
const CODEX_BLOCK = /^\[mcp_servers\.nucleux(?:\.[^\]]*)?\][^\n]*\n?(?:(?!\[)[^\n]*\n?)*/gm;

/** `replace`: swap an existing `nucleux` entry of the other kind (local ↔ remote) for this one. */
function agents(env: AddEnv, remote = false, replace = false): Agent[] {
  const srv = serverCommand(env.platform, remote);
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
        let outcome: Outcome = "added";
        if (env.run("claude", ["mcp", "get", "nucleux"]) === 0) {
          const isRemote = !!env.output?.("claude", ["mcp", "get", "nucleux"])?.includes("@nucleux/mcp remote");
          if (!replace || isRemote === remote) {
            return { outcome: "already", where };
          }
          outcome = "replaced";
          if (!dryRun && env.run("claude", ["mcp", "remove", "--scope", "user", "nucleux"]) !== 0) {
            env.run("claude", ["mcp", "remove", "nucleux"]);
          }
        }
        if (dryRun) return { outcome, where };
        const ok = env.run("claude", ["mcp", "add", "--scope", "user", "nucleux", "--", srv.command, ...srv.args]) === 0;
        return ok
          ? { outcome, where }
          : { outcome: "manual", where, hint: `run: claude mcp add --scope user nucleux -- ${[srv.command, ...srv.args].join(" ")}` };
      },
    },
    {
      id: "cursor",
      name: "Cursor",
      detected: existsSync(join(env.home, ".cursor")) || env.has("cursor"),
      reads: "agents-md",
      connect: (dryRun) => jsonServer(join(env.home, ".cursor", "mcp.json"), "mcpServers", srv, dryRun, replace),
    },
    {
      id: "vscode",
      name: "VS Code (Copilot)",
      detected: existsSync(vscodeUser),
      reads: "agents-md",
      connect: (dryRun) => jsonServer(join(vscodeUser, "mcp.json"), "servers", { type: "stdio", ...srv }, dryRun, replace),
    },
    {
      id: "codex",
      name: "Codex",
      detected: existsSync(codexDir) || env.has("codex"),
      reads: "agents-md",
      connect: (dryRun) => {
        const file = join(codexDir, "config.toml");
        let current = existsSync(file) ? readFileSync(file, "utf8") : "";
        const block = `[mcp_servers.nucleux]\ncommand = ${JSON.stringify(srv.command)}\nargs = ${JSON.stringify(srv.args)}\n`;
        let outcome: Outcome = "added";
        if (/^\[mcp_servers\.nucleux\]/m.test(current)) {
          const existing = current.match(CODEX_BLOCK)?.join("") ?? "";
          const isRemote = /"@nucleux\/mcp",\s*"remote"/.test(existing);
          if (!replace || isRemote === remote) {
            return { outcome: "already", where: file };
          }
          outcome = "replaced";
          current = current.replace(CODEX_BLOCK, "").replace(/\n{3,}/g, "\n\n");
        }
        if (!dryRun) {
          mkdirSync(codexDir, { recursive: true });
          const sep = current && !current.endsWith("\n\n") ? (current.endsWith("\n") ? "\n" : "\n\n") : "";
          writeFileSync(file, current + sep + block);
        }
        return { outcome, where: file };
      },
    },
    {
      id: "windsurf",
      name: "Windsurf",
      detected: existsSync(join(env.home, ".codeium", "windsurf")),
      reads: "agents-md",
      connect: (dryRun) => jsonServer(join(env.home, ".codeium", "windsurf", "mcp_config.json"), "mcpServers", srv, dryRun, replace),
    },
    {
      id: "claude-desktop",
      name: "Claude Desktop",
      detected: existsSync(desktopDir),
      reads: "none",
      connect: (dryRun) => jsonServer(join(desktopDir, "claude_desktop_config.json"), "mcpServers", srv, dryRun, replace),
    },
    {
      id: "gemini",
      name: "Gemini CLI",
      detected: existsSync(join(env.home, ".gemini")) || env.has("gemini"),
      reads: "agents-md",
      connect: (dryRun) => jsonServer(join(env.home, ".gemini", "settings.json"), "mcpServers", srv, dryRun, replace),
    },
  ];
}

/**
 * `nucleux-mcp add`: connect every installed coding agent and add the project guidance.
 * Returns a promise only with `--code` (it signs in over the network first).
 */
export function runAdd(args: string[], env: AddEnv = defaultEnv()): number | Promise<number> {
  if (args.includes("--help") || args.includes("-h")) {
    env.log(USAGE);
    return 0;
  }
  const dryRun = args.includes("--dry-run");
  const noProject = args.includes("--no-project");
  let only: AgentId[] | undefined;
  let code: string | undefined;
  const local = args.includes("--local");
  const rest = args.filter((a) => a !== "--dry-run" && a !== "--no-project" && a !== "--local");
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--code" || a.startsWith("--code=")) {
      const raw = a === "--code" ? rest[++i] : a.slice(7);
      code = raw === undefined ? undefined : normalizeCode(raw);
      if (!code) {
        console.error(`--code needs the code from https://nucleux.in/mcp/connect, like ABCD-2345.\n\n${USAGE}`);
        return 1;
      }
      continue;
    }
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

  const remote = code !== undefined;
  if (remote && local) {
    console.error(`Use either --code or --local, not both.\n\n${USAGE}`);
    return 1;
  }
  const all = agents(env, remote, remote || local);
  // --only connects what was asked for even if we can't see it installed.
  const chosen = only ? all.filter((a) => only!.includes(a.id)) : all.filter((a) => a.detected);
  if (!chosen.length) {
    env.log(
      `No coding agents found. Pick one with --only (${AGENT_IDS.join(", ")}),\n` +
        "or see https://github.com/intelligaia-open-labs/nucleux/tree/main/packages/mcp#readme",
    );
    return 1;
  }
  if (!remote) return connectAgents(env, chosen, { dryRun, noProject, remote });
  return signIn(env, code!, dryRun).then((ok) => (ok ? connectAgents(env, chosen, { dryRun, noProject, remote }) : 1));
}

function authEnv(env: AddEnv): AuthEnv {
  return {
    home: env.home,
    platform: env.platform,
    appData: env.appData,
    vars: env.vars ?? {},
    fetch: env.fetch ?? ((...a) => fetch(...a)),
    hostname: env.hostname ?? hostname,
    log: env.log,
  };
}

/** Exchanges the one-time code for the user's token and saves it (0600). Writes nothing on --dry-run. */
async function signIn(env: AddEnv, code: string, dryRun: boolean): Promise<boolean> {
  const a = authEnv(env);
  const file = credentialsPath(a);
  if (dryRun) {
    env.log(`Dry run — nothing is changed.\nWould sign in with code ${code} and save the token to ${file}.`);
    return true;
  }
  try {
    const creds = await exchangeCode(a, code);
    writeCredentials(a, creds);
    env.log(`Signed in to ${creds.server} as ${who(creds)}. Token saved to ${file} (readable only by you).`);
    return true;
  } catch (err) {
    if (!(err instanceof AuthError)) throw err;
    env.log(err.message);
    return false;
  }
}

function connectAgents(env: AddEnv, chosen: Agent[], o: { dryRun: boolean; noProject: boolean; remote: boolean }): number {
  const { dryRun, noProject, remote } = o;
  const pad = Math.max(...chosen.map((a) => a.name.length));
  env.log(`${dryRun && !remote ? "Dry run — nothing is changed.\n" : ""}Found: ${chosen.map((a) => a.name).join(", ")}`);
  const manual: string[] = [];
  const restart: string[] = [];
  const replaced: string[] = [];
  const target = remote ? "the hosted Nucleux server" : "Nucleux";
  for (const a of chosen) {
    const r = a.connect(dryRun);
    const mark = r.outcome === "manual" ? "!" : "✓";
    const what =
      r.outcome === "added"
        ? dryRun ? `would connect ${target}` : `${remote ? "hosted Nucleux" : "Nucleux"} connected`
        : r.outcome === "replaced"
          ? remote
            ? dryRun ? "would replace the local server with the hosted one" : "local server replaced by the hosted one"
            : dryRun ? "would replace the hosted server with the local one" : "hosted server replaced by the local one"
          : r.outcome === "already"
            ? "already connected"
            : "needs one step";
    env.log(`  ${mark} ${a.name.padEnd(pad)}  ${what} — ${r.where}`);
    if (r.hint) manual.push(`  ${a.name}: ${r.hint}`);
    if (r.outcome === "replaced") replaced.push(a.name);
    if ((r.outcome === "added" || r.outcome === "replaced") && a.id !== "claude-code" && a.id !== "codex" && a.id !== "gemini") {
      restart.push(a.name);
    }
  }
  if (replaced.length) {
    env.log(
      remote
        ? `  (Replaced the local nucleux entry in ${replaced.join(", ")} with \`npx -y @nucleux/mcp remote\`; other servers and settings are untouched.)`
        : `  (Replaced the hosted nucleux entry in ${replaced.join(", ")} with the local \`npx -y @nucleux/mcp\`; other servers and settings are untouched. Your sign-in is kept: \`npx -y @nucleux/mcp logout\` removes it.)`,
    );
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
