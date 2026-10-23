// Environment -> config. Everything the server reads from the environment is here.

import crypto from "node:crypto";

export function loadConfig(env = process.env) {
  const base = (env.NUCLEUX_PUBLIC_URL || "https://nucleux.in/mcp").replace(/\/+$/, "");
  const url = new URL(base);

  // Token only: the MCP endpoint needs a bearer token unless explicitly relaxed.
  const authMode = (env.NUCLEUX_AUTH || "required").toLowerCase();
  if (!["required", "optional", "off"].includes(authMode)) {
    throw new Error(`NUCLEUX_AUTH must be required, optional or off (got "${env.NUCLEUX_AUTH}")`);
  }

  let sessionSecret = env.NUCLEUX_SESSION_SECRET;
  if (!sessionSecret) {
    // Only keys the HMAC behind the CSRF tokens on the consent and admin forms,
    // so a random one just means forms open across a restart fail once. Still:
    // set it in production.
    sessionSecret = crypto.randomBytes(32).toString("hex");
    if (env.NODE_ENV === "production") {
      console.error("[nucleux-mcp] NUCLEUX_SESSION_SECRET is not set; using a random per-boot secret");
    }
  }

  const perHour = Number(env.NUCLEUX_ISSUE_PER_HOUR || 10);

  return {
    base, // e.g. https://nucleux.in/mcp — public URL of what this process serves at "/"
    origin: url.origin, // the only Origin allowed to call POST /tokens and /tokens/prompt
    basePath: url.pathname.replace(/\/+$/, ""), // "/mcp" (or "" when served at the root)
    secureCookies: url.protocol === "https:",
    // The site's MCP page: where /connect now points and where users get a token.
    site: env.NUCLEUX_SITE_URL || `${url.origin}/mcp`,
    authMode,
    sessionSecret,
    // Self-serve issuance, per IP per hour, for each of /tokens and /tokens/prompt.
    issuePerHour: Number.isFinite(perHour) && perHour > 0 ? perHour : 10,
    // HTTP Basic password for /admin (any user name). Unset = /admin is 404.
    adminPassword: env.NUCLEUX_ADMIN_PASSWORD || null,
    dbFile: env.NUCLEUX_DB || "./data/nucleux.db",
    trustProxy: env.NUCLEUX_TRUST_PROXY ?? "loopback",
    port: Number(env.NUCLEUX_MCP_PORT ?? 8118),
    host: env.NUCLEUX_MCP_HOST ?? "127.0.0.1",
    callTimeoutMs: Number(env.NUCLEUX_MCP_TIMEOUT_MS ?? 30_000),
    // The private Nucleux Mobile MCP bundle; relative to services/mcp-http. Missing = web only.
    mobileFile: env.NUCLEUX_MOBILE_MCP || "vendor/nucleux-mobile-mcp.cjs",
  };
}
