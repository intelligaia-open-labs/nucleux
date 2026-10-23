// The HTTP app, token only: MCP proxy (bearer-gated + tracked), self-serve
// tokens and connect codes for the site's MCP page, CLI code exchange, an
// OAuth 2.1 authorization server for MCP clients (consent, no login), and a
// Basic-auth /admin. There is no sign-in and no session.
//
// nginx strips the public `/mcp` prefix, so routes here are `/`, `/tokens`,
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
import { connectPrompt } from "./prompt.js";
import {
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
  hmac,
} from "./security.js";

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_CSS = require.resolve("@nucleux/tokens/styles.css");

const PRE_COOKIE = "nx_pre"; // CSRF for the consent and admin forms (double submit, HMAC-bound)
const HOUR = 3600 * 1000;

const DEFAULT_LIMITS = {
  admin: { windowMs: 10 * 60 * 1000, max: 30 },
  exchange: { windowMs: 10 * 60 * 1000, max: 20 },
  register: { windowMs: 60 * 60 * 1000, max: 20 },
  token: { windowMs: 60 * 1000, max: 60 },
  consent: { windowMs: 10 * 60 * 1000, max: 30 },
  // Self-serve issuance; `max` comes from config.issuePerHour unless a test overrides it.
  issueToken: { windowMs: HOUR },
  issuePrompt: { windowMs: HOUR },
  playground: { windowMs: HOUR },
};

const jsonRpcError = (code, message) => ({ jsonrpc: "2.0", error: { code, message }, id: null });

export function createApp({ config, store, upstream, mobile = null, yantra = null, limits = {} }) {
  // Web for everyone; web + Nucleux Mobile for any valid token (surface.js).
  const surface = createSurface({ web: upstream, mobile });
  const pages = createPages(config);
  const p = (route) => `${config.basePath}${route}`;
  const abs = (route) => `${config.base}${route}`;
  const resourceMetadataUrl = abs("/.well-known/oauth-protected-resource");
  const limit = (name) =>
    rateLimiter({ name, max: config.issuePerHour, ...DEFAULT_LIMITS[name], ...limits[name], now: store.now });

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
  // Helpers: CSRF and page headers
  // -------------------------------------------------------------------------

  // The consent and admin forms have no session to hold a CSRF token, so the
  // browser gets a random `nx_pre` cookie and forms carry HMAC(secret, cookie).
  // A cross-site page can neither read the cookie nor forge the HMAC, and the
  // Origin check below rejects cross-site posts outright.
  function preCsrf(req, res) {
    let pre = parseCookies(req.headers.cookie)[PRE_COOKIE];
    if (typeof pre !== "string" || !/^[0-9A-Za-z]{32}$/.test(pre)) {
      pre = newOpaque(32);
      appendSetCookie(res, serializeCookie(PRE_COOKIE, pre, { path: config.basePath || "/", secure: config.secureCookies, maxAge: 24 * HOUR }));
    }
    return hmac(config.sessionSecret, `pre:${pre}`);
  }
  function preCsrfOk(req) {
    const origin = req.headers.origin;
    if (origin && origin !== config.origin) return false; // includes "null"
    const pre = parseCookies(req.headers.cookie)[PRE_COOKIE];
    const token = req.body?._csrf;
    return typeof pre === "string" && typeof token === "string" && safeEqual(token, hmac(config.sessionSecret, `pre:${pre}`));
  }

  function pageHeaders(res, { formAction = [] } = {}) {
    const forms = ["'self'", ...formAction].join(" ");
    res.setHeader(
      "Content-Security-Policy",
      `default-src 'none'; style-src 'self'; script-src 'none'; img-src 'self' data:; connect-src 'none'; form-action ${forms}; frame-ancestors 'none'; base-uri 'none'`
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
      resource_documentation: config.site,
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
      service_documentation: config.site,
    });
  };
  for (const suffix of ["", "/mcp"]) {
    app.get(`/.well-known/oauth-protected-resource${suffix}`, protectedResource);
    app.get(`/.well-known/oauth-authorization-server${suffix}`, authServerMetadata);
    app.get(`/.well-known/openid-configuration${suffix}`, authServerMetadata);
  }

  // -------------------------------------------------------------------------
  // The old Connect page now lives on the site
  // -------------------------------------------------------------------------

  const setupUrl = `${config.site}#setup`;
  const toSite = (_req, res) => res.redirect(301, setupUrl);
  app.get("/connect", toSite);
  app.get("/connect/*rest", toSite);
  app.get("/login", toSite);

  // -------------------------------------------------------------------------
  // Self-serve issuance for the site's MCP page (same origin only)
  // -------------------------------------------------------------------------

  // Browsers always send Origin on POST, and a cross-site page can't forge it,
  // so requiring our own origin keeps other sites from minting tokens through a
  // visitor's browser. (A script can send any Origin; the per-IP limit covers that.)
  function sameOriginJson(req, res, next) {
    res.setHeader("Cache-Control", "no-store");
    if (req.headers.origin !== config.origin) {
      res.status(403).json({ error: "forbidden_origin", error_description: `Only ${config.origin} may call this.` });
      return;
    }
    next();
  }

  const today = () => new Date(store.now()).toISOString().slice(0, 10);

  // A one-time connect code for `npx -y @nucleux/mcp add --code …`, plus the
  // prompt that tells a coding agent how to run it. /cli/exchange turns the
  // code into a token labelled with the machine's hostname.
  app.post("/tokens/prompt", sameOriginJson, limit("issuePrompt"), (_req, res) => {
    const user = store.createAnonUser();
    const { code, expires } = store.createCliCode(user.id);
    const shown = formatCliCode(code);
    res.json({
      code: shown,
      expires: new Date(expires).toISOString(),
      prompt: connectPrompt({ code: shown, base: config.base, site: config.site }),
    });
  });

  // A token to paste into an agent's config as `Authorization: Bearer …`. Shown once.
  app.post("/tokens", sameOriginJson, limit("issueToken"), (_req, res) => {
    const user = store.createAnonUser();
    const { token } = store.createToken(user.id, `web · ${today()}`);
    res.json({ token });
  });

  // -------------------------------------------------------------------------
  // Playground planner: nucleux.in/playground asks Yantra which patterns to use
  // -------------------------------------------------------------------------

  // Same origin and per-IP limits as token issuance. The page sends the prompt
  // and its own catalog (ids, names, one-line summaries); the reply only ever
  // names ids from that catalog. Any failure is a 502/503 and the page falls
  // back to its built-in matching.
  app.post("/playground", sameOriginJson, rateLimiter({ name: "playground", max: config.playgroundPerHour, ...DEFAULT_LIMITS.playground, ...limits.playground, now: store.now }), async (req, res) => {
    if (!yantra) {
      res.status(503).json({ error: "unavailable" });
      return;
    }
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim().slice(0, 2000) : "";
    const patterns = (Array.isArray(req.body?.patterns) ? req.body.patterns : [])
      .filter((p) => p && typeof p.id === "string" && p.id.length <= 80)
      .slice(0, 400)
      .map((p) => ({ id: p.id, name: String(p.name ?? p.id).slice(0, 80), summary: String(p.summary ?? "").slice(0, 160) }));
    if (!prompt || !patterns.length) {
      res.status(400).json({ error: "invalid_request", error_description: "prompt and patterns are required." });
      return;
    }
    try {
      res.json(await yantra.plan({ prompt, patterns }));
    } catch (err) {
      console.error(`[nucleux-mcp] playground: ${err.message}`);
      res.status(502).json({ error: "planner_failed" });
    }
  });

  // -------------------------------------------------------------------------
  // Admin: HTTP Basic against NUCLEUX_ADMIN_PASSWORD (any user name); 404 if unset
  // -------------------------------------------------------------------------

  const adminLimit = limit("admin");
  function adminAuth(req, res, next) {
    if (!config.adminPassword) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const m = /^Basic\s+(\S+)$/i.exec(req.headers.authorization ?? "");
    const decoded = m ? Buffer.from(m[1], "base64").toString("utf8") : "";
    const password = decoded.includes(":") ? decoded.slice(decoded.indexOf(":") + 1) : null;
    // Compare hashes so the comparison is constant-time whatever the lengths.
    if (password === null || !safeEqual(sha256(password), sha256(config.adminPassword))) {
      res.setHeader("WWW-Authenticate", 'Basic realm="Nucleux admin", charset="UTF-8"');
      res.setHeader("Cache-Control", "no-store");
      res.status(401).type("text").send("Authentication required.");
      return;
    }
    next();
  }

  const ADMIN_NOTICES = { revoked: "Revoked.", disabled: "Principal disabled and its access revoked.", enabled: "Principal enabled." };
  app.get("/admin", adminLimit, adminAuth, (req, res) => {
    sendPage(res, pages.admin({ csrf: preCsrf(req, res), overview: store.adminOverview(), notice: ADMIN_NOTICES[req.query.done] }));
  });

  function adminPost(handler) {
    return (req, res) => {
      if (!preCsrfOk(req)) {
        sendPage(res, pages.message({ title: "Request expired", text: "Reload the admin page and try again." }), 403);
        return;
      }
      const done = handler(req);
      if (!done) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      res.redirect(303, abs(`/admin?done=${done}`));
    };
  }

  app.post(
    "/admin/users/:id/:action",
    adminLimit,
    adminAuth,
    adminPost((req) => {
      const id = Number(req.params.id);
      switch (req.params.action) {
        case "disable":
          store.setUserDisabled(id, true);
          store.revokeAllForUser(id);
          return "disabled";
        case "enable":
          store.setUserDisabled(id, false);
          return "enabled";
        case "revoke":
          store.revokeAllForUser(id);
          return "revoked";
        default:
          return null;
      }
    })
  );

  app.post(
    "/admin/tokens/:id/revoke",
    adminLimit,
    adminAuth,
    adminPost((req) => {
      store.revokeTokenById(Number(req.params.id));
      return "revoked";
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

  // No login: anyone may connect an MCP client. The consent page is what stops
  // a site from silently minting grants (CSRF + Origin on the POST).
  app.get("/oauth/authorize", (req, res) => {
    const check = checkAuthorize(req.query);
    if (check.fatal) {
      sendPage(res, pages.message({ title: "Cannot connect", text: check.fatal }), 400);
      return;
    }
    if (check.redirectError) {
      const { uri, state, error, description } = check.redirectError;
      return redirectBack(res, uri, { error, error_description: description, state });
    }
    const redirect = new URL(check.params.redirect_uri);
    sendPage(
      res,
      pages.consent({
        client: check.client,
        csrf: preCsrf(req, res),
        params: check.params,
        redirectHost: redirect.host,
      }),
      200,
      // Browsers apply form-action to the redirect that follows the POST.
      { formAction: [redirect.origin] }
    );
  });

  app.post("/oauth/authorize", limit("consent"), (req, res) => {
    if (!preCsrfOk(req)) {
      sendPage(res, pages.message({ title: "Request expired", text: "Go back to your app and connect again." }), 403);
      return;
    }
    const check = checkAuthorize(req.body ?? {});
    if (check.fatal) {
      sendPage(res, pages.message({ title: "Cannot connect", text: check.fatal }), 400);
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
    // One anonymous principal per grant: its usage and revocation stay separate.
    const user = store.createAnonUser();
    const code = store.createAuthCode({
      clientId: client.id,
      userId: user.id,
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
          body: jsonRpcError(-32001, `Invalid or revoked token. Get a new one at ${config.site}`),
        });
      }
      req.principal = principal;
      return next();
    }
    if (config.authMode === "required") {
      return unauthorized(res, {
        body: jsonRpcError(-32001, `A Nucleux token is required. Get one at ${config.site}`),
      });
    }
    next();
  }

  function buildServer(instructions, principal) {
    // A valid bearer token gets Nucleux Mobile merged in.
    const hasToken = !!principal;
    const server = new Server(
      { name: "nucleux", version: upstream.version },
      { capabilities: { tools: {} }, instructions }
    );
    server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: await surface.listTools(hasToken) }));
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const started = performance.now();
      let ok = false;
      let answeredBy = null;
      try {
        const { result, upstream: by } = await surface.callTool(
          request.params.name,
          request.params.arguments ?? {},
          hasToken
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
