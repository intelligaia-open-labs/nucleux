// Test harness: the real app on an ephemeral port, an in-memory database, a
// fake upstream (no child process) and a fake sign-in provider (no network).

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

export async function startServer(env = {}, { limits } = {}) {
  const clock = { t: Date.UTC(2026, 9, 22, 12, 0, 0) };
  const config = loadConfig({
    NUCLEUX_PUBLIC_URL: "https://nucleux.test/mcp",
    NUCLEUX_SESSION_SECRET: "test-secret",
    NUCLEUX_ADMINS: "root@example.com",
    ...env,
  });
  const db = openDb(":memory:");
  const store = createStore(db, { now: () => clock.t });
  const app = createApp({ config, store, upstream: fakeUpstream, providers: { fake: fakeProvider }, limits });
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
