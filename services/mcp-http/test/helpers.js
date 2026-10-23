// Test harness: the real app on an ephemeral port, an in-memory database,
// fake upstreams (no child process); no network.

import crypto from "node:crypto";
import { loadConfig } from "../src/config.js";
import { openDb } from "../src/db.js";
import { createStore } from "../src/store.js";
import { createApp } from "../src/app.js";

export const fakeUpstream = {
  version: "0.0.0-test",
  instructions: async () => "test instructions",
  listTools: async () => [
    { name: "echo", description: "echo", inputSchema: { type: "object" } },
    { name: "fail", description: "fail", inputSchema: { type: "object" } },
  ],
  callTool: async (name, args) =>
    name === "fail"
      ? { isError: true, content: [{ type: "text", text: "nope" }] }
      : { content: [{ type: "text", text: JSON.stringify(args) }] },
};

// Fakes shaped like the real upstreams' shared tools (schemas as the packages
// publish them), for the web + mobile merge. Every call is recorded.
const str = (description) => ({ type: "string", description });
const MOBILE_FW = { type: "string", enum: ["swiftui", "compose", "flutter", "react-native"], description: "mobile framework" };
const reply = (text, isError) => ({ content: [{ type: "text", text }], ...(isError ? { isError: true } : {}) });

export function fakeWebUpstream() {
  const calls = [];
  return {
    calls,
    version: "0.0.0-web",
    instructions: async () => "WEB INSTRUCTIONS",
    listTools: async () => [
      { name: "list_components", description: "web list", inputSchema: { type: "object", properties: { kind: { type: "string", enum: ["component", "infrastructure", "all"], description: "web kinds" } } } },
      { name: "get_component", description: "web get", inputSchema: { type: "object", properties: { name: str("name"), framework: { type: "string", enum: ["react", "html"], description: "react or html" }, template: { type: "boolean" } }, required: ["name"] } },
      { name: "search_components", description: "web search", inputSchema: { type: "object", properties: { query: str("query") }, required: ["query"] } },
      { name: "get_setup", description: "web setup", inputSchema: { type: "object", properties: { framework: { type: "string", enum: ["react", "html"] }, packageManager: { type: "string", enum: ["npm", "pnpm"] } } } },
      { name: "list_examples", description: "web examples", inputSchema: { type: "object", properties: {} } },
      { name: "get_example", description: "web example", inputSchema: { type: "object", properties: { name: str("name") }, required: ["name"] } },
      { name: "search_patterns", description: "web patterns", inputSchema: { type: "object", properties: { query: str("query") }, required: ["query"] } },
    ],
    callTool: async (name, args) => {
      calls.push({ name, args });
      if (name === "get_component" && !["Button", "InitialCta"].includes(args.name)) return reply(`Nucleux has no "${args.name}". Use list_components.`);
      if (name === "list_components") return reply("WEB LIST: Button, InitialCta");
      if (name === "search_components") return reply(`WEB SEARCH ${args.query}`);
      return reply(`WEB ${name} ${JSON.stringify(args)}`);
    },
  };
}

export function fakeMobileUpstream() {
  const calls = [];
  return {
    calls,
    available: true,
    info: async () => ({ version: "0.1.0", components: 2 }),
    instructions: async () => "MOBILE INSTRUCTIONS",
    listTools: async () => [
      { name: "list_components", description: "mobile list", inputSchema: { type: "object", properties: { framework: MOBILE_FW, kind: { type: "string", enum: ["component", "pattern", "foundation", "all"], description: "mobile kinds" } } } },
      { name: "get_component", description: "mobile get", inputSchema: { type: "object", properties: { name: str("name"), framework: MOBILE_FW }, required: ["name"] } },
      { name: "search_components", description: "mobile search", inputSchema: { type: "object", properties: { query: str("query"), framework: MOBILE_FW }, required: ["query"] } },
      { name: "get_setup", description: "mobile setup", inputSchema: { type: "object", properties: { framework: MOBILE_FW } } },
      { name: "list_examples", description: "mobile examples", inputSchema: { type: "object", properties: { framework: MOBILE_FW } } },
      { name: "get_example", description: "mobile example", inputSchema: { type: "object", properties: { name: str("name"), framework: MOBILE_FW }, required: ["name"] } },
      { name: "get_mobile_spec", description: "spec", inputSchema: { type: "object", properties: { name: str("name") }, required: ["name"] } },
      { name: "get_mobile_words", description: "words", inputSchema: { type: "object", properties: { name: str("name"), framework: MOBILE_FW }, required: ["name"] } },
      { name: "validate_mobile_usage", description: "validate", inputSchema: { type: "object", properties: { framework: MOBILE_FW, code: str("code") }, required: ["framework", "code"] } },
    ],
    callTool: async (name, args) => {
      calls.push({ name, args });
      if (name === "list_components") {
        return reply(
          "Nucleux Mobile 0.1.0 — 2 components and patterns.\n\n" +
            "- **PromptComposer** (`prompt-composer`, Component) — the composer — SwiftUI Done\n" +
            "- **Initial CTA** (`initial-cta`, Pattern) — the empty state — SwiftUI Done\n\nAsk which framework."
        );
      }
      if (name === "get_component") {
        const known = { promptcomposer: "PromptComposer (`prompt-composer`, Component)", initialcta: "Initial CTA (`initial-cta`, Pattern)" };
        const hit = known[String(args.name).toLowerCase()];
        if (!hit) return reply(`No Nucleux Mobile component named "${args.name}".`, true);
        return reply(`# ${hit} — Nucleux Mobile\n\nMOBILE ${args.name} ${args.framework ?? "all"}`);
      }
      if (name === "search_components") return reply(`MOBILE SEARCH ${args.query}`);
      return reply(`MOBILE ${name} ${JSON.stringify(args)}`);
    },
  };
}

export async function startServer(env = {}, { limits, upstream = fakeUpstream, mobile = null } = {}) {
  const clock = { t: Date.UTC(2026, 9, 22, 12, 0, 0) };
  const config = loadConfig({
    NUCLEUX_PUBLIC_URL: "https://nucleux.test/mcp",
    NUCLEUX_SESSION_SECRET: "test-secret",
    NUCLEUX_ADMIN_PASSWORD: "admin-secret",
    ...env,
  });
  const db = openDb(":memory:");
  const store = createStore(db, { now: () => clock.t });
  const app = createApp({ config, store, upstream, mobile, limits });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  const url = `http://127.0.0.1:${server.address().port}`;
  return {
    url,
    db,
    store,
    config,
    clock,
    advance: (ms) => (clock.t += ms),
    close: () =>
      new Promise((r) => {
        server.closeAllConnections?.();
        server.close(r);
        db.close();
      }),
  };
}

// Server sees paths without the /mcp prefix; strip it from Location headers.
export const local = (srv, location) => {
  const u = new URL(location, srv.config.base);
  return u.pathname.replace(/^\/mcp/, "") + u.search;
};

const cookieValue = (res, name) => {
  for (const c of res.headers.getSetCookie()) {
    const [pair] = c.split(";");
    const i = pair.indexOf("=");
    if (pair.slice(0, i) === name) return decodeURIComponent(pair.slice(i + 1));
  }
  return undefined;
};

export const csrfFrom = (html) => /name="_csrf" value="([^"]+)"/.exec(html)?.[1];

// What the site's MCP page does: POST with our Origin.
export const issue = (srv, path, origin = srv.config.origin) =>
  fetch(`${srv.url}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(origin ? { origin } : {}) },
    body: "{}",
  });

/** A fresh one-time connect code from POST /tokens/prompt. */
export async function newCliCode(srv) {
  const res = await issue(srv, "/tokens/prompt");
  if (res.status !== 200) throw new Error(`/tokens/prompt ${res.status}`);
  return (await res.json()).code;
}

/** A fresh bearer token from POST /tokens. */
export async function newToken(srv) {
  const res = await issue(srv, "/tokens");
  if (res.status !== 200) throw new Error(`/tokens ${res.status}`);
  return (await res.json()).token;
}

export const exchange = (srv, code, label = "test-host") =>
  fetch(`${srv.url}/cli/exchange`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, label }),
  });

export function pkce() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

// Minimal JSON-RPC call against the MCP endpoint; parses JSON or SSE.
export async function rpc(srv, method, params = {}, token) {
  const headers = { "content-type": "application/json", accept: "application/json, text/event-stream" };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${srv.url}/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const text = await res.text();
  let body;
  if (text.startsWith("{")) body = JSON.parse(text);
  else {
    const data = text.split("\n").find((l) => l.startsWith("data: "));
    body = data ? JSON.parse(data.slice(6)) : null;
  }
  return { status: res.status, headers: res.headers, body };
}

// A browser with a cookie jar (cookies are keyed by name; paths are ignored).
export function browser(srv) {
  const jar = new Map();
  const store = (res) => {
    for (const c of res.headers.getSetCookie()) {
      const [pair, ...attrs] = c.split(";");
      const i = pair.indexOf("=");
      const name = pair.slice(0, i).trim();
      const value = pair.slice(i + 1);
      if (attrs.some((a) => /max-age=0\b/i.test(a.trim())) || value === "") jar.delete(name);
      else jar.set(name, value);
    }
    return res;
  };
  const cookie = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
  return {
    jar,
    get: async (path, headers = {}) => store(await fetch(srv.url + path, { redirect: "manual", headers: { cookie: cookie(), ...headers } })),
    post: async (path, form, headers = {}) =>
      store(
        await fetch(srv.url + path, {
          method: "POST",
          redirect: "manual",
          headers: { cookie: cookie(), "content-type": "application/x-www-form-urlencoded", ...headers },
          body: new URLSearchParams(form),
        })
      ),
  };
}
