import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  startServer,
  csrfFrom,
  newCliCode,
  newToken,
  issue,
  exchange,
  pkce,
  rpc,
  browser as newBrowser,
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

describe("no sign-in: the old Connect page points at the site", () => {
  let srv;
  before(async () => (srv = await startServer()));
  after(() => srv.close());

  for (const path of ["/connect", "/connect/", "/connect/code", "/connect/tokens/1/revoke", "/login", "/connect?next=%2Fadmin"]) {
    test(`GET ${path} -> 301 to the site's setup section`, async () => {
      const res = await fetch(srv.url + path, { redirect: "manual" });
      assert.equal(res.status, 301);
      assert.equal(res.headers.get("location"), "https://nucleux.test/mcp#setup");
    });
  }

  test("sign-in routes are gone", async () => {
    for (const path of ["/auth/login?provider=google", "/auth/callback/google", "/auth/email/verify"]) {
      assert.equal((await fetch(srv.url + path, { redirect: "manual" })).status, 404, path);
    }
    assert.equal((await fetch(`${srv.url}/auth/email/start`, { method: "POST" })).status, 404);
  });
});

describe("self-serve issuance for the site's MCP page", () => {
  let srv;
  before(async () => (srv = await startServer()));
  after(() => srv.close());

  test("POST /tokens/prompt -> code + prompt; the code exchanges via /cli/exchange", async () => {
    const res = await issue(srv, "/tokens/prompt");
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.match(res.headers.get("content-type"), /application\/json/);
    const body = await res.json();
    assert.deepEqual(Object.keys(body).sort(), ["code", "expires", "prompt"]);
    assert.match(body.code, /^[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/);
    assert.equal(body.expires, new Date(srv.clock.t + 10 * 60 * 1000).toISOString());

    const principal = srv.db.get("SELECT u.* FROM users u ORDER BY id DESC LIMIT 1");
    assert.equal(principal.provider, "anon");
    assert.equal(principal.name, "anonymous");
    assert.equal(srv.db.get("SELECT COUNT(*) n FROM tokens").n, 0, "no token until the code is exchanged");

    const ex = await exchange(srv, body.code, "jaswant-mbp");
    assert.equal(ex.status, 200);
    const { token, email, name } = await ex.json();
    assert.match(token, /^nx_[0-9A-Za-z]{40}$/);
    assert.equal(email, "");
    assert.equal(name, "anonymous");
    const row = srv.db.get("SELECT * FROM tokens ORDER BY id DESC LIMIT 1");
    assert.equal(row.label, "jaswant-mbp · 2026-10-22");
    assert.equal(row.user_id, principal.id);
    assert.equal((await rpc(srv, "tools/list", {}, token)).status, 200);
  });

  test("the connect prompt is self-contained and covers the edge cases", async () => {
    const { code, prompt } = await (await issue(srv, "/tokens/prompt")).json();
    for (const needle of [
      `npx -y @nucleux/mcp@latest add --code ${code}`,
      "hosted at https://nucleux.test/mcp",
      "works once and expires 10 minutes",
      "unknown, expired or already used",
      "ask me for a new prompt from https://nucleux.test/mcp",
      "Node.js 18",
      "HTTPS_PROXY",
      "ask me to run the command myself",
      "--only",
      "--no-project",
      'whoami`. It should print "Signed in to https://nucleux.test/mcp"',
      "restarted",
      "Never print, paste, log or commit it",
      "npx -y @nucleux/mcp logout",
      "ask the Nucleux team to revoke it",
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
    assert.doesNotMatch(prompt, /signed in as|sign in|\/mcp\/connect/i);
    assert.doesNotMatch(prompt, /nx_[0-9A-Za-z]{10}/, "the prompt carries the one-time code, never a token");
  });

  test("POST /tokens -> a working bearer, labelled web · date, shown once", async () => {
    const res = await issue(srv, "/tokens");
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("cache-control"), "no-store");
    const body = await res.json();
    assert.deepEqual(Object.keys(body), ["token"]);
    assert.match(body.token, /^nx_[0-9A-Za-z]{40}$/);
    const row = srv.db.get("SELECT t.*, u.provider FROM tokens t JOIN users u ON u.id = t.user_id ORDER BY t.id DESC LIMIT 1");
    assert.equal(row.label, "web · 2026-10-22");
    assert.equal(row.provider, "anon");
    assert.notEqual(row.hash, body.token);
    const call = await rpc(srv, "tools/call", { name: "echo", arguments: { a: 1 } }, body.token);
    assert.equal(call.status, 200);
    const who = await fetch(`${srv.url}/cli/whoami`, { headers: { authorization: `Bearer ${body.token}` } });
    assert.deepEqual(await who.json(), { email: "", name: "anonymous" });
    // Each request is its own principal.
    const other = await newToken(srv);
    const owners = srv.db.all("SELECT user_id FROM tokens WHERE label LIKE 'web%'").map((r) => r.user_id);
    assert.equal(new Set(owners).size, owners.length);
    assert.notEqual(other, body.token);
  });

  test("other origins (or none) are refused", async () => {
    for (const path of ["/tokens", "/tokens/prompt"]) {
      for (const origin of ["https://evil.test", "null", "http://nucleux.test", "https://nucleux.test.evil.com", null]) {
        const res = await issue(srv, path, origin);
        assert.equal(res.status, 403, `${path} ${origin}`);
        assert.equal((await res.json()).error, "forbidden_origin");
      }
    }
    // No CORS grant either, so a cross-site page can't read a response.
    const res = await issue(srv, "/tokens", "https://evil.test");
    assert.equal(res.headers.get("access-control-allow-origin"), null);
  });

  test("rate limited per IP, separately for each endpoint", async () => {
    const limited = await startServer({ NUCLEUX_ISSUE_PER_HOUR: "2" });
    try {
      const t = [];
      for (let i = 0; i < 3; i++) t.push((await issue(limited, "/tokens")).status);
      const p = [];
      for (let i = 0; i < 3; i++) p.push((await issue(limited, "/tokens/prompt")).status);
      assert.deepEqual(t, [200, 200, 429]);
      assert.deepEqual(p, [200, 200, 429]);
      limited.advance(3600 * 1000 + 1);
      assert.equal((await issue(limited, "/tokens")).status, 200);
    } finally {
      await limited.close();
    }
  });

  test("tokens issued before this change still work", async () => {
    // A principal and token from the sign-in era.
    const id = Number(
      srv.db.run(
        "INSERT INTO users (provider, provider_id, email, name, created) VALUES ('google', 'g-1', 'old@example.com', 'Old User', 1)"
      ).lastInsertRowid
    );
    const { token } = srv.store.createToken(id, "laptop · 2026-10-01");
    const res = await rpc(srv, "tools/list", {}, token);
    assert.equal(res.status, 200);
    const who = await fetch(`${srv.url}/cli/whoami`, { headers: { authorization: `Bearer ${token}` } });
    assert.deepEqual(await who.json(), { email: "old@example.com", name: "Old User" });
  });
});

describe("admin (HTTP Basic)", () => {
  const basic = (pw, user = "admin") => `Basic ${Buffer.from(`${user}:${pw}`).toString("base64")}`;

  test("404 when NUCLEUX_ADMIN_PASSWORD is unset", async () => {
    const srv = await startServer({ NUCLEUX_ADMIN_PASSWORD: "" });
    try {
      assert.equal((await fetch(`${srv.url}/admin`, { headers: { authorization: basic("x") } })).status, 404);
      assert.equal((await fetch(`${srv.url}/admin/users/1/disable`, { method: "POST" })).status, 404);
    } finally {
      await srv.close();
    }
  });

  describe("with a password", () => {
    let srv;
    before(async () => (srv = await startServer()));
    after(() => srv.close());

    test("401 without or with wrong credentials", async () => {
      const none = await fetch(`${srv.url}/admin`);
      assert.equal(none.status, 401);
      assert.match(none.headers.get("www-authenticate"), /^Basic realm="Nucleux admin"/);
      assert.equal((await fetch(`${srv.url}/admin`, { headers: { authorization: basic("wrong") } })).status, 401);
      assert.equal((await fetch(`${srv.url}/admin`, { headers: { authorization: "Basic !!!" } })).status, 401);
      assert.equal((await fetch(`${srv.url}/admin`, { headers: { authorization: "Bearer admin-secret" } })).status, 401);
    });

    test("200 lists principals with provider, tokens and usage; revoke and disable work", async () => {
      const token = await newToken(srv);
      await rpc(srv, "tools/call", { name: "echo", arguments: {} }, token);
      await issue(srv, "/tokens/prompt"); // unused anonymous principal: counted, not listed
      const oldId = Number(
        srv.db.run("INSERT INTO users (provider, provider_id, email, name, created) VALUES ('email', 'x@example.com', 'x@example.com', 'x', 1)").lastInsertRowid
      );
      const oldToken = srv.store.createToken(oldId, "old-laptop · 2026-10-01").token;

      const b = newBrowser(srv);
      const auth = { authorization: basic("admin-secret", "anyone") };
      const res = await b.get("/admin", auth);
      assert.equal(res.status, 200);
      assert.match(res.headers.get("content-security-policy"), /frame-ancestors 'none'/);
      const html = await res.text();
      assert.match(html, /anonymous #\d+/);
      assert.match(html, /x@example.com/);
      assert.match(html, /anonymous · since/);
      assert.match(html, /email · since/);
      assert.match(html, /1 unused anonymous/);
      assert.match(html, /web · 2026-10-22/);
      assert.match(html, /old-laptop · 2026-10-01/);

      const csrf = csrfFrom(html);
      const oldTokenId = srv.db.get("SELECT id FROM tokens WHERE label LIKE 'old-laptop%'").id;
      // CSRF required, and the Origin must be ours.
      assert.equal((await b.post(`/admin/tokens/${oldTokenId}/revoke`, {}, auth)).status, 403);
      assert.equal((await b.post(`/admin/tokens/${oldTokenId}/revoke`, { _csrf: csrf }, { ...auth, origin: "https://evil.test" })).status, 403);
      // Basic auth required too.
      assert.equal((await b.post(`/admin/tokens/${oldTokenId}/revoke`, { _csrf: csrf })).status, 401);

      const rev = await b.post(`/admin/tokens/${oldTokenId}/revoke`, { _csrf: csrf }, auth);
      assert.equal(rev.status, 303);
      assert.equal(rev.headers.get("location"), "https://nucleux.test/mcp/admin?done=revoked");
      assert.equal((await rpc(srv, "tools/list", {}, oldToken)).status, 401);

      const anonId = srv.db.get("SELECT user_id FROM tokens WHERE label LIKE 'web%' ORDER BY id DESC LIMIT 1").user_id;
      assert.equal((await b.post(`/admin/users/${anonId}/disable`, { _csrf: csrf }, auth)).status, 303);
      assert.equal((await rpc(srv, "tools/list", {}, token)).status, 401);
      assert.match(await (await b.get("/admin", auth)).text(), /Disabled/);
      assert.equal((await b.post(`/admin/users/${anonId}/enable`, { _csrf: csrf }, auth)).status, 303);
      assert.equal((await b.post(`/admin/users/${anonId}/nonsense`, { _csrf: csrf }, auth)).status, 404);
    });
  });
});

describe("CLI code exchange", () => {
  let srv;
  before(async () => {
    srv = await startServer();
  });
  after(() => srv.close());

  test("valid code -> token, whoami, label", async () => {
    const code = await newCliCode(srv);
    assert.match(code, /^[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/);
    const res = await exchange(srv, code, "jaswant-mbp");
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.match(body.token, /^nx_[0-9A-Za-z]{40}$/);
    assert.equal(body.name, "anonymous");

    const who = await fetch(`${srv.url}/cli/whoami`, { headers: { authorization: `Bearer ${body.token}` } });
    assert.equal(who.status, 200);
    assert.deepEqual(await who.json(), { email: "", name: "anonymous" });

    // Stored hashed only, labelled hostname · date.
    const row = srv.db.get("SELECT * FROM tokens ORDER BY id DESC LIMIT 1");
    assert.equal(row.label, "jaswant-mbp · 2026-10-22");
    assert.notEqual(row.hash, body.token);
    assert.equal(srv.db.get("SELECT COUNT(*) n FROM tokens WHERE hash = @h", { h: body.token }).n, 0);
  });

  test("code accepted without dash and in lower case", async () => {
    const code = await newCliCode(srv);
    assert.equal((await exchange(srv, code.replace("-", "").toLowerCase())).status, 200);
  });

  test("reused code is rejected", async () => {
    const code = await newCliCode(srv);
    assert.equal((await exchange(srv, code)).status, 200);
    const again = await exchange(srv, code);
    assert.equal(again.status, 400);
    assert.deepEqual(await again.json(), { error: "invalid_code" });
  });

  test("expired code is rejected", async () => {
    const code = await newCliCode(srv);
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
    const a = (await (await exchange(srv, await newCliCode(srv), "a")).json()).token;
    const b = (await (await exchange(srv, await newCliCode(srv), "b")).json()).token;
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
        token = await newToken(srv);
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
    token = (await (await exchange(srv, await newCliCode(srv))).json()).token;
  });
  after(() => srv.close());

  test("tool calls are attributed, timed and never store arguments", async () => {
    await rpc(srv, "tools/call", { name: "echo", arguments: { q: "top-secret" } }, token);
    await rpc(srv, "tools/call", { name: "fail", arguments: {} }, token);
    await rpc(srv, "tools/call", { name: "echo", arguments: {} });
    await rpc(srv, "tools/list", {}, token); // not a tool call

    const rows = srv.db.all("SELECT * FROM usage ORDER BY id");
    assert.equal(rows.length, 3);
    const userId = srv.db.get("SELECT user_id FROM tokens").user_id;
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

    const row = srv.store.adminOverview().users.find((u) => u.id === userId);
    assert.equal(row.calls7, 2);
    assert.equal(row.last_seen, srv.clock.t);
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

    // No session, no sign-in: straight to the consent page.
    const browser = newBrowser(srv);
    const consentRes = await browser.get(`/oauth/authorize?${q}`);
    assert.equal(consentRes.status, 200);
    assert.match(consentRes.headers.get("content-security-policy"), /form-action 'self' https:\/\/claude.test/);
    assert.ok(browser.jar.has("nx_pre"), "consent sets the CSRF cookie");
    const consent = await consentRes.text();
    assert.match(consent, /Allow Claude to use Nucleux\?/);
    assert.doesNotMatch(consent, /sign in|@/i);
    const usersBefore = srv.db.get("SELECT COUNT(*) n FROM users").n;

    // Missing CSRF, a token minted for another browser, or a foreign Origin are refused.
    const form = Object.fromEntries(q);
    assert.equal((await browser.post("/oauth/authorize", { ...form, decision: "allow" })).status, 403);
    const elsewhere = csrfFrom(await (await newBrowser(srv).get(`/oauth/authorize?${q}`)).text());
    assert.equal((await browser.post("/oauth/authorize", { ...form, _csrf: elsewhere, decision: "allow" })).status, 403);
    assert.equal((await browser.post("/oauth/authorize", { ...form, _csrf: csrfFrom(consent), decision: "allow" }, { origin: "https://evil.test" })).status, 403);
    assert.equal(srv.db.get("SELECT COUNT(*) n FROM users").n, usersBefore, "nothing created without consent");

    const allow = await browser.post("/oauth/authorize", { ...form, _csrf: csrfFrom(consent), decision: "allow" });
    assert.equal(allow.status, 302);
    const back = new URL(allow.headers.get("location"));
    assert.equal(back.origin + back.pathname, redirectUri);
    assert.equal(back.searchParams.get("state"), "st-123");
    assert.equal(back.searchParams.get("iss"), "https://nucleux.test/mcp");
    const code = back.searchParams.get("code");
    // Allow created one anonymous principal for this grant.
    assert.equal(srv.db.get("SELECT COUNT(*) n FROM users").n, usersBefore + 1);
    assert.equal(srv.db.get("SELECT provider FROM users ORDER BY id DESC LIMIT 1").provider, "anon");

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

    // The grant shows up in /admin as an anonymous principal with one app.
    const granted = srv.store.adminOverview().users.find((u) => u.apps === 1);
    assert.equal(granted.provider, "anon");

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
    const browser = newBrowser(srv);
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
    const browser = newBrowser(srv);
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
