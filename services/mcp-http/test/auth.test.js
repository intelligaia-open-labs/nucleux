import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  startServer,
  signIn,
  csrfFrom,
  newCliCode,
  exchange,
  pkce,
  rpc,
  local,
} from "./helpers.js";

const INIT = { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "1" } };

describe("discovery documents", () => {
  let srv;
  before(async () => (srv = await startServer()));
  after(() => srv.close());

  for (const path of ["/.well-known/oauth-protected-resource", "/.well-known/oauth-protected-resource/mcp"]) {
    test(`GET ${path}`, async () => {
      const res = await fetch(srv.url + path);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get("access-control-allow-origin"), "*");
      assert.deepEqual(
        { ...(await res.json()), resource_name: undefined, resource_documentation: undefined },
        {
          resource: "https://nucleux.test/mcp",
          authorization_servers: ["https://nucleux.test/mcp"],
          bearer_methods_supported: ["header"],
          scopes_supported: ["mcp"],
          resource_name: undefined,
          resource_documentation: undefined,
        }
      );
    });
  }

  for (const path of [
    "/.well-known/oauth-authorization-server",
    "/.well-known/oauth-authorization-server/mcp",
    "/.well-known/openid-configuration",
    "/.well-known/openid-configuration/mcp",
  ]) {
    test(`GET ${path}`, async () => {
      const m = await (await fetch(srv.url + path)).json();
      assert.equal(m.issuer, "https://nucleux.test/mcp");
      assert.equal(m.authorization_endpoint, "https://nucleux.test/mcp/oauth/authorize");
      assert.equal(m.token_endpoint, "https://nucleux.test/mcp/oauth/token");
      assert.equal(m.registration_endpoint, "https://nucleux.test/mcp/oauth/register");
      assert.equal(m.revocation_endpoint, "https://nucleux.test/mcp/oauth/revoke");
      assert.deepEqual(m.response_types_supported, ["code"]);
      assert.deepEqual(m.grant_types_supported, ["authorization_code", "refresh_token"]);
      assert.deepEqual(m.code_challenge_methods_supported, ["S256"]);
      assert.deepEqual(m.token_endpoint_auth_methods_supported, ["none", "client_secret_post"]);
      assert.deepEqual(m.scopes_supported, ["mcp"]);
    });
  }

  test("health stays public", async () => {
    const res = await fetch(`${srv.url}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
    assert.deepEqual(body.tools, ["echo", "fail"]);
  });
});

describe("sign-in and pages", () => {
  let srv;
  before(async () => (srv = await startServer({ NUCLEUX_ALLOWED_DOMAINS: "example.com" })));
  after(() => srv.close());

  test("signed-out connect page offers configured providers only", async () => {
    const res = await fetch(`${srv.url}/connect`);
    const html = await res.text();
    assert.equal(res.status, 200);
    assert.match(html, /Connect Nucleux to your coding agent/);
    assert.match(html, /Continue with Fake/);
    assert.doesNotMatch(html, /Continue with Google/);
    assert.match(res.headers.get("content-security-policy"), /frame-ancestors 'none'/);
    assert.equal(res.headers.get("access-control-allow-origin"), null);
  });

  test("callback sets a hardened session cookie and redirects to next", async () => {
    const b = await signIn(srv, "alice", "/connect");
    assert.equal(b.status, 302);
    assert.equal(b.location, "https://nucleux.test/mcp/connect");
    const cookie = b.setCookie.find((c) => c.startsWith("nx_session="));
    assert.match(cookie, /Path=\/mcp/);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /Secure/);
    assert.match(cookie, /SameSite=Lax/);
    assert.match(cookie, /Max-Age=2592000/);
    const page = await (await b.get("/connect")).text();
    assert.match(page, /Signed in as alice@example.com/);
  });

  test("pages keep the Origin header on their own form posts", async () => {
    // With "no-referrer", Chrome sends `Origin: null` on same-origin form posts and
    // the CSRF check rejects every button (Generate, Revoke, Allow, Sign out).
    const b = await signIn(srv, "alice", "/connect");
    const res = await b.get("/connect");
    assert.equal(res.headers.get("referrer-policy"), "same-origin");
  });

  test("next must be same-origin", async () => {
    for (const next of ["//evil.test/x", "https://evil.test/", "/\\evil.test"]) {
      const b = await signIn(srv, "alice", next);
      assert.equal(b.location, "https://nucleux.test/mcp/connect", next);
    }
  });

  test("state is bound to the browser that started sign-in", async () => {
    const start = await fetch(`${srv.url}/auth/login?provider=fake`, { redirect: "manual" });
    const state = new URL(start.headers.get("location")).searchParams.get("state");
    const res = await fetch(`${srv.url}/auth/callback/fake?code=alice&state=${encodeURIComponent(state)}`, {
      redirect: "manual",
      headers: { cookie: "nx_login=someone-else" },
    });
    assert.equal(res.status, 400);
  });

  test("allowlist rejects other domains", async () => {
    const b = await signIn(srv, "bob");
    assert.equal(b.status, 403);
    assert.equal(b.session, undefined);
  });

  test("POST forms need the CSRF token", async () => {
    const b = await signIn(srv);
    assert.equal((await b.post("/connect/code", {})).status, 403);
    assert.equal((await b.post("/connect/code", { _csrf: "wrong" })).status, 403);
    const csrf = csrfFrom(await (await b.get("/connect")).text());
    assert.equal((await b.post("/connect/code", { _csrf: csrf }, { origin: "https://evil.test" })).status, 403);
    assert.equal((await b.post("/connect/code", { _csrf: csrf })).status, 200);
  });

  test("logout ends the session", async () => {
    const b = await signIn(srv);
    const csrf = csrfFrom(await (await b.get("/connect")).text());
    const res = await b.post("/auth/logout", { _csrf: csrf });
    assert.equal(res.status, 303);
    assert.doesNotMatch(await (await b.get("/connect")).text(), /Signed in as/);
  });

  test("admin page is admins-only", async () => {
    const alice = await signIn(srv, "alice");
    assert.equal((await alice.get("/admin")).status, 403);
    const root = await signIn(srv, "admin");
    const res = await root.get("/admin");
    assert.equal(res.status, 200);
    assert.match(await res.text(), /alice@example.com/);
  });

  test("admin disable kills sessions and tokens", async () => {
    const alice = await signIn(srv, "alice");
    const { token } = await (await exchange(srv, await newCliCode(alice))).json();
    const root = await signIn(srv, "admin");
    const csrf = csrfFrom(await (await root.get("/admin")).text());
    const aliceId = srv.db.get("SELECT id FROM users WHERE email = 'alice@example.com'").id;
    assert.equal((await root.post(`/admin/users/${aliceId}/disable`, { _csrf: csrf })).status, 303);
    assert.equal((await fetch(`${srv.url}/cli/whoami`, { headers: { authorization: `Bearer ${token}` } })).status, 401);
    assert.doesNotMatch(await (await alice.get("/connect")).text(), /Signed in as/);
    await root.post(`/admin/users/${aliceId}/enable`, { _csrf: csrf });
  });
});

describe("CLI code exchange", () => {
  let srv, browser;
  before(async () => {
    srv = await startServer();
    browser = await signIn(srv);
  });
  after(() => srv.close());

  test("the connect prompt is self-contained and covers the edge cases", async () => {
    const page = await (await browser.get("/connect")).text();
    const html = await (await browser.post("/connect/code", { _csrf: page.match(/name="_csrf" value="([^"]+)"/)[1] })).text();
    const prompt = html.match(/<pre id="connect-line"[^>]*>([\s\S]*?)<\/pre>/)[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    const code = prompt.match(/add --code ([A-Z0-9]{4}-[A-Z0-9]{4})/)[1];
    for (const needle of [
      `npx -y @nucleux/mcp@latest add --code ${code}`,
      "signed in as alice@example.com",
      "works once and expires 10 minutes",
      "unknown, expired or already used",
      "Node.js 18",
      "HTTPS_PROXY",
      "ask me to run the command myself",
      "--only",
      "--no-project",
      "whoami",
      "restarted",
      "Never print, paste, log or commit it",
      "npx -y @nucleux/mcp logout",
      "first work out the platform from the project",
      "Package.swift or an .xcodeproj is SwiftUI",
      "build.gradle(.kts) with Compose is Jetpack Compose",
      "pubspec.yaml is Flutter",
      "react-native is React Native",
      "pass that framework (swiftui, compose, flutter or react-native)",
      'For web, ask me "Material 3 or shadcn?"',
      "Ask me only what you can't tell from the project",
      '"Nucleux platform: SwiftUI"',
    ]) {
      assert.ok(prompt.includes(needle), `prompt mentions ${needle}`);
    }
    assert.doesNotMatch(prompt, /nx_[0-9A-Za-z]{10}/, "the prompt carries the one-time code, never a token");
  });

  test("valid code -> token, whoami, label", async () => {
    const code = await newCliCode(browser);
    assert.match(code, /^[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/);
    const res = await exchange(srv, code, "jaswant-mbp");
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.match(body.token, /^nx_[0-9A-Za-z]{40}$/);
    assert.equal(body.email, "alice@example.com");
    assert.equal(body.name, "Alice Doe");

    const who = await fetch(`${srv.url}/cli/whoami`, { headers: { authorization: `Bearer ${body.token}` } });
    assert.equal(who.status, 200);
    assert.deepEqual(await who.json(), { email: "alice@example.com", name: "Alice Doe" });

    // Stored hashed only, labelled hostname · date.
    const row = srv.db.get("SELECT * FROM tokens ORDER BY id DESC LIMIT 1");
    assert.equal(row.label, "jaswant-mbp · 2026-10-22");
    assert.notEqual(row.hash, body.token);
    assert.equal(srv.db.get("SELECT COUNT(*) n FROM tokens WHERE hash = @h", { h: body.token }).n, 0);

    const page = await (await browser.get("/connect")).text();
    assert.match(page, /jaswant-mbp · 2026-10-22/);
  });

  test("code accepted without dash and in lower case", async () => {
    const code = await newCliCode(browser);
    assert.equal((await exchange(srv, code.replace("-", "").toLowerCase())).status, 200);
  });

  test("reused code is rejected", async () => {
    const code = await newCliCode(browser);
    assert.equal((await exchange(srv, code)).status, 200);
    const again = await exchange(srv, code);
    assert.equal(again.status, 400);
    assert.deepEqual(await again.json(), { error: "invalid_code" });
  });

  test("expired code is rejected", async () => {
    const code = await newCliCode(browser);
    srv.advance(10 * 60 * 1000 + 1);
    const res = await exchange(srv, code);
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: "invalid_code" });
  });

  test("wrong or malformed codes are rejected", async () => {
    for (const code of ["ABCD-2345", "", "x", "0000-0000", 12345678, null]) {
      const res = await exchange(srv, code);
      assert.equal(res.status, 400, String(code));
      assert.deepEqual(await res.json(), { error: "invalid_code" });
    }
  });

  test("whoami without or with a bad token is 401", async () => {
    assert.equal((await fetch(`${srv.url}/cli/whoami`)).status, 401);
    const res = await fetch(`${srv.url}/cli/whoami`, { headers: { authorization: `Bearer nx_${"a".repeat(40)}` } });
    assert.equal(res.status, 401);
    assert.match(res.headers.get("www-authenticate"), /resource_metadata="https:\/\/nucleux.test\/mcp\/.well-known\/oauth-protected-resource"/);
  });

  test("POST /cli/revoke revokes exactly that token", async () => {
    const a = (await (await exchange(srv, await newCliCode(browser), "a")).json()).token;
    const b = (await (await exchange(srv, await newCliCode(browser), "b")).json()).token;
    const revoke = (t) => fetch(`${srv.url}/cli/revoke`, { method: "POST", headers: t ? { authorization: `Bearer ${t}` } : {} });

    const res = await revoke(a);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { revoked: true });
    assert.equal((await fetch(`${srv.url}/cli/whoami`, { headers: { authorization: `Bearer ${a}` } })).status, 401);
    assert.equal((await fetch(`${srv.url}/cli/whoami`, { headers: { authorization: `Bearer ${b}` } })).status, 200);

    assert.equal((await revoke(a)).status, 401); // already revoked
    assert.equal((await revoke()).status, 401); // missing
    assert.equal((await revoke("nx_nope")).status, 401); // invalid
  });

  test("revoke from the Connect page", async () => {
    const t = (await (await exchange(srv, await newCliCode(browser), "page-revoke")).json()).token;
    const id = srv.db.get("SELECT id FROM tokens WHERE label LIKE 'page-revoke%'").id;
    const csrf = csrfFrom(await (await browser.get("/connect")).text());
    const res = await browser.post(`/connect/tokens/${id}/revoke`, { _csrf: csrf });
    assert.equal(res.status, 303);
    assert.equal((await fetch(`${srv.url}/cli/whoami`, { headers: { authorization: `Bearer ${t}` } })).status, 401);
  });

  test("exchange is rate limited per IP", async () => {
    const limited = await startServer({}, { limits: { exchange: { max: 3 } } });
    try {
      const statuses = [];
      for (let i = 0; i < 5; i++) statuses.push((await exchange(limited, "AAAA-AAAA")).status);
      assert.deepEqual(statuses, [400, 400, 400, 429, 429]);
    } finally {
      await limited.close();
    }
  });
});

describe("bearer gate on the MCP endpoint", () => {
  for (const mode of ["off", "optional", "required"]) {
    describe(`NUCLEUX_AUTH=${mode}`, () => {
      let srv, token;
      before(async () => {
        srv = await startServer({ NUCLEUX_AUTH: mode });
        token = (await (await exchange(srv, await newCliCode(await signIn(srv)))).json()).token;
      });
      after(() => srv.close());

      test("no token", async () => {
        const res = await rpc(srv, "initialize", INIT);
        if (mode === "required") {
          assert.equal(res.status, 401);
          assert.equal(
            res.headers.get("www-authenticate"),
            'Bearer resource_metadata="https://nucleux.test/mcp/.well-known/oauth-protected-resource"'
          );
          assert.equal(res.body.jsonrpc, "2.0");
          assert.equal(res.body.error.code, -32001);
        } else {
          assert.equal(res.status, 200);
          assert.equal(res.body.result.instructions, "test instructions");
        }
      });

      test("invalid token", async () => {
        const res = await rpc(srv, "initialize", INIT, `nx_${"Z".repeat(40)}`);
        if (mode === "off") assert.equal(res.status, 200);
        else {
          assert.equal(res.status, 401);
          assert.match(res.headers.get("www-authenticate"), /error="invalid_token"/);
        }
      });

      test("valid token", async () => {
        const res = await rpc(srv, "tools/call", { name: "echo", arguments: { q: "secret-arg" } }, token);
        assert.equal(res.status, 200);
        assert.equal(res.body.result.content[0].text, '{"q":"secret-arg"}');
      });

      test("GET / is 405 (after the gate)", async () => {
        const ok = await fetch(`${srv.url}/`, { headers: { authorization: `Bearer ${token}` } });
        assert.equal(ok.status, 405);
        const bad = await fetch(`${srv.url}/`, { headers: { authorization: "Bearer nope" } });
        assert.equal(bad.status, mode === "off" ? 405 : 401);
      });
    });
  }
});

describe("usage logging", () => {
  let srv, token;
  before(async () => {
    srv = await startServer({ NUCLEUX_AUTH: "optional" });
    token = (await (await exchange(srv, await newCliCode(await signIn(srv)))).json()).token;
  });
  after(() => srv.close());

  test("tool calls are attributed, timed and never store arguments", async () => {
    await rpc(srv, "tools/call", { name: "echo", arguments: { q: "top-secret" } }, token);
    await rpc(srv, "tools/call", { name: "fail", arguments: {} }, token);
    await rpc(srv, "tools/call", { name: "echo", arguments: {} });
    await rpc(srv, "tools/list", {}, token); // not a tool call

    const rows = srv.db.all("SELECT * FROM usage ORDER BY id");
    assert.equal(rows.length, 3);
    const userId = srv.db.get("SELECT id FROM users").id;
    assert.deepEqual(
      rows.map((r) => [r.user_id, r.token_kind, r.tool, r.ok]),
      [
        [userId, "pat", "echo", 1],
        [userId, "pat", "fail", 0],
        [null, null, "echo", 1],
      ]
    );
    assert.ok(rows.every((r) => Number.isInteger(r.ms) && r.ms >= 0));
    const dump = JSON.stringify(srv.db.all("SELECT * FROM usage"));
    assert.doesNotMatch(dump, /top-secret/);

    const tok = srv.db.get("SELECT last_used FROM tokens");
    assert.equal(tok.last_used, srv.clock.t);

    const summary = srv.store.usageSummary(userId);
    assert.equal(summary.last7, 2);
    assert.deepEqual(summary.topTools.map((t) => t.tool), ["echo", "fail"]);
  });
});

describe("OAuth 2.1 for MCP clients", () => {
  let srv;
  before(async () => (srv = await startServer({ NUCLEUX_AUTH: "required" })));
  after(() => srv.close());

  const register = (body) =>
    fetch(`${srv.url}/oauth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  const token = (form) =>
    fetch(`${srv.url}/oauth/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(form),
    });

  test("registration validates redirect URIs", async () => {
    assert.equal((await register({ redirect_uris: ["http://evil.test/cb"] })).status, 400);
    assert.equal((await register({ redirect_uris: ["https://ok.test/cb#frag"] })).status, 400);
    assert.equal((await register({ redirect_uris: [] })).status, 400);
    assert.equal((await register({})).status, 400);
    assert.equal((await register({ redirect_uris: ["http://localhost:3334/cb"] })).status, 201);
    assert.equal((await register({ redirect_uris: ["http://127.0.0.1:9/cb"] })).status, 201);
  });

  test("DCR -> authorize -> token (PKCE) -> MCP call -> refresh -> revoke", async () => {
    const redirectUri = "https://claude.test/api/mcp/auth_callback";
    const reg = await register({ client_name: "Claude", redirect_uris: [redirectUri], token_endpoint_auth_method: "none" });
    assert.equal(reg.status, 201);
    const client = await reg.json();
    assert.match(client.client_id, /^nxc_/);
    assert.equal(client.client_secret, undefined);

    const { verifier, challenge } = pkce();
    const q = new URLSearchParams({
      response_type: "code",
      client_id: client.client_id,
      redirect_uri: redirectUri,
      code_challenge: challenge,
      code_challenge_method: "S256",
      state: "st-123",
      scope: "mcp",
      resource: "https://nucleux.test/mcp",
    });

    // No session: bounce through sign-in, then come back to authorize.
    const anon = await fetch(`${srv.url}/oauth/authorize?${q}`, { redirect: "manual" });
    assert.equal(anon.status, 302);
    const toSignIn = local(srv, anon.headers.get("location"));
    assert.ok(toSignIn.startsWith("/connect?next="));
    const next = new URL(toSignIn, "http://x").searchParams.get("next");
    const browser = await signIn(srv, "alice", next);
    assert.equal(browser.location, `https://nucleux.test/mcp/oauth/authorize?${q}`);

    const consentRes = await browser.get(local(srv, browser.location));
    assert.equal(consentRes.status, 200);
    assert.match(consentRes.headers.get("content-security-policy"), /form-action 'self' https:\/\/claude.test/);
    const consent = await consentRes.text();
    assert.match(consent, /Allow Claude to use Nucleux as alice@example.com\?/);

    // Missing CSRF is refused.
    const form = Object.fromEntries(q);
    assert.equal((await browser.post("/oauth/authorize", { ...form, decision: "allow" })).status, 403);

    const allow = await browser.post("/oauth/authorize", { ...form, _csrf: csrfFrom(consent), decision: "allow" });
    assert.equal(allow.status, 302);
    const back = new URL(allow.headers.get("location"));
    assert.equal(back.origin + back.pathname, redirectUri);
    assert.equal(back.searchParams.get("state"), "st-123");
    assert.equal(back.searchParams.get("iss"), "https://nucleux.test/mcp");
    const code = back.searchParams.get("code");

    // Wrong verifier fails (and burns the code).
    const bad = await token({ grant_type: "authorization_code", code, redirect_uri: redirectUri, client_id: client.client_id, code_verifier: pkce().verifier });
    assert.equal(bad.status, 400);
    assert.equal((await bad.json()).error, "invalid_grant");

    // Fresh code, right verifier.
    const allow2 = await browser.post("/oauth/authorize", { ...form, _csrf: csrfFrom(consent), decision: "allow" });
    const code2 = new URL(allow2.headers.get("location")).searchParams.get("code");
    const ok = await token({ grant_type: "authorization_code", code: code2, redirect_uri: redirectUri, client_id: client.client_id, code_verifier: verifier, resource: "https://nucleux.test/mcp" });
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get("cache-control"), "no-store");
    const t1 = await ok.json();
    assert.equal(t1.token_type, "Bearer");
    assert.equal(t1.expires_in, 3600);
    assert.equal(t1.scope, "mcp");

    // Codes are single use.
    const replay = await token({ grant_type: "authorization_code", code: code2, redirect_uri: redirectUri, client_id: client.client_id, code_verifier: verifier });
    assert.equal(replay.status, 400);
    // ...and replaying one revokes what it minted.
    assert.equal((await rpc(srv, "tools/list", {}, t1.access_token)).status, 401);

    // Start again for the rest of the flow.
    const allow3 = await browser.post("/oauth/authorize", { ...form, _csrf: csrfFrom(consent), decision: "allow" });
    const code3 = new URL(allow3.headers.get("location")).searchParams.get("code");
    const t2 = await (await token({ grant_type: "authorization_code", code: code3, redirect_uri: redirectUri, client_id: client.client_id, code_verifier: verifier })).json();

    // Real MCP client over Streamable HTTP with the access token.
    const mcp = new Client({ name: "test", version: "1" });
    await mcp.connect(
      new StreamableHTTPClientTransport(new URL(`${srv.url}/`), {
        requestInit: { headers: { Authorization: `Bearer ${t2.access_token}` } },
      })
    );
    assert.equal(mcp.getInstructions(), "test instructions");
    const tools = await mcp.listTools();
    assert.deepEqual(tools.tools.map((t) => t.name), ["echo", "fail"]);
    const result = await mcp.callTool({ name: "echo", arguments: { a: 1 } });
    assert.equal(result.content[0].text, '{"a":1}');
    await mcp.close();
    const usage = srv.db.get("SELECT * FROM usage ORDER BY id DESC LIMIT 1");
    assert.equal(usage.token_kind, "oauth");
    assert.equal(usage.tool, "echo");

    // Connected app shows on the Connect page.
    assert.match(await (await browser.get("/connect")).text(), /Claude <span class="badge">OAuth<\/span>/);

    // Access tokens expire after an hour.
    srv.advance(3600 * 1000 + 1);
    assert.equal((await rpc(srv, "tools/list", {}, t2.access_token)).status, 401);

    // Refresh rotates.
    const r = await token({ grant_type: "refresh_token", refresh_token: t2.refresh_token, client_id: client.client_id });
    assert.equal(r.status, 200);
    const t3 = await r.json();
    assert.notEqual(t3.refresh_token, t2.refresh_token);
    assert.equal((await rpc(srv, "tools/list", {}, t3.access_token)).status, 200);

    // Revocation (RFC 7009) kills the pair.
    const rev = await fetch(`${srv.url}/oauth/revoke`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: t3.refresh_token, client_id: client.client_id }),
    });
    assert.equal(rev.status, 200);
    assert.equal((await rpc(srv, "tools/list", {}, t3.access_token)).status, 401);
    const dead = await token({ grant_type: "refresh_token", refresh_token: t3.refresh_token, client_id: client.client_id });
    assert.equal(dead.status, 400);
  });

  test("refresh token reuse revokes the family", async () => {
    const redirectUri = "https://claude.test/cb";
    const client = await (await register({ client_name: "Reuse", redirect_uris: [redirectUri] })).json();
    const browser = await signIn(srv);
    const { verifier, challenge } = pkce();
    const form = { response_type: "code", client_id: client.client_id, redirect_uri: redirectUri, code_challenge: challenge, code_challenge_method: "S256" };
    const consent = await (await browser.get(`/oauth/authorize?${new URLSearchParams(form)}`)).text();
    const allow = await browser.post("/oauth/authorize", { ...form, _csrf: csrfFrom(consent), decision: "allow" });
    const code = new URL(allow.headers.get("location")).searchParams.get("code");
    const t1 = await (await token({ grant_type: "authorization_code", code, redirect_uri: redirectUri, client_id: client.client_id, code_verifier: verifier })).json();
    const t2 = await (await token({ grant_type: "refresh_token", refresh_token: t1.refresh_token, client_id: client.client_id })).json();
    assert.equal((await token({ grant_type: "refresh_token", refresh_token: t1.refresh_token, client_id: client.client_id })).status, 400);
    assert.equal((await rpc(srv, "tools/list", {}, t2.access_token)).status, 401);
  });

  test("deny, bad redirect and missing PKCE", async () => {
    const redirectUri = "https://claude.test/cb";
    const client = await (await register({ client_name: "X", redirect_uris: [redirectUri] })).json();
    const browser = await signIn(srv);
    const { challenge } = pkce();
    const form = { response_type: "code", client_id: client.client_id, redirect_uri: redirectUri, code_challenge: challenge, code_challenge_method: "S256", state: "s" };

    // Unregistered redirect: error page, never a redirect.
    const wrong = await browser.get(`/oauth/authorize?${new URLSearchParams({ ...form, redirect_uri: "https://evil.test/cb" })}`);
    assert.equal(wrong.status, 400);
    // Unknown client: error page.
    assert.equal((await browser.get(`/oauth/authorize?${new URLSearchParams({ ...form, client_id: "nxc_nope" })}`)).status, 400);
    // No PKCE: redirect back with invalid_request.
    const noPkce = await browser.get(`/oauth/authorize?${new URLSearchParams({ ...form, code_challenge: "" })}`);
    assert.equal(noPkce.status, 302);
    assert.equal(new URL(noPkce.headers.get("location")).searchParams.get("error"), "invalid_request");
    // Plain PKCE refused.
    const plain = await browser.get(`/oauth/authorize?${new URLSearchParams({ ...form, code_challenge_method: "plain" })}`);
    assert.equal(new URL(plain.headers.get("location")).searchParams.get("error"), "invalid_request");
    // Wrong resource.
    const res = await browser.get(`/oauth/authorize?${new URLSearchParams({ ...form, resource: "https://other.test/mcp" })}`);
    assert.equal(new URL(res.headers.get("location")).searchParams.get("error"), "invalid_target");
    // Deny.
    const consent = await (await browser.get(`/oauth/authorize?${new URLSearchParams(form)}`)).text();
    const deny = await browser.post("/oauth/authorize", { ...form, _csrf: csrfFrom(consent), decision: "deny" });
    const loc = new URL(deny.headers.get("location"));
    assert.equal(loc.searchParams.get("error"), "access_denied");
    assert.equal(loc.searchParams.get("state"), "s");
    assert.equal(loc.searchParams.get("code"), null);
  });

  test("confidential clients must send their secret", async () => {
    const redirectUri = "https://app.test/cb";
    const client = await (await register({ client_name: "Conf", redirect_uris: [redirectUri], token_endpoint_auth_method: "client_secret_post" })).json();
    assert.match(client.client_secret, /^nxs_/);
    const r1 = await token({ grant_type: "refresh_token", refresh_token: "x", client_id: client.client_id });
    assert.equal(r1.status, 401);
    const r2 = await token({ grant_type: "refresh_token", refresh_token: "x", client_id: client.client_id, client_secret: client.client_secret });
    assert.equal(r2.status, 400); // authenticated; the grant itself is bad
  });

  test("401 from the MCP endpoint points at the resource metadata", async () => {
    const res = await rpc(srv, "initialize", INIT);
    assert.equal(res.status, 401);
    const meta = /resource_metadata="([^"]+)"/.exec(res.headers.get("www-authenticate"))[1];
    assert.equal(meta, "https://nucleux.test/mcp/.well-known/oauth-protected-resource");
    assert.equal(res.headers.get("access-control-expose-headers"), "Mcp-Session-Id, WWW-Authenticate");
  });
});
