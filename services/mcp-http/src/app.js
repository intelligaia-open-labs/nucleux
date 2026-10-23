// The HTTP app: MCP proxy (gated + tracked), sign-in, Connect/admin pages,
// CLI token exchange and an OAuth 2.1 authorization server for MCP clients.
//
// nginx strips the public `/mcp` prefix, so routes here are `/`, `/connect`,
// `/cli/exchange`… while every URL we hand to a browser or client is built
// from `config.base` (https://nucleux.in/mcp).

import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createPages } from "./pages.js";
import { createSurface } from "./surface.js";
import {
  sign,
  verify,
  sha256,
  safeEqual,
  pkceS256,
  newOpaque,
  rateLimiter,
  parseCookies,
  serializeCookie,
  appendSetCookie,
  normalizeCliCode,
  formatCliCode,
} from "./security.js";

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_CSS = require.resolve("@nucleux/tokens/styles.css");

const SESSION_COOKIE = "nx_session";
const LOGIN_COOKIE = "nx_login";
const LOGIN_TTL = 10 * 60 * 1000;

const DEFAULT_LIMITS = {
  signin: { windowMs: 10 * 60 * 1000, max: 30 },
  exchange: { windowMs: 10 * 60 * 1000, max: 20 },
  register: { windowMs: 60 * 60 * 1000, max: 20 },
  token: { windowMs: 60 * 1000, max: 60 },
  code: { windowMs: 10 * 60 * 1000, max: 20 },
};

const jsonRpcError = (code, message) => ({ jsonrpc: "2.0", error: { code, message }, id: null });

export function createApp({ config, store, upstream, mobile = null, providers = {}, limits = {} }) {
  // Web for everyone; web + Nucleux Mobile for signed-in requests (surface.js).
  const surface = createSurface({ web: upstream, mobile });
  const pages = createPages(config);
  const p = (route) => `${config.basePath}${route}`;
  const abs = (route) => `${config.base}${route}`;
  const resourceMetadataUrl = abs("/.well-known/oauth-protected-resource");
  const limit = (name) => rateLimiter({ name, ...DEFAULT_LIMITS[name], ...limits[name], now: store.now });
  const isAdmin = (user) => !!user && config.admins.includes(String(user.email).toLowerCase());

  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);

  // -------------------------------------------------------------------------
  // CORS — only for what non-browser-session clients call with bearer tokens
  // or no credentials at all. Never Allow-Credentials; pages get no CORS.
  // -------------------------------------------------------------------------
  const CORS_PATHS = new Set(["/", "/health", "/oauth/register", "/oauth/token", "/oauth/revoke"]);
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (!(CORS_PATHS.has(req.path) || req.path.startsWith("/.well-known/"))) return next();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept, Authorization, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID"
    );
    // Mcp-Session-Id: stateless mode never sets it, but clients like the MCP
    // Inspector look for it. WWW-Authenticate: browser clients need the
    // resource_metadata pointer from a 401.
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id, WWW-Authenticate");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: false, limit: "64kb" }));

  // -------------------------------------------------------------------------
  // Helpers: sessions, CSRF, page headers, `next` handling
  // -------------------------------------------------------------------------

  function currentSession(req) {
    if (req._nx === undefined) {
      const id = parseCookies(req.headers.cookie)[SESSION_COOKIE];
      req._nx = id ? store.getSession(id) : null;
      if (req._nx) req._nx.rawId = id;
    }
    return req._nx;
  }

  function sessionCookie(value, maxAge) {
    return serializeCookie(SESSION_COOKIE, value, {
      path: config.basePath || "/",
      secure: config.secureCookies,
      maxAge,
    });
  }

  // Same-origin POST with the session's CSRF token.
  function csrfOk(req, auth) {
    const origin = req.headers.origin;
    if (origin && origin !== "null" && origin !== config.origin) return false;
    if (origin === "null") return false;
    const token = req.body?._csrf;
    return typeof token === "string" && safeEqual(token, auth.session.csrf);
  }

  function pageHeaders(res, { formAction = [] } = {}) {
    const forms = ["'self'", ...formAction].join(" ");
    res.setHeader(
      "Content-Security-Policy",
      `default-src 'none'; style-src 'self'; script-src 'self'; img-src 'self' https: data:; connect-src 'self'; form-action ${forms}; frame-ancestors 'none'; base-uri 'none'`
    );
    res.setHeader("X-Frame-Options", "DENY");
    // "no-referrer" would make Chrome send `Origin: null` on our own form posts, which the
    // CSRF check (rightly) rejects; same-origin keeps referrers private from other sites.
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cache-Control", "no-store");
    if (config.secureCookies) res.setHeader("Strict-Transport-Security", "max-age=31536000");
  }

  function sendPage(res, html, status = 200, opts) {
    pageHeaders(res, opts);
    res.status(status).type("html").send(html);
  }

  // Only same-origin paths, expressed relative to base ("/connect").
  function safeNext(input) {
    if (typeof input !== "string" || !input || input.length > 4096) return "/connect";
    let s = input;
    if (s.startsWith(`${config.origin}/`)) s = s.slice(config.origin.length);
    if (config.basePath && (s === config.basePath || s.startsWith(`${config.basePath}/`) || s.startsWith(`${config.basePath}?`))) {
      s = s.slice(config.basePath.length) || "/";
    }
    if (!s.startsWith("/") || s.startsWith("//") || s.includes("\\") || /[\u0000-\u001f\u007f]/.test(s)) return "/connect";
    return s;
  }

  function allowedEmail(email) {
    const { allowedEmails, allowedDomains } = config;
    if (!allowedEmails.length && !allowedDomains.length) return true;
    const lower = String(email).toLowerCase();
    return allowedEmails.includes(lower) || allowedDomains.includes(lower.split("@")[1]);
  }

  const asyncRoute = (fn) => (req, res, next) => {
    Promise.resolve()
      .then(() => fn(req, res, next))
      .catch(next);
  };

  // -------------------------------------------------------------------------
  // Health + static assets
  // -------------------------------------------------------------------------

  app.get(
    "/health",
    asyncRoute(async (_req, res) => {
      try {
        const tools = await upstream.listTools();
        // Mobile is optional: its absence or failure never makes health fail.
        const mobileInfo = mobile?.available ? await mobile.info() : null;
        res.json({
          status: "ok",
          service: "nucleux-mcp",
          upstream: `@nucleux/mcp@${upstream.version}`,
          auth: config.authMode,
          tools: tools.map((t) => t.name),
          mobile: mobileInfo ?? "unavailable",
        });
      } catch (err) {
        console.error("[nucleux-mcp] health check failed:", err);
        res.status(503).json({ status: "degraded", error: String(err?.message ?? err) });
      }
    })
  );

  const asset = (file, type) => (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.type(type).sendFile(file);
  };
  app.get("/assets/tokens.css", asset(TOKENS_CSS, "css"));
  app.get("/assets/app.css", asset(path.join(HERE, "assets/app.css"), "css"));
  app.get("/assets/app.js", asset(path.join(HERE, "assets/app.js"), "js"));

  // -------------------------------------------------------------------------
  // OAuth discovery documents (also under the path-suffixed RFC 8414/9728
  // forms, for when nginx forwards the root /.well-known/... to us).
  // -------------------------------------------------------------------------

  const protectedResource = (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.json({
      resource: config.base,
      authorization_servers: [config.base],
      bearer_methods_supported: ["header"],
      scopes_supported: ["mcp"],
      resource_name: "Nucleux MCP",
      resource_documentation: abs("/connect"),
    });
  };
  const authServerMetadata = (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.json({
      issuer: config.base,
      authorization_endpoint: abs("/oauth/authorize"),
      token_endpoint: abs("/oauth/token"),
      registration_endpoint: abs("/oauth/register"),
      revocation_endpoint: abs("/oauth/revoke"),
      response_types_supported: ["code"],
      response_modes_supported: ["query"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none", "client_secret_post"],
      revocation_endpoint_auth_methods_supported: ["none", "client_secret_post"],
      scopes_supported: ["mcp"],
      authorization_response_iss_parameter_supported: true,
      service_documentation: abs("/connect"),
    });
  };
  for (const suffix of ["", "/mcp"]) {
    app.get(`/.well-known/oauth-protected-resource${suffix}`, protectedResource);
    app.get(`/.well-known/oauth-authorization-server${suffix}`, authServerMetadata);
    app.get(`/.well-known/openid-configuration${suffix}`, authServerMetadata);
  }

  // -------------------------------------------------------------------------
  // Sign-in with Google / GitHub
  // -------------------------------------------------------------------------

  const signinLimit = limit("signin");

  app.get("/auth/login", signinLimit, (req, res) => {
    const provider = providers[req.query.provider];
    if (!provider) {
      sendPage(res, pages.message({ title: "Sign-in unavailable", text: "That sign-in provider is not configured." }), 400);
      return;
    }
    const nonce = newOpaque(24);
    const state = sign(config.sessionSecret, {
      p: provider.id,
      n: safeNext(req.query.next),
      c: sha256(nonce),
      exp: store.now() + LOGIN_TTL,
    });
    // Binds the round trip to this browser (login CSRF).
    appendSetCookie(
      res,
      serializeCookie(LOGIN_COOKIE, nonce, { path: p("/auth"), secure: config.secureCookies, maxAge: LOGIN_TTL })
    );
    res.setHeader("Cache-Control", "no-store");
    res.redirect(302, provider.authorizeUrl({ state, redirectUri: abs(`/auth/callback/${provider.id}`) }));
  });

  app.get(
    "/auth/callback/:provider",
    signinLimit,
    asyncRoute(async (req, res) => {
      const provider = providers[req.params.provider];
      const fail = (text, status = 400) => sendPage(res, pages.message({ title: "Sign-in failed", text }), status);
      appendSetCookie(res, serializeCookie(LOGIN_COOKIE, "", { path: p("/auth"), secure: config.secureCookies, maxAge: 0 }));
      if (!provider) return fail("That sign-in provider is not configured.");
      if (req.query.error) return fail("Sign-in was cancelled.");

      const state = verify(config.sessionSecret, req.query.state, store.now());
      const nonce = parseCookies(req.headers.cookie)[LOGIN_COOKIE];
      if (!state || state.p !== provider.id || !nonce || !safeEqual(sha256(nonce), state.c)) {
        return fail("This sign-in link has expired. Please start again.");
      }
      if (typeof req.query.code !== "string" || !req.query.code) return fail("The provider did not return a code.");

      let profile;
      try {
        profile = await provider.profile({ code: req.query.code, redirectUri: abs(`/auth/callback/${provider.id}`) });
      } catch (err) {
        console.error(`[nucleux-mcp] ${provider.id} sign-in failed:`, err.message);
        return fail(`Could not sign you in with ${provider.label}. Make sure your account has a verified email.`, 502);
      }
      if (!allowedEmail(profile.email)) {
        return fail(`${profile.email} is not allowed to use this server.`, 403);
      }
      const user = store.upsertUser({ provider: provider.id, ...profile });
      if (user.disabled) return fail("This account has been disabled.", 403);

      const session = store.createSession(user.id);
      appendSetCookie(res, sessionCookie(session.id, 30 * 24 * 3600 * 1000));
      res.setHeader("Cache-Control", "no-store");
      res.redirect(302, abs(safeNext(state.n)));
    })
  );

  app.post("/auth/logout", (req, res) => {
    const auth = currentSession(req);
    if (auth) {
      if (!csrfOk(req, auth)) {
        sendPage(res, pages.message({ title: "Request expired", text: "Reload the page and try again." }), 403);
        return;
      }
      store.deleteSession(auth.rawId);
    }
    appendSetCookie(res, sessionCookie("", 0));
    res.redirect(303, abs("/connect"));
  });

  // -------------------------------------------------------------------------
  // Connect page
  // -------------------------------------------------------------------------

  const NOTICES = { revoked: "Access revoked.", disconnected: "App disconnected." };

  function renderConnect(req, res, auth, extra = {}) {
    const user = auth.user;
    sendPage(
      res,
      pages.connect({
        user,
        csrf: auth.session.csrf,
        tokens: store.listTokens(user.id),
        apps: store.listConnectedApps(user.id),
        usage: store.usageSummary(user.id),
        isAdmin: isAdmin(user),
        notice: NOTICES[req.query.done],
        ...extra,
      })
    );
  }

  app.get("/connect", (req, res) => {
    const auth = currentSession(req);
    if (!auth) {
      sendPage(res, pages.signIn({ providers, next: req.query.next ? safeNext(req.query.next) : undefined }));
      return;
    }
    if (req.query.next) {
      const next = safeNext(req.query.next);
      if (next !== "/connect") {
        res.redirect(302, abs(next));
        return;
      }
    }
    store.touchUser(auth.user.id);
    renderConnect(req, res, auth);
  });
  app.get("/login", (req, res) => {
    const qs = req.query.next ? `?next=${encodeURIComponent(safeNext(req.query.next))}` : "";
    res.redirect(302, abs(`/connect${qs}`));
  });

  // Every POST below needs a session + CSRF.
  function sessionPost(handler) {
    return (req, res, next) => {
      const auth = currentSession(req);
      if (!auth) {
        res.redirect(303, abs("/connect"));
        return;
      }
      if (!csrfOk(req, auth)) {
        sendPage(res, pages.message({ title: "Request expired", text: "Reload the page and try again.", user: auth.user, csrf: auth.session.csrf }), 403);
        return;
      }
      return handler(req, res, auth, next);
    };
  }

  app.post(
    "/connect/code",
    limit("code"),
    sessionPost((req, res, auth) => {
      const { code } = store.createCliCode(auth.user.id);
      renderConnect({ query: {} }, res, auth, { code: formatCliCode(code) });
    })
  );

  app.post(
    "/connect/tokens/:id/revoke",
    sessionPost((req, res, auth) => {
      store.revokeToken(auth.user.id, Number(req.params.id));
      res.redirect(303, abs("/connect?done=revoked"));
    })
  );

  app.post(
    "/connect/apps/:clientId/revoke",
    sessionPost((req, res, auth) => {
      store.revokeApp(auth.user.id, String(req.params.clientId));
      res.redirect(303, abs("/connect?done=disconnected"));
    })
  );

  // -------------------------------------------------------------------------
  // Admin
  // -------------------------------------------------------------------------

  app.get("/admin", (req, res) => {
    const auth = currentSession(req);
    if (!auth) {
      res.redirect(302, abs(`/connect?next=${encodeURIComponent("/admin")}`));
      return;
    }
    if (!isAdmin(auth.user)) {
      sendPage(res, pages.message({ title: "Not allowed", text: "Admins only.", user: auth.user, csrf: auth.session.csrf }), 403);
      return;
    }
    sendPage(res, pages.admin({ user: auth.user, csrf: auth.session.csrf, overview: store.adminOverview() }));
  });

  app.post(
    "/admin/users/:id/:action",
    sessionPost((req, res, auth) => {
      if (!isAdmin(auth.user)) {
        sendPage(res, pages.message({ title: "Not allowed", text: "Admins only.", user: auth.user, csrf: auth.session.csrf }), 403);
        return;
      }
      const id = Number(req.params.id);
      const action = req.params.action;
      if (action === "disable") {
        store.setUserDisabled(id, true);
        store.revokeAllForUser(id);
      } else if (action === "enable") store.setUserDisabled(id, false);
      else if (action === "revoke") store.revokeAllForUser(id);
      else {
        res.status(404).end();
        return;
      }
      res.redirect(303, abs("/admin"));
    })
  );

  // -------------------------------------------------------------------------
  // CLI: code exchange, whoami, self-revoke
  // -------------------------------------------------------------------------

  const bearerOf = (req) => {
    const m = /^Bearer\s+(\S+)\s*$/i.exec(req.headers.authorization ?? "");
    return m ? m[1] : null;
  };

  function unauthorized(res, { invalid = false, body } = {}) {
    res.setHeader(
      "WWW-Authenticate",
      `Bearer resource_metadata="${resourceMetadataUrl}"${invalid ? ', error="invalid_token"' : ""}`
    );
    res.status(401).json(body ?? { error: invalid ? "invalid_token" : "unauthorized" });
  }

  app.post("/cli/exchange", limit("exchange"), (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const code = normalizeCliCode(req.body?.code);
    const user = code ? store.consumeCliCode(code) : null;
    if (!user) {
      res.status(400).json({ error: "invalid_code" });
      return;
    }
    const host =
      String(req.body?.label ?? "")
        .replace(/[\u0000-\u001f\u007f]/g, "")
        .trim()
        .slice(0, 64) || "unknown machine";
    const day = new Date(store.now()).toISOString().slice(0, 10);
    const { token } = store.createToken(user.id, `${host} · ${day}`);
    res.json({ token, email: user.email, name: user.name ?? "" });
  });

  app.get("/cli/whoami", (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const principal = store.authenticateBearer(bearerOf(req));
    if (!principal) return unauthorized(res, { invalid: !!bearerOf(req) });
    res.json({ email: principal.user.email, name: principal.user.name ?? "" });
  });

  app.post("/cli/revoke", (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const token = bearerOf(req);
    if (!token || !store.revokeTokenByValue(token)) return unauthorized(res, { invalid: !!token });
    res.json({ revoked: true });
  });

  // -------------------------------------------------------------------------
  // OAuth 2.1 authorization server (MCP authorization spec 2025-06-18)
  // -------------------------------------------------------------------------

  function validRedirectUri(value) {
    if (typeof value !== "string" || value.length > 2000) return false;
    let u;
    try {
      u = new URL(value);
    } catch {
      return false;
    }
    if (u.hash || u.username || u.password) return false;
    if (u.protocol === "https:") return true;
    return u.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
  }

  const oauthError = (res, status, error, description) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(status).json(description ? { error, error_description: description } : { error });
  };

  app.post("/oauth/register", limit("register"), (req, res) => {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const uris = body.redirect_uris;
    if (!Array.isArray(uris) || !uris.length || uris.length > 10 || !uris.every(validRedirectUri)) {
      return oauthError(res, 400, "invalid_redirect_uri", "redirect_uris must be https URLs or http://localhost URLs");
    }
    const authMethod = body.token_endpoint_auth_method ?? "none";
    if (!["none", "client_secret_post", "client_secret_basic"].includes(authMethod)) {
      return oauthError(res, 400, "invalid_client_metadata", "unsupported token_endpoint_auth_method");
    }
    const grantTypes = body.grant_types ?? ["authorization_code", "refresh_token"];
    const responseTypes = body.response_types ?? ["code"];
    if (
      !Array.isArray(grantTypes) ||
      !grantTypes.every((g) => ["authorization_code", "refresh_token"].includes(g)) ||
      !Array.isArray(responseTypes) ||
      !responseTypes.every((r) => r === "code")
    ) {
      return oauthError(res, 400, "invalid_client_metadata", "unsupported grant_types or response_types");
    }
    const name = String(body.client_name ?? "MCP client").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 100) || "MCP client";
    const metadata = {
      client_name: name,
      redirect_uris: uris,
      token_endpoint_auth_method: authMethod,
      grant_types: grantTypes,
      response_types: responseTypes,
      scope: "mcp",
    };
    for (const k of ["client_uri", "logo_uri", "software_id", "software_version"]) {
      if (typeof body[k] === "string" && body[k].length <= 500) metadata[k] = body[k];
    }
    const { id, secret } = store.createClient({ name, redirectUris: uris, authMethod, metadata });
    res.setHeader("Cache-Control", "no-store");
    res.status(201).json({
      client_id: id,
      client_id_issued_at: Math.floor(store.now() / 1000),
      ...(secret ? { client_secret: secret, client_secret_expires_at: 0 } : {}),
      ...metadata,
    });
  });

  const sameResource = (value) => String(value).replace(/\/+$/, "") === config.base;

  // Shared by GET (consent page) and POST (decision). Returns
  // { fatal } — show an error page, never redirect to an unverified URI;
  // { redirectError } — redirect back to the client with an error;
  // { client, params } — fine.
  function checkAuthorize(q) {
    const client = store.getClient(q.client_id);
    if (!client) return { fatal: "Unknown application. Remove the connector and add it again." };
    if (typeof q.redirect_uri !== "string" || !client.redirectUris.includes(q.redirect_uri)) {
      return { fatal: "The application sent a redirect address it did not register." };
    }
    const state = typeof q.state === "string" ? q.state : undefined;
    const back = (error, description) => ({ redirectError: { uri: q.redirect_uri, state, error, description } });
    if (q.response_type !== "code") return back("unsupported_response_type");
    if (typeof q.code_challenge !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(q.code_challenge)) {
      return back("invalid_request", "PKCE code_challenge is required");
    }
    if (q.code_challenge_method !== "S256") return back("invalid_request", "code_challenge_method must be S256");
    if (q.resource !== undefined && q.resource !== "" && !sameResource(q.resource)) {
      return back("invalid_target", `resource must be ${config.base}`);
    }
    return {
      client,
      params: {
        response_type: "code",
        client_id: client.id,
        redirect_uri: q.redirect_uri,
        state,
        code_challenge: q.code_challenge,
        code_challenge_method: "S256",
        scope: "mcp",
        resource: q.resource || undefined,
      },
    };
  }

  function redirectBack(res, uri, params) {
    const u = new URL(uri);
    for (const [k, v] of Object.entries(params)) if (v !== undefined) u.searchParams.set(k, v);
    u.searchParams.set("iss", config.base);
    res.setHeader("Cache-Control", "no-store");
    res.redirect(302, u.toString());
  }

  app.get("/oauth/authorize", (req, res) => {
    const check = checkAuthorize(req.query);
    const auth = currentSession(req);
    if (check.fatal) {
      sendPage(res, pages.message({ title: "Cannot connect", text: check.fatal, user: auth?.user, csrf: auth?.session.csrf }), 400);
      return;
    }
    if (check.redirectError) {
      const { uri, state, error, description } = check.redirectError;
      return redirectBack(res, uri, { error, error_description: description, state });
    }
    if (!auth) {
      res.redirect(302, abs(`/connect?next=${encodeURIComponent(req.originalUrl)}`));
      return;
    }
    const redirect = new URL(check.params.redirect_uri);
    sendPage(
      res,
      pages.consent({
        client: check.client,
        user: auth.user,
        csrf: auth.session.csrf,
        params: check.params,
        redirectHost: redirect.host,
      }),
      200,
      // Browsers apply form-action to the redirect that follows the POST.
      { formAction: [redirect.origin] }
    );
  });

  app.post("/oauth/authorize", (req, res) => {
    const auth = currentSession(req);
    if (!auth) {
      sendPage(res, pages.message({ title: "Signed out", text: "Your session ended. Start connecting again from your app." }), 401);
      return;
    }
    if (!csrfOk(req, auth)) {
      sendPage(res, pages.message({ title: "Request expired", text: "Reload the page and try again.", user: auth.user, csrf: auth.session.csrf }), 403);
      return;
    }
    const check = checkAuthorize(req.body ?? {});
    if (check.fatal) {
      sendPage(res, pages.message({ title: "Cannot connect", text: check.fatal, user: auth.user, csrf: auth.session.csrf }), 400);
      return;
    }
    if (check.redirectError) {
      const { uri, state, error, description } = check.redirectError;
      return redirectBack(res, uri, { error, error_description: description, state });
    }
    const { params, client } = check;
    if (req.body.decision !== "allow") {
      return redirectBack(res, params.redirect_uri, { error: "access_denied", state: params.state });
    }
    const code = store.createAuthCode({
      clientId: client.id,
      userId: auth.user.id,
      redirectUri: params.redirect_uri,
      codeChallenge: params.code_challenge,
      scope: params.scope,
      resource: params.resource ?? config.base,
    });
    redirectBack(res, params.redirect_uri, { code, state: params.state });
  });

  // client_id + optional secret, from the body or HTTP Basic.
  function authenticateClient(req) {
    let id = req.body?.client_id;
    let secret = req.body?.client_secret;
    const basic = /^Basic\s+(\S+)$/i.exec(req.headers.authorization ?? "");
    if (basic) {
      const decoded = Buffer.from(basic[1], "base64").toString("utf8");
      const i = decoded.indexOf(":");
      if (i > 0) {
        id = decodeURIComponent(decoded.slice(0, i));
        secret = decodeURIComponent(decoded.slice(i + 1));
      }
    }
    const client = typeof id === "string" ? store.getClient(id) : null;
    if (!client) return null;
    if (client.secret_hash) {
      if (typeof secret !== "string" || !safeEqual(sha256(secret), client.secret_hash)) return null;
    }
    return client;
  }

  const tokenLimit = limit("token");

  app.post("/oauth/token", tokenLimit, (req, res) => {
    const client = authenticateClient(req);
    if (!client) return oauthError(res, 401, "invalid_client");
    const body = req.body ?? {};
    const grant = body.grant_type;
    const send = (issued, scope) => {
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Pragma", "no-cache");
      res.json({
        access_token: issued.access,
        token_type: "Bearer",
        expires_in: issued.expiresIn,
        refresh_token: issued.refresh,
        scope,
      });
    };

    if (grant === "authorization_code") {
      const { code, redirect_uri: redirectUri, code_verifier: verifier } = body;
      if (typeof code !== "string" || typeof redirectUri !== "string" || typeof verifier !== "string") {
        return oauthError(res, 400, "invalid_request", "code, redirect_uri and code_verifier are required");
      }
      if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) return oauthError(res, 400, "invalid_grant", "bad code_verifier");
      if (body.resource !== undefined && !sameResource(body.resource)) return oauthError(res, 400, "invalid_target");
      const result = store.consumeAuthCode(code);
      if (result.error) return oauthError(res, 400, result.error);
      const row = result.ok;
      if (row.client_id !== client.id || row.redirect_uri !== redirectUri || !safeEqual(pkceS256(verifier), row.code_challenge)) {
        return oauthError(res, 400, "invalid_grant");
      }
      const user = store.userById(row.user_id);
      if (!user || user.disabled) return oauthError(res, 400, "invalid_grant");
      const issued = store.issueOAuthTokens({
        clientId: client.id,
        userId: user.id,
        scope: row.scope,
        resource: row.resource,
        family: row.family,
      });
      return send(issued, row.scope);
    }

    if (grant === "refresh_token") {
      if (typeof body.refresh_token !== "string") return oauthError(res, 400, "invalid_request", "refresh_token is required");
      if (body.resource !== undefined && !sameResource(body.resource)) return oauthError(res, 400, "invalid_target");
      const result = store.rotateRefresh(body.refresh_token, client.id);
      if (result.error) return oauthError(res, 400, result.error);
      return send(result.ok, result.scope);
    }

    return oauthError(res, 400, "unsupported_grant_type");
  });

  app.post("/oauth/revoke", tokenLimit, (req, res) => {
    const client = authenticateClient(req);
    if (!client) return oauthError(res, 401, "invalid_client");
    if (typeof req.body?.token === "string") store.revokeOAuthToken(req.body.token, client.id);
    // RFC 7009: 200 whether or not the token existed.
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({});
  });

  // -------------------------------------------------------------------------
  // MCP endpoint: gate, then proxy (stateless, one server per request)
  // -------------------------------------------------------------------------

  function gate(req, res, next) {
    req.principal = null;
    if (config.authMode === "off") return next();
    const header = req.headers.authorization;
    if (header) {
      const token = bearerOf(req);
      const principal = token ? store.authenticateBearer(token) : null;
      // A bad token is always an error, even in `optional` mode — silently
      // treating it as anonymous would hide a revoked or mistyped token.
      if (!principal) {
        return unauthorized(res, {
          invalid: true,
          body: jsonRpcError(-32001, `Invalid or revoked token. Reconnect at ${abs("/connect")}`),
        });
      }
      req.principal = principal;
      return next();
    }
    if (config.authMode === "required") {
      return unauthorized(res, {
        body: jsonRpcError(-32001, `Authentication required. Sign in at ${abs("/connect")}`),
      });
    }
    next();
  }

  function buildServer(instructions, principal) {
    // Signed in = a valid bearer token. Only then is Nucleux Mobile merged in.
    const signedIn = !!principal;
    const server = new Server(
      { name: "nucleux", version: upstream.version },
      { capabilities: { tools: {} }, instructions }
    );
    server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: await surface.listTools(signedIn) }));
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const started = performance.now();
      let ok = false;
      let answeredBy = null;
      try {
        const { result, upstream: by } = await surface.callTool(
          request.params.name,
          request.params.arguments ?? {},
          signedIn
        );
        answeredBy = by;
        ok = !result?.isError;
        return result;
      } finally {
        // Tool name + timing only — never the arguments.
        try {
          store.logUsage({
            userId: principal?.user.id,
            kind: principal?.kind,
            tokenId: principal?.tokenId,
            tool: request.params.name,
            upstream: answeredBy,
            ms: performance.now() - started,
            ok,
          });
        } catch (err) {
          console.error("[nucleux-mcp] usage log failed:", err.message);
        }
      }
    });
    return server;
  }

  async function handleMcpPost(req, res) {
    const server = buildServer(await surface.instructions(!!req.principal), req.principal);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    // One server per request, so both must die with the response or every
    // call leaks a transport.
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("[nucleux-mcp] request failed:", err);
      if (!res.headersSent) res.status(500).json(jsonRpcError(-32603, "Internal server error"));
    }
  }

  app.post("/", gate, asyncRoute(handleMcpPost));

  // Stateless mode has no stream to resume and no session to delete. Gated
  // first so a client probing with a bad token learns it is bad.
  const notAllowed = (_req, res) =>
    res.status(405).json(jsonRpcError(-32000, "Method not allowed. This endpoint is POST-only."));
  app.get("/", gate, notAllowed);
  app.delete("/", gate, notAllowed);

  // Errors: JSON for API callers, never a stack trace.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    const status = err.status ?? err.statusCode ?? 500;
    if (status >= 500) console.error("[nucleux-mcp] unhandled:", err);
    if (res.headersSent) return;
    if (req.path === "/") res.status(status).json(jsonRpcError(status === 400 ? -32700 : -32603, status === 400 ? "Parse error" : "Internal server error"));
    else res.status(status).json({ error: status >= 500 ? "server_error" : "invalid_request" });
  });

  return app;
}
