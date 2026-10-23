import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, hostname } from "node:os";
import { dirname, join } from "node:path";

/** The hosted server. `NUCLEUX_MCP_URL` overrides it (staging, tests). */
export const DEFAULT_SERVER = "https://nucleux.in/mcp";
export const CONNECT_URL = "https://nucleux.in/mcp/connect";
export const SIGN_IN_HINT = `Run \`npx -y @nucleux/mcp add --code …\` with the line from ${CONNECT_URL}`;

export interface Credentials {
  server: string;
  token: string;
  email?: string;
  name?: string;
  created?: string;
}

/** What the auth commands need from the machine; tests pass their own. */
export interface AuthEnv {
  home: string;
  platform: NodeJS.Platform;
  /** %APPDATA% on Windows. */
  appData?: string;
  /** process.env (NUCLEUX_MCP_URL, NUCLEUX_TOKEN). */
  vars: Record<string, string | undefined>;
  fetch: typeof fetch;
  hostname: () => string;
  log: (line: string) => void;
}

export function defaultAuthEnv(): AuthEnv {
  return {
    home: homedir(),
    platform: process.platform,
    appData: process.env.APPDATA,
    vars: process.env,
    fetch: (...a) => fetch(...a),
    hostname,
    log: (line) => console.log(line),
  };
}

const trimSlash = (url: string) => url.replace(/\/+$/, "");

/** `~/.config/nucleux/credentials.json` (Windows: `%APPDATA%\nucleux\credentials.json`). */
export function credentialsPath(env: Pick<AuthEnv, "home" | "platform" | "appData">): string {
  if (env.platform === "win32") return join(env.appData ?? join(env.home, "AppData", "Roaming"), "nucleux", "credentials.json");
  return join(env.home, ".config", "nucleux", "credentials.json");
}

export function readCredentials(env: Pick<AuthEnv, "home" | "platform" | "appData">): Credentials | undefined {
  const file = credentialsPath(env);
  if (!existsSync(file)) return undefined;
  try {
    const data = JSON.parse(readFileSync(file, "utf8"));
    return typeof data?.token === "string" && data.token ? (data as Credentials) : undefined;
  } catch {
    return undefined;
  }
}

/** Writes the credentials file readable by this user only (0600, directory 0700). */
export function writeCredentials(env: Pick<AuthEnv, "home" | "platform" | "appData">, creds: Credentials): string {
  const file = credentialsPath(env);
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  writeFileSync(file, JSON.stringify(creds, null, 2) + "\n", { mode: 0o600 });
  // `mode` only applies when the file is created; tighten an existing one too.
  if (env.platform !== "win32") chmodSync(file, 0o600);
  return file;
}

/** The server and token to use: env overrides the credentials file. */
export function resolveAuth(env: Pick<AuthEnv, "home" | "platform" | "appData" | "vars">): { server: string; token?: string; from: "env" | "file" | "none" } {
  const creds = readCredentials(env);
  const server = trimSlash(env.vars.NUCLEUX_MCP_URL || creds?.server || DEFAULT_SERVER);
  if (env.vars.NUCLEUX_TOKEN) return { server, token: env.vars.NUCLEUX_TOKEN, from: "env" };
  if (creds) return { server, token: creds.token, from: "file" };
  return { server, from: "none" };
}

/** Accepts `abcd2345`, `ABCD-2345`, ` abcd-2345 `; returns `ABCD-2345`, or undefined if it isn't a connect code. */
export function normalizeCode(raw: string): string | undefined {
  const c = raw.trim().toUpperCase().replace(/[\s-]/g, "");
  return /^[A-Z0-9]{8}$/.test(c) ? `${c.slice(0, 4)}-${c.slice(4)}` : undefined;
}

export class AuthError extends Error {}

/** `POST {server}/cli/exchange` → the user's long-lived token. */
export async function exchangeCode(env: AuthEnv, code: string): Promise<Credentials> {
  const server = trimSlash(env.vars.NUCLEUX_MCP_URL || DEFAULT_SERVER);
  let res: Response;
  try {
    res = await env.fetch(`${server}/cli/exchange`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ code, label: env.hostname() }),
    });
  } catch (err) {
    throw new AuthError(`Couldn't reach ${server} (${(err as Error).message}). Check your connection and try again.`);
  }
  const body = (await res.json().catch(() => ({}))) as { token?: string; email?: string; name?: string; error?: string };
  if (res.status === 400 && body.error === "invalid_code") {
    throw new AuthError(`That code is unknown, expired or already used. Get a new line from ${CONNECT_URL} (codes work once, for 10 minutes).`);
  }
  if (res.status === 429) throw new AuthError("Too many attempts. Wait a minute and try again.");
  if (!res.ok || typeof body.token !== "string" || !body.token.startsWith("nx_")) {
    throw new AuthError(`${server} couldn't exchange the code (HTTP ${res.status}). Try again with a new line from ${CONNECT_URL}.`);
  }
  return { server, token: body.token, email: body.email, name: body.name, created: new Date().toISOString() };
}

/** `GET {server}/cli/whoami` → `{ email, name }`, or undefined on 401. */
export async function fetchWhoami(env: AuthEnv, server: string, token: string): Promise<{ email?: string; name?: string } | undefined> {
  const res = await env.fetch(`${server}/cli/whoami`, { headers: { authorization: `Bearer ${token}`, accept: "application/json" } });
  if (res.status === 401) return undefined;
  if (!res.ok) throw new AuthError(`${server} answered HTTP ${res.status}.`);
  return (await res.json()) as { email?: string; name?: string };
}

export const who = (c: { email?: string; name?: string }) =>
  c.name && c.email ? `${c.name} <${c.email}>` : c.email || c.name || "your account";

/** `nucleux-mcp whoami`. */
export async function runWhoami(args: string[], env: AuthEnv = defaultAuthEnv()): Promise<number> {
  if (args.length) {
    console.error("Usage: npx -y @nucleux/mcp whoami");
    return 1;
  }
  const { server, token, from } = resolveAuth(env);
  if (!token) {
    env.log(`Not signed in. ${SIGN_IN_HINT}`);
    return 1;
  }
  try {
    const me = await fetchWhoami(env, server, token);
    if (!me) {
      env.log(`The ${from === "env" ? "NUCLEUX_TOKEN" : "saved"} token was rejected (revoked or expired). ${SIGN_IN_HINT}`);
      return 1;
    }
    env.log(`Signed in to ${server} as ${who(me)}${from === "env" ? " (token from NUCLEUX_TOKEN)" : ""}.`);
    return 0;
  } catch (err) {
    env.log(err instanceof AuthError ? err.message : `Couldn't reach ${server} (${(err as Error).message}).`);
    return 1;
  }
}

/** `POST {server}/cli/revoke`: "revoked", "rejected" (401: already revoked/unknown) or "failed" (offline, other errors). */
export async function revokeToken(env: AuthEnv, server: string, token: string): Promise<"revoked" | "rejected" | "failed"> {
  try {
    const res = await env.fetch(`${server}/cli/revoke`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, accept: "application/json" },
    });
    if (res.status === 401) return "rejected";
    const body = (await res.json().catch(() => ({}))) as { revoked?: boolean };
    return res.ok && body.revoked === true ? "revoked" : "failed";
  } catch {
    return "failed";
  }
}

/** Revokes the saved token on the server (best effort), then deletes the credentials file. Used by `logout`. */
export async function forgetCredentials(env: AuthEnv): Promise<void> {
  const file = credentialsPath(env);
  const creds = readCredentials(env);
  if (creds) {
    const server = trimSlash(env.vars.NUCLEUX_MCP_URL || creds.server || DEFAULT_SERVER);
    const r = await revokeToken(env, server, creds.token);
    env.log(
      r === "revoked"
        ? `Revoked the token on ${server}.`
        : r === "rejected"
          ? `The server no longer accepts this token (already revoked or expired).`
          : `Couldn't revoke the token on ${server} (offline?). Revoke it at ${CONNECT_URL}.`,
    );
  }
  if (existsSync(file)) {
    rmSync(file);
    env.log(`Signed out: removed ${file}.`);
  } else {
    env.log("Not signed in on this machine (no credentials file).");
  }
  if (env.vars.NUCLEUX_TOKEN) env.log("Note: NUCLEUX_TOKEN is set in your environment and still applies.");
}
