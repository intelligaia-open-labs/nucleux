// Test harness: the real app on an ephemeral port, an in-memory database,
// fake upstreams (no child process) and a fake sign-in provider (no network).

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

// Profiles keyed by the `code` the fake provider "returns".
export const PROFILES = {
  alice: { providerId: "1", email: "alice@example.com", name: "Alice Doe", avatar: null },
  bob: { providerId: "2", email: "bob@other.org", name: "Bob", avatar: null },
  admin: { providerId: "3", email: "root@example.com", name: "Root", avatar: null },
};

export const fakeProvider = {
  id: "fake",
  label: "Fake",
  authorizeUrl: ({ state, redirectUri }) =>
    `https://provider.test/authorize?${new URLSearchParams({ state, redirect_uri: redirectUri })}`,
  profile: async ({ code }) => {
    if (!PROFILES[code]) throw new Error("bad code");
    return PROFILES[code];
  },
};

export async function startServer(env = {}, { limits, upstream = fakeUpstream, mobile = null, mailer = null } = {}) {
  const clock = { t: Date.UTC(2026, 9, 22, 12, 0, 0) };
  const config = loadConfig({
    NUCLEUX_PUBLIC_URL: "https://nucleux.test/mcp",
    NUCLEUX_SESSION_SECRET: "test-secret",
    NUCLEUX_ADMINS: "root@example.com",
    ...env,
  });
  const db = openDb(":memory:");
  const store = createStore(db, { now: () => clock.t });
  const app = createApp({ config, store, upstream, mobile, providers: { fake: fakeProvider }, mailer, limits });
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

// Runs the full sign-in round trip; returns a browser-like helper.
export async function signIn(srv, who = "alice", next) {
  const qs = new URLSearchParams({ provider: "fake" });
  if (next) qs.set("next", next);
  const start = await fetch(`${srv.url}/auth/login?${qs}`, { redirect: "manual" });
  if (start.status !== 302) throw new Error(`login start ${start.status}`);
  const state = new URL(start.headers.get("location")).searchParams.get("state");
  const nonce = cookieValue(start, "nx_login");
  const cb = await fetch(`${srv.url}/auth/callback/fake?code=${who}&state=${encodeURIComponent(state)}`, {
    redirect: "manual",
    headers: { cookie: `nx_login=${nonce}` },
  });
  const session = cookieValue(cb, "nx_session");
  return {
    status: cb.status,
    location: cb.headers.get("location"),
    setCookie: cb.headers.getSetCookie(),
    session,
    get: (path) => fetch(`${srv.url}${path}`, { redirect: "manual", headers: { cookie: `nx_session=${session}` } }),
    post: (path, form, headers = {}) =>
      fetch(`${srv.url}${path}`, {
        method: "POST",
        redirect: "manual",
        headers: { cookie: `nx_session=${session}`, "content-type": "application/x-www-form-urlencoded", ...headers },
        body: new URLSearchParams(form),
      }),
  };
}

export const csrfFrom = (html) => /name="_csrf" value="([^"]+)"/.exec(html)?.[1];

export async function newCliCode(browser) {
  const page = await (await browser.get("/connect")).text();
  const res = await browser.post("/connect/code", { _csrf: csrfFrom(page) });
  const html = await res.text();
  const m = /add --code ([A-Z0-9]{4}-[A-Z0-9]{4})/.exec(html);
  if (!m) throw new Error(`no code in page (${res.status})`);
  return m[1];
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

// Captures sign-in emails instead of sending them. `fail = true` makes send throw.
export function fakeMailer() {
  const sent = [];
  const mailer = {
    sent,
    fail: false,
    async send(message) {
      if (mailer.fail) throw Object.assign(new Error("smtp down"), { code: "ECONNECTION" });
      sent.push(message);
    },
    last: () => sent.at(-1),
    codeOf: (m = sent.at(-1)) => /code is: (\d{6})/.exec(m.text)[1],
    linkOf: (m = sent.at(-1)) => /^(https:\/\/\S+\/auth\/email\/link\?t=\S+)$/m.exec(m.text)[1],
  };
  return mailer;
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
