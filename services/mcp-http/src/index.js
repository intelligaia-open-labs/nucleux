// Nucleux MCP over Streamable HTTP, with accounts.
//
// Serves the stdio-only `@nucleux/mcp` package at https://nucleux.in/mcp (see
// upstream.js), and adds sign-in (Google/GitHub/emailed code), per-user tokens for coding
// agents, an OAuth 2.1 authorization server for claude.ai, and per-user usage
// tracking (see app.js). Signed-in users also get Nucleux Mobile when its
// private bundle is in vendor/ (see surface.js). Configuration is all
// environment; see README.md.

import { loadEnvFile } from "./env.js";
import { loadConfig } from "./config.js";
import { openDb } from "./db.js";
import { createStore } from "./store.js";
import { createUpstream, createMobileUpstream } from "./upstream.js";
import { providersFromConfig } from "./providers.js";
import { createApp } from "./app.js";
import { createMailer } from "./mailer.js";

// The database and its -wal/-shm files hold emails and token hashes: owner only.
process.umask(0o077);
const fromFile = loadEnvFile();
if (fromFile.length) console.log(`[nucleux-mcp] loaded ${fromFile.length} settings from .env`);
const config = loadConfig();
const db = openDb(config.dbFile);
const store = createStore(db);
const upstream = createUpstream({ callTimeoutMs: config.callTimeoutMs });
const mobile = createMobileUpstream({ file: config.mobileFile, callTimeoutMs: config.callTimeoutMs });
const providers = providersFromConfig(config);
// Email sign-in exists only when SMTP is configured (SMTP_USER + SMTP_PASS).
const mailer = config.email ? createMailer(config.email) : null;
const app = createApp({ config, store, upstream, mobile, providers, mailer });

app.listen(config.port, config.host, () => {
  console.log(
    `[nucleux-mcp] listening on http://${config.host}:${config.port} as ${config.base} ` +
      `(auth ${config.authMode}, db ${db.driver}, sign-in: ${[...Object.keys(providers), ...(mailer ? ["email"] : [])].join(", ") || "none"})`
  );
  // Fail loudly at boot rather than on the first user request.
  upstream
    .listTools()
    .then((tools) => console.log(`[nucleux-mcp] ${tools.length} tools: ${tools.map((t) => t.name).join(", ")}`))
    .catch((err) => console.error("[nucleux-mcp] upstream unavailable at boot:", err));
  // Check the SMTP login once at boot so a bad app password shows up in the log, not on a user's screen.
  mailer
    ?.verify()
    .then(() => console.log(`[nucleux-mcp] email sign-in: SMTP ${config.email.host}:${config.email.port} ok`))
    .catch((err) => console.error(`[nucleux-mcp] email sign-in: SMTP check failed (${[err?.code ?? "error", err?.responseCode].filter(Boolean).join(" ")})`));
  if (!mobile.available) {
    console.log(`[nucleux-mcp] mobile: no bundle at ${mobile.entry}; serving web only`);
  } else {
    mobile
      .info()
      .then((info) =>
        console.log(
          info
            ? `[nucleux-mcp] mobile: Nucleux Mobile ${info.version}, ${info.components} components (signed-in users)`
            : "[nucleux-mcp] mobile: bundle present but not answering; serving web only"
        )
      );
  }
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    try {
      db.close();
    } finally {
      process.exit(0);
    }
  });
}
