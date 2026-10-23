// Nucleux MCP over Streamable HTTP, with accounts.
//
// Serves the stdio-only `@nucleux/mcp` package at https://nucleux.in/mcp (see
// upstream.js), and adds sign-in (Google/GitHub), per-user tokens for coding
// agents, an OAuth 2.1 authorization server for claude.ai, and per-user usage
// tracking (see app.js). Configuration is all environment; see README.md.

import { loadEnvFile } from "./env.js";
import { loadConfig } from "./config.js";
import { openDb } from "./db.js";
import { createStore } from "./store.js";
import { createUpstream } from "./upstream.js";
import { providersFromConfig } from "./providers.js";
import { createApp } from "./app.js";

// The database and its -wal/-shm files hold emails and token hashes: owner only.
process.umask(0o077);
const fromFile = loadEnvFile();
if (fromFile.length) console.log(`[nucleux-mcp] loaded ${fromFile.length} settings from .env`);
const config = loadConfig();
const db = openDb(config.dbFile);
const store = createStore(db);
const upstream = createUpstream({ callTimeoutMs: config.callTimeoutMs });
const providers = providersFromConfig(config);
const app = createApp({ config, store, upstream, providers });

app.listen(config.port, config.host, () => {
  console.log(
    `[nucleux-mcp] listening on http://${config.host}:${config.port} as ${config.base} ` +
      `(auth ${config.authMode}, db ${db.driver}, sign-in: ${Object.keys(providers).join(", ") || "none"})`
  );
  // Fail loudly at boot rather than on the first user request.
  upstream
    .listTools()
    .then((tools) => console.log(`[nucleux-mcp] ${tools.length} tools: ${tools.map((t) => t.name).join(", ")}`))
    .catch((err) => console.error("[nucleux-mcp] upstream unavailable at boot:", err));
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
