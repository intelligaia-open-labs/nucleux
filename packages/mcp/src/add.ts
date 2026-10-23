import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, hostname } from "node:os";
import { dirname, join } from "node:path";

import {
  AuthError,
  credentialsPath,
  DEFAULT_SERVER,
  exchangeCode,
  forgetCredentials,
  normalizeCode,
  readCredentials,
  who,
  writeCredentials,
  type AuthEnv,
  type Credentials,
} from "./auth.js";
import { installProjectFiles } from "./init.js";

const USAGE = `Usage: npx -y @nucleux/mcp add [--code <XXXX-XXXX> | --local] [--only <agents>] [--no-project] [--dry-run]

Connects Nucleux to every coding agent installed on this machine, and adds the
nucleux-design guidance to the current project. Safe to run again: anything
already set up is left alone.

  --code <code>    sign in to the hosted server (https://nucleux.in/mcp) with the
                   one-time code from https://nucleux.in/mcp/connect, and connect
                   every agent directly to it over HTTP. Your token is saved in
                   ~/.config/nucleux/credentials.json and in each agent's MCP
                   config (both readable only by you); revoke it on the Connect
                   page. Replaces any existing nucleux entry (re-run with a new
                   code to rotate the token). Claude Desktop runs the local
                   \`npx -y @nucleux/mcp remote\` proxy instead. Without --code,
                   agents run the open local server.
  --local          switch agents back to the open local server (replaces a hosted
                   nucleux entry; keeps the saved sign-in)
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
  /** %LOCALAPPDATA% on Windows (where the Microsoft Store build of Claude Desktop keeps its config). */
  localAppData?: string;
  /** Absolute path of the npx that ships with the node running this command, if it exists. */
  npxPath?: string;
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
    localAppData: process.env.LOCALAPPDATA,
    npxPath: (() => {
      const p = join(dirname(process.execPath), platform === "win32" ? "npx.cmd" : "npx");
      return existsSync(p) ? p : undefined;
    })(),
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

/** The local server command. Windows clients need `cmd /c` to start npx. `remote` is the signed-in stdio proxy. */
function serverCommand(platform: NodeJS.Platform, remote = false) {
  const pkg = ["-y", "@nucleux/mcp", ...(remote ? ["remote"] : [])];
  return platform === "win32" ? { command: "cmd", args: ["/c", "npx", ...pkg] } : { command: "npx", args: pkg };
}

/**
 * Claude Desktop's settings folder. The Microsoft Store (MSIX) build on Windows
 * reads a virtualised copy under %LOCALAPPDATA%\\Packages\\Claude_*\\LocalCache\\Roaming\\Claude,
 * not %APPDATA%\\Claude, so prefer that one when it exists.
 */
function claudeDesktopDir(env: AddEnv) {
  if (env.platform === "win32") {
    const packages = join(env.localAppData ?? join(env.home, "AppData", "Local"), "Packages");
    try {
      for (const name of readdirSync(packages)) {
        if (!/^Claude_/i.test(name)) continue;
        const dir = join(packages, name, "LocalCache", "Roaming", "Claude");
        if (existsSync(dir)) return dir;
      }
    } catch {
      /* no Packages folder: the regular installer */
    }
  }
  return appSupport(env, "Claude");
}

/** Claude Desktop's command with npx by absolute path when we know it (it doesn't inherit the shell's PATH). */
function desktopCommand(env: AddEnv, cmd: { command: string; args: string[] }) {
  if (!env.npxPath) return cmd;
  return env.platform === "win32"
    ? { command: "cmd", args: ["/c", env.npxPath, ...cmd.args.slice(2)] }
    : { command: env.npxPath, args: cmd.args };
}

/** Where each editor keeps its user settings folder. */
function appSupport(env: AddEnv, app: string) {
  if (env.platform === "darwin") return join(env.home, "Library", "Application Support", app);
  if (env.platform === "win32") return join(env.appData ?? join(env.home, "AppData", "Roaming"), app);
  return join(env.home, ".config", app);
}

/**
 * What `add` writes. `local`: the open stdio server (`replaceHosted` also swaps
 * a hosted entry back, for `--local`). `hosted`: a direct HTTP connection with
 * the user's token (`--code`), replacing whatever `nucleux` entry is there.
 */
type Mode = { kind: "local"; replaceHosted: boolean } | { kind: "hosted"; server: string; token: string };

/** What an existing `nucleux` entry is: the local server, the `remote` proxy, a direct hosted connection, or something else. */
type Kind = "local" | "proxy" | "direct" | "other";

function classify(entry: unknown): Kind {
  if (!entry || typeof entry !== "object") return "other";
  const e = entry as Record<string, unknown>;
  if (typeof e.url === "string" || typeof e.serverUrl === "string" || typeof e.httpUrl === "string") return "direct";
  const args = JSON.stringify(e.args ?? []);
  if (args.includes("@nucleux/mcp")) return /"remote"/.test(args) ? "proxy" : "local";
  return "other";
}
const trimSlash = (u: string) => u.replace(/\/+$/, "");
const directUrl = (entry: unknown) => {
  const e = (entry ?? {}) as Record<string, unknown>;
  return trimSlash(String(e.url ?? e.serverUrl ?? e.httpUrl ?? ""));
};
/** Is this entry ours to remove on logout: the proxy, or a direct connection to `server`? */
const isHostedFor = (entry: unknown, server: string) => {
  const k = classify(entry);
  return k === "proxy" || (k === "direct" && directUrl(entry) === trimSlash(server));
};

const TOKEN_PLACEHOLDER = "<token from your nucleux credentials.json>";
/** Never print the token: hints show a placeholder instead. */
const redact = (text: string, token?: string) => (token ? text.split(token).join(TOKEN_PLACEHOLDER) : text);

/** Owner-only, for files that now hold a token. Keeps the rest of the file as is. */
function protect(file: string, platform: NodeJS.Platform) {
  if (platform !== "win32") chmodSync(file, 0o600);
}

type Outcome = "added" | "replaced" | "already" | "manual";
interface Result {
  outcome: Outcome;
  where: string;
  hint?: string;
  /** How a hosted entry connects. */
  via?: "direct" | "proxy";
}
interface Agent {
  id: AgentId;
  name: string;
  detected: boolean;
  connect: (dryRun: boolean) => Result;
  /** Removes a hosted `nucleux` entry for `server` (logout); returns where, or undefined if there was none. */
  disconnect: (server: string) => string | undefined;
  /** Reads AGENTS.md / a skill folder in the project. */
  reads: "claude-skill" | "agents-md" | "none";
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Should `add` swap an existing `nucleux` entry for `entry`? */
function shouldReplace(mode: Mode, existing: unknown, entry: unknown) {
  if (same(existing, entry)) return false;
  if (mode.kind === "hosted") return true;
  return mode.replaceHosted && (classify(existing) === "proxy" || classify(existing) === "direct");
}

function readJson(file: string): Record<string, unknown> | undefined {
  if (!existsSync(file)) return {};
  try {
    const text = readFileSync(file, "utf8");
    return text.trim() ? JSON.parse(text) : {};
  } catch {
    return undefined;
  }
}

/**
 * Adds `nucleux` to a JSON config under `key`, keeping everything else. Never rewrites a file it can't parse.
 * Replaces an existing entry as the mode says; a file that gets a token becomes 0600.
 */
function jsonServer(env: AddEnv, file: string, key: "mcpServers" | "servers", entry: object, dryRun: boolean, mode: Mode, via?: Result["via"]): Result {
  const token = mode.kind === "hosted" ? mode.token : undefined;
  const data = readJson(file);
  if (!data) {
    return {
      outcome: "manual",
      where: file,
      hint: redact(`couldn't read it as plain JSON (comments?); add under "${key}": "nucleux": ${JSON.stringify(entry)}`, token),
      via,
    };
  }
  const servers = (data[key] ?? {}) as Record<string, unknown>;
  if (servers.nucleux && !shouldReplace(mode, servers.nucleux, entry)) return { outcome: "already", where: file, via };
  const outcome = servers.nucleux ? "replaced" : "added";
  if (!dryRun) {
    data[key] = { ...servers, nucleux: entry };
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
    if (token && JSON.stringify(entry).includes(token)) protect(file, env.platform);
  }
  return { outcome, where: file, via };
}

/** Removes a hosted `nucleux` entry from a JSON config, keeping everything else. */
function jsonRemove(file: string, key: "mcpServers" | "servers", server: string) {
  if (!existsSync(file)) return undefined;
  const data = readJson(file);
  const servers = data?.[key] as Record<string, unknown> | undefined;
  if (!data || !servers?.nucleux || !isHostedFor(servers.nucleux, server)) return undefined;
  const { nucleux: _removed, ...others } = servers;
  data[key] = others;
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  return file;
}

/** The `[mcp_servers.nucleux]` table (and any `[mcp_servers.nucleux.*]` sub-tables) in a Codex config. */
const CODEX_BLOCK = /^\[mcp_servers\.nucleux(?:\.[^\]]*)?\][^\n]*\n?(?:(?!\[)[^\n]*\n?)*/gm;

function codexKind(block: string): { kind: Kind; url?: string } {
  const url = block.match(/^\s*url\s*=\s*"([^"]*)"/m)?.[1];
  if (url !== undefined) return { kind: "direct", url: trimSlash(url) };
  if (/"@nucleux\/mcp",\s*"remote"/.test(block)) return { kind: "proxy" };
  if (block.includes("@nucleux/mcp")) return { kind: "local" };
  return { kind: "other" };
}

function agents(env: AddEnv, mode: Mode): Agent[] {
  const hosted = mode.kind === "hosted" ? mode : undefined;
  const local = serverCommand(env.platform);
  const proxy = serverCommand(env.platform, true);
  const headers = hosted ? { Authorization: `Bearer ${hosted.token}` } : {};
  const via: Result["via"] = hosted ? "direct" : undefined;
  const codexDir = join(env.home, ".codex");
  const codexFile = join(codexDir, "config.toml");
  const vscodeUser = join(appSupport(env, "Code"), "User");
  const desktopDir = claudeDesktopDir(env);
  const files = {
    cursor: join(env.home, ".cursor", "mcp.json"),
    vscode: join(vscodeUser, "mcp.json"),
    windsurf: join(env.home, ".codeium", "windsurf", "mcp_config.json"),
    desktop: join(desktopDir, "claude_desktop_config.json"),
    gemini: join(env.home, ".gemini", "settings.json"),
  };
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
          const info = env.output?.("claude", ["mcp", "get", "nucleux"]) ?? "";
          const isHosted = info.includes("@nucleux/mcp remote") || /^\s*(Type:\s*(http|sse)|URL:)/im.test(info);
          // Hosted: always re-add (a new code means a new token). Local: only --local swaps a hosted entry back.
          if (!hosted && !(mode.kind === "local" && mode.replaceHosted && isHosted)) return { outcome: "already", where, via };
          outcome = "replaced";
          if (!dryRun && env.run("claude", ["mcp", "remove", "--scope", "user", "nucleux"]) !== 0) {
            env.run("claude", ["mcp", "remove", "nucleux"]);
          }
        }
        if (dryRun) return { outcome, where, via };
        const args = hosted
          ? ["mcp", "add", "--transport", "http", "--scope", "user", "nucleux", hosted.server, "--header", `Authorization: Bearer ${hosted.token}`]
          : ["mcp", "add", "--scope", "user", "nucleux", "--", local.command, ...local.args];
        if (env.run("claude", args) === 0) return { outcome, where, via };
        return { outcome: "manual", where, via, hint: `run: claude ${redact(args.map((a) => (a.includes(" ") ? `"${a}"` : a)).join(" "), hosted?.token)}` };
      },
      disconnect: (server) => {
        if (!env.has("claude") || env.run("claude", ["mcp", "get", "nucleux"]) !== 0) return undefined;
        const info = env.output?.("claude", ["mcp", "get", "nucleux"]) ?? "";
        const isOurs = info.includes("@nucleux/mcp remote") || info.includes(trimSlash(server));
        if (!isOurs) return undefined;
        if (env.run("claude", ["mcp", "remove", "--scope", "user", "nucleux"]) !== 0 && env.run("claude", ["mcp", "remove", "nucleux"]) !== 0) {
          return undefined;
        }
        return "claude mcp (user scope)";
      },
    },
    {
      id: "cursor",
      name: "Cursor",
      detected: existsSync(join(env.home, ".cursor")) || env.has("cursor"),
      reads: "agents-md",
      connect: (dryRun) => jsonServer(env, files.cursor, "mcpServers", hosted ? { url: hosted.server, headers } : local, dryRun, mode, via),
      disconnect: (server) => jsonRemove(files.cursor, "mcpServers", server),
    },
    {
      id: "vscode",
      name: "VS Code (Copilot)",
      detected: existsSync(vscodeUser),
      reads: "agents-md",
      connect: (dryRun) =>
        jsonServer(env, files.vscode, "servers", hosted ? { type: "http", url: hosted.server, headers } : { type: "stdio", ...local }, dryRun, mode, via),
      disconnect: (server) => jsonRemove(files.vscode, "servers", server),
    },
    {
      id: "codex",
      name: "Codex",
      detected: existsSync(codexDir) || env.has("codex"),
      reads: "agents-md",
      connect: (dryRun) => {
        let current = existsSync(codexFile) ? readFileSync(codexFile, "utf8") : "";
        const block = hosted
          ? `[mcp_servers.nucleux]\nurl = ${JSON.stringify(hosted.server)}\nhttp_headers = { "Authorization" = ${JSON.stringify(headers.Authorization)} }\n`
          : `[mcp_servers.nucleux]\ncommand = ${JSON.stringify(local.command)}\nargs = ${JSON.stringify(local.args)}\n`;
        let outcome: Outcome = "added";
        if (/^\[mcp_servers\.nucleux\]/m.test(current)) {
          const existing = current.match(CODEX_BLOCK)?.join("") ?? "";
          const { kind } = codexKind(existing);
          const replace = hosted
            ? existing.trim() !== block.trim()
            : mode.kind === "local" && mode.replaceHosted && (kind === "proxy" || kind === "direct");
          if (!replace) return { outcome: "already", where: codexFile, via };
          outcome = "replaced";
          current = current.replace(CODEX_BLOCK, "").replace(/\n{3,}/g, "\n\n");
        }
        if (!dryRun) {
          mkdirSync(codexDir, { recursive: true });
          const sep = current && !current.endsWith("\n\n") ? (current.endsWith("\n") ? "\n" : "\n\n") : "";
          writeFileSync(codexFile, current + sep + block);
          if (hosted) protect(codexFile, env.platform);
        }
        return { outcome, where: codexFile, via };
      },
      disconnect: (server) => {
        if (!existsSync(codexFile)) return undefined;
        const current = readFileSync(codexFile, "utf8");
        const existing = current.match(CODEX_BLOCK)?.join("");
        if (!existing) return undefined;
        const { kind, url } = codexKind(existing);
        if (!(kind === "proxy" || (kind === "direct" && url === trimSlash(server)))) return undefined;
        writeFileSync(codexFile, current.replace(CODEX_BLOCK, "").replace(/\n{3,}/g, "\n\n"));
        return codexFile;
      },
    },
    {
      id: "windsurf",
      name: "Windsurf",
      detected: existsSync(join(env.home, ".codeium", "windsurf")),
      reads: "agents-md",
      connect: (dryRun) => jsonServer(env, files.windsurf, "mcpServers", hosted ? { serverUrl: hosted.server, headers } : local, dryRun, mode, via),
      disconnect: (server) => jsonRemove(files.windsurf, "mcpServers", server),
    },
    {
      id: "claude-desktop",
      name: "Claude Desktop",
      detected: existsSync(desktopDir),
      reads: "none",
      // Claude Desktop is a GUI app: it doesn't get the shell's PATH (nvm, Homebrew), so point at npx by absolute path.
      // Its config file can't send headers to a remote server, so it keeps the stdio proxy (token read from credentials.json).
      connect: (dryRun) => jsonServer(env, files.desktop, "mcpServers", desktopCommand(env, hosted ? proxy : local), dryRun, mode, hosted ? "proxy" : undefined),
      disconnect: (server) => jsonRemove(files.desktop, "mcpServers", server),
    },
    {
      id: "gemini",
      name: "Gemini CLI",
      // Only the CLI counts: other Google tools (Gemini Code Assist) also create ~/.gemini.
      detected: env.has("gemini"),
      reads: "agents-md",
      connect: (dryRun) => jsonServer(env, files.gemini, "mcpServers", hosted ? { httpUrl: hosted.server, headers } : local, dryRun, mode, via),
      disconnect: (server) => jsonRemove(files.gemini, "mcpServers", server),
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
  const pick = (mode: Mode) => {
    const all = agents(env, mode);
    // --only connects what was asked for even if we can't see it installed.
    return only ? all.filter((a) => only!.includes(a.id)) : all.filter((a) => a.detected);
  };
  const localMode: Mode = { kind: "local", replaceHosted: local };
  const chosen = pick(localMode);
  if (!chosen.length) {
    env.log(
      `No coding agents found. Pick one with --only (${AGENT_IDS.join(", ")}),\n` +
        "or see https://github.com/intelligaia-open-labs/nucleux/tree/main/packages/mcp#readme",
    );
    return 1;
  }
  if (!remote) return connectAgents(env, chosen, { dryRun, noProject, mode: localMode });
  return signIn(env, code!, dryRun).then((creds) => {
    if (!creds) return 1;
    const mode: Mode = { kind: "hosted", server: creds.server, token: creds.token };
    return connectAgents(env, pick(mode), { dryRun, noProject, mode });
  });
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

/**
 * Exchanges the one-time code for the user's token and saves it (0600).
 * On --dry-run it spends nothing and writes nothing (the returned token is a placeholder).
 */
async function signIn(env: AddEnv, code: string, dryRun: boolean): Promise<Credentials | undefined> {
  const a = authEnv(env);
  const file = credentialsPath(a);
  if (dryRun) {
    env.log(`Dry run — nothing is changed.\nWould sign in with code ${code} and save the token to ${file}.`);
    const server = (a.vars.NUCLEUX_MCP_URL || DEFAULT_SERVER).replace(/\/+$/, "");
    return { server, token: "nx_dry_run" };
  }
  try {
    const creds = await exchangeCode(a, code);
    writeCredentials(a, creds);
    env.log(`Signed in to ${creds.server} as ${who(creds)}. Token saved to ${file} (readable only by you).`);
    return creds;
  } catch (err) {
    if (!(err instanceof AuthError)) throw err;
    env.log(err.message);
    return undefined;
  }
}

function connectAgents(env: AddEnv, chosen: Agent[], o: { dryRun: boolean; noProject: boolean; mode: Mode }): number {
  const { dryRun, noProject, mode } = o;
  const remote = mode.kind === "hosted";
  const pad = Math.max(...chosen.map((a) => a.name.length));
  env.log(`${dryRun && !remote ? "Dry run — nothing is changed.\n" : ""}Found: ${chosen.map((a) => a.name).join(", ")}`);
  const manual: string[] = [];
  const restart: string[] = [];
  const replaced: string[] = [];
  const server = mode.kind === "hosted" ? mode.server : "";
  for (const a of chosen) {
    const r = a.connect(dryRun);
    const mark = r.outcome === "manual" ? "!" : "✓";
    const changed = r.outcome === "added" || r.outcome === "replaced";
    const how =
      r.via === "proxy"
        ? `connected to ${server} through \`npx -y @nucleux/mcp remote\` (Claude Desktop's config can't send a token to a remote server)`
        : `connected directly to ${server}`;
    const what = !changed
      ? r.outcome === "already"
        ? "already connected"
        : "needs one step"
      : remote
        ? `${dryRun ? "would be " : ""}${how}${r.outcome === "replaced" ? " (replaced the previous nucleux entry)" : ""}`
        : r.outcome === "added"
          ? dryRun ? "would connect Nucleux" : "Nucleux connected"
          : dryRun ? "would replace the hosted server with the local one" : "hosted server replaced by the local one";
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
        ? `  (Replaced the nucleux entry in ${replaced.join(", ")}; other servers and settings are untouched.)`
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

  if (remote && !dryRun && chosen.some((a) => a.id !== "claude-desktop")) {
    env.log(`  (Your token is in each agent's MCP config, readable only by you. Revoke it at https://nucleux.in/mcp/connect.)`);
  }
  if (manual.length) env.log(`\nOne step left:\n${manual.join("\n")}`);
  env.log(
    `\n${dryRun ? "Run it without --dry-run to apply." : "Done."}` +
      (restart.length && !dryRun ? ` Restart ${restart.join(", ")}.` : "") +
      ` Then ask your agent: "Build a settings page with Nucleux".`,
  );
  return manual.length ? 2 : 0;
}

/**
 * `nucleux-mcp logout`: revoke the saved token on the server (best effort), delete the
 * credentials file, and remove the hosted `nucleux` entries from every agent.
 */
export async function runLogout(args: string[], env: AddEnv = defaultEnv()): Promise<number> {
  if (args.length) {
    console.error("Usage: npx -y @nucleux/mcp logout");
    return 1;
  }
  const a = authEnv(env);
  const server = ((a.vars.NUCLEUX_MCP_URL || readCredentials(a)?.server || DEFAULT_SERVER) as string).replace(/\/+$/, "");
  await forgetCredentials(a);
  const removed: string[] = [];
  for (const agent of agents(env, { kind: "local", replaceHosted: false })) {
    const where = agent.disconnect(server);
    if (where) removed.push(`  ✓ ${agent.name}: removed the hosted nucleux entry — ${where}`);
  }
  if (removed.length) {
    env.log(removed.join("\n"));
    env.log("For the open local catalog (no account), run: npx -y @nucleux/mcp add");
  }
  return 0;
}
