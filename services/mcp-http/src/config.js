// Environment -> config. Everything the server reads from the environment is here.

import crypto from "node:crypto";

const list = (v) =>
  String(v ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

export function loadConfig(env = process.env) {
  const base = (env.NUCLEUX_PUBLIC_URL || "https://nucleux.in/mcp").replace(/\/+$/, "");
  const url = new URL(base);

  const authMode = (env.NUCLEUX_AUTH || "optional").toLowerCase();
  if (!["required", "optional", "off"].includes(authMode)) {
    throw new Error(`NUCLEUX_AUTH must be required, optional or off (got "${env.NUCLEUX_AUTH}")`);
  }

  let sessionSecret = env.NUCLEUX_SESSION_SECRET;
  if (!sessionSecret) {
    // Only signs short-lived sign-in `state`, so a random one just means
    // in-flight sign-ins fail across a restart. Still: set it in production.
    sessionSecret = crypto.randomBytes(32).toString("hex");
    if (env.NODE_ENV === "production") {
      console.error("[nucleux-mcp] NUCLEUX_SESSION_SECRET is not set; using a random per-boot secret");
    }
  }

  const providers = {};
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.google = { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET };
  }
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    providers.github = { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET };
  }

  return {
    base, // e.g. https://nucleux.in/mcp — public URL of what this process serves at "/"
    origin: url.origin,
    basePath: url.pathname.replace(/\/+$/, ""), // "/mcp" (or "" when served at the root)
    secureCookies: url.protocol === "https:",
    authMode,
    sessionSecret,
    providers,
    allowedEmails: list(env.NUCLEUX_ALLOWED_EMAILS),
    allowedDomains: list(env.NUCLEUX_ALLOWED_DOMAINS).map((d) => d.replace(/^@/, "")),
    admins: list(env.NUCLEUX_ADMINS),
    dbFile: env.NUCLEUX_DB || "./data/nucleux.db",
    trustProxy: env.NUCLEUX_TRUST_PROXY ?? "loopback",
    port: Number(env.NUCLEUX_MCP_PORT ?? 8118),
    host: env.NUCLEUX_MCP_HOST ?? "127.0.0.1",
    callTimeoutMs: Number(env.NUCLEUX_MCP_TIMEOUT_MS ?? 30_000),
  };
}
