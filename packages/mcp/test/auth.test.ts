import { createServer as createHttpServer, type IncomingMessage, type Server as HttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { runAdd, type AddEnv } from "../src/add";
import { credentialsPath, normalizeCode, resolveAuth, runLogout, runWhoami, writeCredentials, type AuthEnv } from "../src/auth";
import { createRemoteProxy } from "../src/remote";

const TOKEN = "nx_" + "A1b2C3d4E5".repeat(4);
const CODE = "ABCD2345";

/** A fake nucleux.in/mcp: nginx-style `/mcp` prefix, the CLI endpoints, and a bearer-gated MCP endpoint. */
let http: HttpServer;
let base: string;
let validTokens: Set<string>;
let usedCodes: Set<string>;
let exchanges: Array<{ code: string; label: string }>;
let mcpAuth: string[];
let revokes: string[];

const body = (req: IncomingMessage) =>
  new Promise<string>((resolve) => {
    let s = "";
    req.on("data", (c) => (s += c));
    req.on("end", () => resolve(s));
  });

function fakeMcp() {
  const s = new McpServer({ name: "nucleux-hosted", version: "9.9.9" }, { instructions: "Hosted Nucleux instructions." });
  s.tool("list_components", "List components", {}, async () => ({ content: [{ type: "text", text: "Button, Card" }] }));
  s.tool("echo", "Echo", { text: z.string() }, async ({ text }) => ({ content: [{ type: "text", text: `echo:${text}` }] }));
  return s;
}

beforeAll(async () => {
  http = createHttpServer(async (req, res) => {
    const json = (status: number, data: unknown, headers: Record<string, string> = {}) => {
      res.writeHead(status, { "content-type": "application/json", ...headers });
      res.end(JSON.stringify(data));
    };
    const url = new URL(req.url!, "http://x");
    if (!url.pathname.startsWith("/mcp")) return json(404, {});
    const path = url.pathname.slice(4) || "/";
    const bearer = (req.headers.authorization ?? "").replace(/^Bearer /, "");
    if (path === "/cli/exchange" && req.method === "POST") {
      const { code, label } = JSON.parse(await body(req));
      exchanges.push({ code, label });
      const c = String(code).replace("-", "").toUpperCase();
      if (c !== CODE || usedCodes.has(c)) return json(400, { error: "invalid_code" });
      usedCodes.add(c);
      return json(200, { token: TOKEN, email: "ada@example.com", name: "Ada" });
    }
    if (path === "/cli/revoke" && req.method === "POST") {
      revokes.push(bearer);
      if (!validTokens.has(bearer)) return json(401, { error: "unauthorized" });
      validTokens.delete(bearer);
      return json(200, { revoked: true });
    }
    if (path === "/cli/whoami") {
      return validTokens.has(bearer) ? json(200, { email: "ada@example.com", name: "Ada" }) : json(401, { error: "unauthorized" });
    }
    if (path === "/") {
      mcpAuth.push(req.headers.authorization ?? "");
      const parsed = req.method === "POST" ? JSON.parse(await body(req)) : undefined;
      if (!validTokens.has(bearer)) {
        return json(
          401,
          { jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" }, id: null },
          { "www-authenticate": `Bearer resource_metadata="${base}/.well-known/oauth-protected-resource"` },
        );
      }
      if (req.method !== "POST") return json(405, {});
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
      const server = fakeMcp();
      res.on("close", () => {
        transport.close();
        server.close();
      });
      await server.connect(transport);
      return transport.handleRequest(req, res, parsed);
    }
    json(404, {});
  });
  await new Promise<void>((r) => http.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(http.address() as AddressInfo).port}/mcp`;
});
afterAll(() => new Promise<void>((r) => http.close(() => r())));

let home: string;
let cwd: string;
let out: string[];
let runs: string[][];
let fetches: number;

const vars = () => ({ NUCLEUX_MCP_URL: base });
const env = (over: Partial<AddEnv> = {}): AddEnv => ({
  home,
  cwd,
  platform: "darwin",
  has: () => false,
  run: (cmd, args) => {
    runs.push([cmd, ...args]);
    if (args[1] === "get") return runs.some((r) => r[2] === "add") ? 0 : 1;
    return 0;
  },
  log: (line) => out.push(line),
  vars: vars(),
  fetch: (...a) => {
    fetches++;
    return fetch(...a);
  },
  hostname: () => "ada-laptop",
  ...over,
});
const authEnv = (over: Partial<AuthEnv> = {}): AuthEnv => ({
  home,
  platform: "darwin",
  vars: vars(),
  fetch: (...a) => fetch(...a),
  hostname: () => "ada-laptop",
  log: (line) => out.push(line),
  ...over,
});
const json = (f: string) => JSON.parse(readFileSync(f, "utf8"));
const credsFile = () => join(home, ".config/nucleux/credentials.json");
const REMOTE = { command: "npx", args: ["-y", "@nucleux/mcp", "remote"] };

beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), "nucleux-auth-home-"));
  cwd = mkdtempSync(join(tmpdir(), "nucleux-auth-app-"));
  out = [];
  runs = [];
  fetches = 0;
  validTokens = new Set([TOKEN]);
  usedCodes = new Set();
  exchanges = [];
  mcpAuth = [];
  revokes = [];
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  rmSync(home, { recursive: true, force: true });
  rmSync(cwd, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("add --code", () => {
  it("exchanges the code, saves the token 0600, and points every agent at `remote` without the token", async () => {
    mkdirSync(join(home, ".cursor"));
    mkdirSync(join(home, ".codex"));
    mkdirSync(join(home, "Library/Application Support/Code/User"), { recursive: true });

    expect(await runAdd(["--code", "abcd-2345", "--no-project"], env({ has: (c) => c === "claude" }))).toBe(0);

    expect(exchanges).toEqual([{ code: "ABCD-2345", label: "ada-laptop" }]);
    const creds = json(credsFile());
    expect(creds).toMatchObject({ server: base, token: TOKEN, email: "ada@example.com", name: "Ada" });
    expect(new Date(creds.created).toString()).not.toBe("Invalid Date");
    expect(statSync(credsFile()).mode & 0o777).toBe(0o600);
    expect(statSync(join(home, ".config/nucleux")).mode & 0o077).toBe(0);

    expect(runs).toContainEqual(["claude", "mcp", "add", "--scope", "user", "nucleux", "--", "npx", "-y", "@nucleux/mcp", "remote"]);
    expect(json(join(home, ".cursor/mcp.json")).mcpServers.nucleux).toEqual(REMOTE);
    expect(json(join(home, "Library/Application Support/Code/User/mcp.json")).servers.nucleux).toEqual({ type: "stdio", ...REMOTE });
    expect(readFileSync(join(home, ".codex/config.toml"), "utf8")).toContain('args = ["-y","@nucleux/mcp","remote"]');
    for (const f of [".cursor/mcp.json", "Library/Application Support/Code/User/mcp.json", ".codex/config.toml"]) {
      expect(readFileSync(join(home, f), "utf8")).not.toContain("nx_");
    }
    expect(runs.flat().join(" ")).not.toContain("nx_");
    expect(out.join("\n")).toMatch(/Signed in to .* as Ada <ada@example\.com>/);
    expect(out.join("\n")).not.toContain(TOKEN);
  });

  it("replaces local nucleux entries, keeps everything else, and is idempotent", async () => {
    mkdirSync(join(home, ".cursor"));
    writeFileSync(
      join(home, ".cursor/mcp.json"),
      JSON.stringify({ mcpServers: { other: { command: "x" }, nucleux: { command: "npx", args: ["-y", "@nucleux/mcp"] } }, keep: 1 }),
    );
    mkdirSync(join(home, ".codex"));
    writeFileSync(
      join(home, ".codex/config.toml"),
      'model = "o4"\n\n[mcp_servers.nucleux]\ncommand = "npx"\nargs = ["-y","@nucleux/mcp"]\n\n[mcp_servers.other]\ncommand = "y"\n',
    );
    const output = () => "nucleux:\n  Command: npx\n  Args: -y @nucleux/mcp\n";
    // Claude Code already has a (local) nucleux entry.
    const run = (cmd: string, args: string[]) => (runs.push([cmd, ...args]), 0);

    expect(await runAdd(["--code", CODE, "--no-project"], env({ has: (c) => c === "claude", output, run }))).toBe(0);

    const cursor = json(join(home, ".cursor/mcp.json"));
    expect(cursor.keep).toBe(1);
    expect(cursor.mcpServers.other).toEqual({ command: "x" });
    expect(cursor.mcpServers.nucleux).toEqual(REMOTE);
    const toml = readFileSync(join(home, ".codex/config.toml"), "utf8");
    expect(toml).toContain('model = "o4"');
    expect(toml).toContain('[mcp_servers.other]\ncommand = "y"');
    expect(toml.match(/\[mcp_servers\.nucleux\]/g)).toHaveLength(1);
    expect(toml).toContain('args = ["-y","@nucleux/mcp","remote"]');
    expect(runs).toContainEqual(["claude", "mcp", "remove", "--scope", "user", "nucleux"]);
    expect(out.join("\n")).toMatch(/Cursor\s+local server replaced by the hosted one/);
    expect(out.join("\n")).toMatch(/Replaced the local nucleux entry in Claude Code, Cursor, Codex/);

    // Second run with a fresh code: nothing to change.
    usedCodes.clear();
    out = [];
    const before = [readFileSync(join(home, ".cursor/mcp.json"), "utf8"), toml];
    expect(
      await runAdd(["--code", CODE, "--no-project"], env({ has: (c) => c === "claude", run, output: () => "Args: -y @nucleux/mcp remote" })),
    ).toBe(0);
    expect([readFileSync(join(home, ".cursor/mcp.json"), "utf8"), readFileSync(join(home, ".codex/config.toml"), "utf8")]).toEqual(before);
    expect(out.join("\n")).toMatch(/Cursor\s+already connected/);
    expect(out.join("\n")).toMatch(/Claude Code\s+already connected/);
  });

  it("an unknown, used or malformed code writes nothing", async () => {
    mkdirSync(join(home, ".cursor"));
    expect(await runAdd(["--code", "ZZZZ-9999"], env())).toBe(1);
    expect(out.join("\n")).toMatch(/unknown, expired or already used/);
    expect(existsSync(credsFile())).toBe(false);
    expect(existsSync(join(home, ".cursor/mcp.json"))).toBe(false);

    expect(await runAdd(["--code", CODE, "--no-project"], env())).toBe(0);
    rmSync(join(home, ".cursor/mcp.json"));
    out = [];
    expect(await runAdd(["--code", CODE], env())).toBe(1); // single use
    expect(existsSync(join(home, ".cursor/mcp.json"))).toBe(false);

    fetches = 0;
    expect(runAdd(["--code", "nope"], env())).toBe(1);
    expect(runAdd(["--code"], env())).toBe(1);
    expect(fetches).toBe(0);
  });

  it("--dry-run neither spends the code nor writes anything", async () => {
    mkdirSync(join(home, ".cursor"));
    writeFileSync(join(cwd, "package.json"), "{}");
    expect(await runAdd(["--code", CODE, "--dry-run"], env())).toBe(0);
    expect(fetches).toBe(0);
    expect(exchanges).toEqual([]);
    expect(existsSync(join(home, ".config"))).toBe(false);
    expect(existsSync(join(home, ".cursor/mcp.json"))).toBe(false);
    expect(existsSync(join(cwd, "AGENTS.md"))).toBe(false);
    expect(out.join("\n")).toMatch(/Would sign in with code ABCD-2345/);
    expect(out.join("\n")).toMatch(/would connect the hosted Nucleux server/);
  });

  it("doesn't spend the code when no agent is found", async () => {
    expect(await runAdd(["--code", CODE], env())).toBe(1);
    expect(exchanges).toEqual([]);
  });

  it("uses %APPDATA% for credentials and cmd /c on Windows", async () => {
    const appData = join(home, "AppData/Roaming");
    mkdirSync(join(appData, "Claude"), { recursive: true });
    expect(await runAdd(["--code", CODE, "--no-project"], env({ platform: "win32", appData }))).toBe(0);
    expect(json(join(appData, "nucleux/credentials.json")).token).toBe(TOKEN);
    expect(json(join(appData, "Claude/claude_desktop_config.json")).mcpServers.nucleux).toEqual({
      command: "cmd",
      args: ["/c", "npx", "-y", "@nucleux/mcp", "remote"],
    });
  });

  it("--local swaps remote entries back to the local server and keeps the sign-in", async () => {
    mkdirSync(join(home, ".cursor"));
    writeFileSync(join(home, ".cursor/mcp.json"), JSON.stringify({ mcpServers: { other: { command: "x" }, nucleux: REMOTE } }));
    mkdirSync(join(home, ".codex"));
    writeFileSync(
      join(home, ".codex/config.toml"),
      'model = "o4"\n\n[mcp_servers.nucleux]\ncommand = "npx"\nargs = ["-y","@nucleux/mcp","remote"]\n',
    );
    writeCredentials(authEnv(), { server: base, token: TOKEN });
    const run = (cmd: string, args: string[]) => (runs.push([cmd, ...args]), 0);
    let claudeArgs = "Args: -y @nucleux/mcp remote";
    const e = env({ has: (c) => c === "claude", run, output: () => claudeArgs });

    expect(runAdd(["--local", "--no-project"], e)).toBe(0);

    const cursor = json(join(home, ".cursor/mcp.json"));
    expect(cursor.mcpServers).toEqual({ other: { command: "x" }, nucleux: { command: "npx", args: ["-y", "@nucleux/mcp"] } });
    const toml = readFileSync(join(home, ".codex/config.toml"), "utf8");
    expect(toml).toContain('model = "o4"');
    expect(toml.match(/\[mcp_servers\.nucleux\]/g)).toHaveLength(1);
    expect(toml).toContain('args = ["-y","@nucleux/mcp"]\n');
    expect(runs).toContainEqual(["claude", "mcp", "remove", "--scope", "user", "nucleux"]);
    expect(runs).toContainEqual(["claude", "mcp", "add", "--scope", "user", "nucleux", "--", "npx", "-y", "@nucleux/mcp"]);
    expect(out.join("\n")).toMatch(/Cursor\s+hosted server replaced by the local one/);
    expect(out.join("\n")).toMatch(/Replaced the hosted nucleux entry in Claude Code, Cursor, Codex/);
    expect(json(credsFile()).token).toBe(TOKEN);
    expect(fetches).toBe(0);

    // Again: nothing left to change.
    claudeArgs = "Args: -y @nucleux/mcp";
    out = [];
    runs = [];
    expect(runAdd(["--local", "--no-project"], e)).toBe(0);
    expect(readFileSync(join(home, ".codex/config.toml"), "utf8")).toBe(toml);
    expect(runs.some((r) => r[2] === "add" || r[2] === "remove")).toBe(false);
    expect(out.join("\n")).toMatch(/Cursor\s+already connected/);

    expect(runAdd(["--local", "--code", CODE], e)).toBe(1);
  });

  it("without --code stays local and leaves a remote entry alone", () => {
    mkdirSync(join(home, ".cursor"));
    writeFileSync(join(home, ".cursor/mcp.json"), JSON.stringify({ mcpServers: { nucleux: REMOTE } }));
    expect(runAdd(["--no-project"], env())).toBe(0);
    expect(json(join(home, ".cursor/mcp.json")).mcpServers.nucleux).toEqual(REMOTE);
    expect(fetches).toBe(0);
  });
});

describe("credentials", () => {
  it("normalizes codes", () => {
    expect(normalizeCode("abcd2345")).toBe("ABCD-2345");
    expect(normalizeCode(" abcd-2345 ")).toBe("ABCD-2345");
    expect(normalizeCode("abc-2345")).toBeUndefined();
  });

  it("NUCLEUX_TOKEN and NUCLEUX_MCP_URL override the file", () => {
    writeCredentials(authEnv(), { server: "https://nucleux.in/mcp", token: TOKEN });
    expect(resolveAuth(authEnv({ vars: {} }))).toEqual({ server: "https://nucleux.in/mcp", token: TOKEN, from: "file" });
    expect(resolveAuth(authEnv({ vars: { NUCLEUX_TOKEN: "nx_env", NUCLEUX_MCP_URL: "http://x/mcp/" } }))).toEqual({
      server: "http://x/mcp",
      token: "nx_env",
      from: "env",
    });
    rmSync(credsFile());
    expect(resolveAuth(authEnv({ vars: {} }))).toEqual({ server: "https://nucleux.in/mcp", from: "none" });
    expect(credentialsPath({ home, platform: "linux" })).toBe(credsFile());
  });

  it("whoami reports the account, a revoked token, or no sign-in", async () => {
    expect(await runWhoami([], authEnv())).toBe(1);
    expect(out.pop()).toMatch(/Not signed in\. Run `npx -y @nucleux\/mcp add --code …`/);

    writeCredentials(authEnv(), { server: base, token: TOKEN });
    expect(await runWhoami([], authEnv())).toBe(0);
    expect(out.pop()).toBe(`Signed in to ${base} as Ada <ada@example.com>.`);

    validTokens.clear();
    expect(await runWhoami([], authEnv())).toBe(1);
    expect(out.pop()).toMatch(/rejected .*nucleux\.in\/mcp\/connect/);
  });

  it("logout revokes the token on the server, then deletes the credentials file", async () => {
    writeCredentials(authEnv(), { server: base, token: TOKEN });
    expect(await runLogout([], authEnv())).toBe(0);
    expect(revokes).toEqual([TOKEN]);
    expect(validTokens.has(TOKEN)).toBe(false);
    expect(out.join("\n")).toMatch(/Revoked the token on .*\n.*Signed out: removed/);
    expect(existsSync(credsFile())).toBe(false);
    out = [];
    expect(await runLogout([], authEnv())).toBe(0);
    expect(revokes).toHaveLength(1);
    expect(out.pop()).toMatch(/Not signed in/);
  });

  it("logout still deletes the file when the token is already revoked or the server is unreachable", async () => {
    writeCredentials(authEnv(), { server: base, token: "nx_gone" });
    expect(await runLogout([], authEnv())).toBe(0);
    expect(out.join("\n")).toMatch(/no longer accepts this token/);
    expect(existsSync(credsFile())).toBe(false);

    out = [];
    writeCredentials(authEnv(), { server: base, token: TOKEN });
    const offline: typeof fetch = async () => {
      throw new TypeError("fetch failed");
    };
    expect(await runLogout([], authEnv({ fetch: offline }))).toBe(0);
    expect(out.join("\n")).toMatch(/Couldn't revoke the token .*Revoke it at https:\/\/nucleux\.in\/mcp\/connect/);
    expect(existsSync(credsFile())).toBe(false);
  });
});

describe("remote proxy", () => {
  const connect = async (token?: string) => {
    const warnings: string[] = [];
    // The suite runs under jsdom, whose AbortSignal Node's fetch rejects; drop it (only used to cancel on close).
    const nodeFetch: typeof fetch = (url, init) => fetch(url, { ...init, signal: undefined });
    const proxy = await createRemoteProxy({ server: base, token, warn: (l) => warnings.push(l), fetch: nodeFetch });
    const [a, b] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "agent", version: "0" });
    await Promise.all([proxy.connect(b), client.connect(a)]);
    const call = async (name: string, args: Record<string, unknown> = {}) => {
      const r = (await client.callTool({ name, arguments: args })) as { content: Array<{ text: string }>; isError?: boolean };
      return { text: r.content.map((c) => c.text).join("\n"), isError: r.isError === true };
    };
    return { client, call, warnings };
  };

  it("forwards instructions, tools/list and tools/call with the bearer token", async () => {
    const { client, call } = await connect(TOKEN);
    expect(client.getInstructions()).toBe("Hosted Nucleux instructions.");
    expect((await client.listTools()).tools.map((t) => t.name)).toEqual(["list_components", "echo"]);
    expect(await call("echo", { text: "hi" })).toEqual({ text: "echo:hi", isError: false });
    expect(mcpAuth.length).toBeGreaterThan(0);
    expect(mcpAuth.every((h) => h === `Bearer ${TOKEN}`)).toBe(true);
    await client.close();
  });

  it("a rejected token says how to sign in (stderr + tool error) and never falls back to local", async () => {
    const { client, call, warnings } = await connect("nx_revoked");
    expect(warnings.join("\n")).toMatch(/rejected the saved token.*add --code.*nucleux\.in\/mcp\/connect/);
    expect(client.getInstructions()).toMatch(/not connected/);
    const tools = (await client.listTools()).tools.map((t) => t.name);
    expect(tools).toEqual(["nucleux_sign_in"]);
    const r = await call("list_components");
    expect(r.isError).toBe(true);
    expect(r.text).toMatch(/Run `npx -y @nucleux\/mcp add --code …` with the line from https:\/\/nucleux\.in\/mcp\/connect/);
    await client.close();
  });

  it("no token: same message, no network", async () => {
    const { client, call, warnings } = await connect(undefined);
    expect(mcpAuth).toEqual([]);
    expect(warnings.join("\n")).toMatch(/isn't signed in/);
    expect((await call("echo", { text: "x" })).text).toMatch(/add --code/);
    await client.close();
  });

  it("a token revoked mid-session turns tool calls into the sign-in message", async () => {
    const { client, call } = await connect(TOKEN);
    expect((await call("echo", { text: "a" })).isError).toBe(false);
    validTokens.clear();
    const r = await call("echo", { text: "b" });
    expect(r.isError).toBe(true);
    expect(r.text).toMatch(/rejected the saved token.*add --code/);
    await client.close();
  });
});
