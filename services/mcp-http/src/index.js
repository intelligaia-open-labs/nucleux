// Nucleux MCP over Streamable HTTP, token only.
//
// Serves the stdio-only `@nucleux/mcp` package at https://nucleux.in/mcp (see
// upstream.js) behind bearer tokens: self-serve tokens and connect codes for the
// site's MCP page, an OAuth 2.1 authorization server (consent, no login) for
// claude.ai and other MCP clients, and per-token usage tracking (see app.js).
// Any valid token also gets Nucleux Mobile when its private bundle is in vendor/
// (see surface.js). Configuration is all environment; see README.md.

import { loadEnvFile } from "./env.js";
import { loadConfig } from "./config.js";
import { openDb } from "./db.js";
import { createStore } from "./store.js";
import { createUpstream, createMobileUpstream } from "./upstream.js";
import { createApp } from "./app.js";

// The database and its -wal/-shm files hold token hashes (and old accounts' emails): owner only.
process.umask(0o077);
const fromFile = loadEnvFile();
if (fromFile.length) console.log(`[nucleux-mcp] loaded ${fromFile.length} settings from .env`);
const config = loadConfig();
const db = openDb(config.dbFile);
const store = createStore(db);
const upstream = createUpstream({ callTimeoutMs: config.callTimeoutMs });
const mobile = createMobileUpstream({ file: config.mobileFile, callTimeoutMs: config.callTimeoutMs });
const app = createApp({ config, store, upstream, mobile });

app.listen(config.port, config.host, () => {
  console.log(
    `[nucleux-mcp] listening on http://${config.host}:${config.port} as ${config.base} ` +
      `(auth ${config.authMode}, db ${db.driver}, admin ${config.adminPassword ? "on" : "off"})`
  );
  // Fail loudly at boot rather than on the first user request.
  upstream
    .listTools()
    .then((tools) => console.log(`[nucleux-mcp] ${tools.length} tools: ${tools.map((t) => t.name).join(", ")}`))
    .catch((err) => console.error("[nucleux-mcp] upstream unavailable at boot:", err));
  if (!mobile.available) {
    console.log(`[nucleux-mcp] mobile: no bundle at ${mobile.entry}; serving web only`);
  } else {
    mobile
      .info()
      .then((info) =>
        console.log(
          info
            ? `[nucleux-mcp] mobile: Nucleux Mobile ${info.version}, ${info.components} components (any valid token)`
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
