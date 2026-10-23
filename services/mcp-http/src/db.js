// SQLite storage for accounts, tokens, OAuth state and usage.
//
// better-sqlite3 is pinned to 10.1.0 because that is the last release with a
// prebuilt binary for Node 21 (ABI v120), which is what the box runs. If the
// native module cannot load (say the box moves to a newer Node before the pin
// is bumped) we fall back to the built-in `node:sqlite` (Node >= 22.5) rather
// than refusing to boot. Both expose the same prepare/run/get/all surface.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function openRaw(file) {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  try {
    const Database = require("better-sqlite3");
    const db = new Database(file);
    return { db, driver: "better-sqlite3" };
  } catch (err) {
    let DatabaseSync;
    try {
      ({ DatabaseSync } = require("node:sqlite"));
    } catch {
      throw err;
    }
    console.error("[nucleux-mcp] better-sqlite3 unavailable, using node:sqlite:", err.message);
    return { db: new DatabaseSync(file), driver: "node:sqlite" };
  }
}

// Each entry runs once, in order, recorded in PRAGMA user_version.
const MIGRATIONS = [
  `
  CREATE TABLE users (
    id          INTEGER PRIMARY KEY,
    provider    TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    email       TEXT NOT NULL,
    name        TEXT,
    avatar      TEXT,
    created     INTEGER NOT NULL,
    last_seen   INTEGER,
    disabled    INTEGER NOT NULL DEFAULT 0,
    UNIQUE (provider, provider_id)
  );
  CREATE INDEX users_email ON users (email);

  CREATE TABLE sessions (
    id_hash   TEXT PRIMARY KEY,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    csrf      TEXT NOT NULL,
    created   INTEGER NOT NULL,
    expires   INTEGER NOT NULL
  );
  CREATE INDEX sessions_user ON sessions (user_id);

  CREATE TABLE tokens (
    id        INTEGER PRIMARY KEY,
    hash      TEXT NOT NULL UNIQUE,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label     TEXT NOT NULL,
    created   INTEGER NOT NULL,
    last_used INTEGER,
    revoked   INTEGER
  );
  CREATE INDEX tokens_user ON tokens (user_id);

  CREATE TABLE cli_codes (
    hash      TEXT PRIMARY KEY,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created   INTEGER NOT NULL,
    expires   INTEGER NOT NULL,
    used      INTEGER
  );

  CREATE TABLE oauth_clients (
    id            TEXT PRIMARY KEY,
    secret_hash   TEXT,
    name          TEXT NOT NULL,
    redirect_uris TEXT NOT NULL,
    auth_method   TEXT NOT NULL,
    metadata      TEXT NOT NULL,
    created       INTEGER NOT NULL
  );

  CREATE TABLE oauth_codes (
    hash           TEXT PRIMARY KEY,
    client_id      TEXT NOT NULL REFERENCES oauth_clients(id) ON DELETE CASCADE,
    user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    redirect_uri   TEXT NOT NULL,
    code_challenge TEXT NOT NULL,
    scope          TEXT NOT NULL,
    resource       TEXT,
    family         TEXT NOT NULL,
    created        INTEGER NOT NULL,
    expires        INTEGER NOT NULL,
    used           INTEGER
  );

  CREATE TABLE oauth_tokens (
    id              INTEGER PRIMARY KEY,
    access_hash     TEXT NOT NULL UNIQUE,
    refresh_hash    TEXT NOT NULL UNIQUE,
    client_id       TEXT NOT NULL REFERENCES oauth_clients(id) ON DELETE CASCADE,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scope           TEXT NOT NULL,
    resource        TEXT,
    family          TEXT NOT NULL,
    created         INTEGER NOT NULL,
    access_expires  INTEGER NOT NULL,
    refresh_expires INTEGER NOT NULL,
    last_used       INTEGER,
    revoked         INTEGER
  );
  CREATE INDEX oauth_tokens_user ON oauth_tokens (user_id);
  CREATE INDEX oauth_tokens_family ON oauth_tokens (family);

  CREATE TABLE usage (
    id         INTEGER PRIMARY KEY,
    user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    token_kind TEXT,
    token_id   INTEGER,
    tool       TEXT NOT NULL,
    ts         INTEGER NOT NULL,
    ms         INTEGER NOT NULL,
    ok         INTEGER NOT NULL
  );
  CREATE INDEX usage_user_ts ON usage (user_id, ts);
  CREATE INDEX usage_ts ON usage (ts);
  `,
  // 2: which upstream answered a call ("web", "mobile", "web+mobile"); NULL for older rows.
  `
  ALTER TABLE usage ADD COLUMN upstream TEXT;
  `,
];

export function openDb(file = ":memory:") {
  const { db, driver } = openRaw(file);
  db.exec("PRAGMA foreign_keys = ON");
  if (file !== ":memory:") {
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA busy_timeout = 5000");
  }

  const version = db.prepare("PRAGMA user_version").get().user_version;
  for (let i = version; i < MIGRATIONS.length; i++) {
    db.exec("BEGIN");
    try {
      db.exec(MIGRATIONS[i]);
      db.exec(`PRAGMA user_version = ${i + 1}`);
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  }
  if (file !== ":memory:") {
    try {
      fs.chmodSync(file, 0o600);
    } catch {
      // best effort
    }
  }

  // Statement cache, so hot paths do not re-prepare.
  const cache = new Map();
  const stmt = (sql) => {
    let s = cache.get(sql);
    if (!s) {
      s = db.prepare(sql);
      cache.set(sql, s);
    }
    return s;
  };

  return {
    driver,
    raw: db,
    run: (sql, params = {}) => stmt(sql).run(params),
    get: (sql, params = {}) => stmt(sql).get(params),
    all: (sql, params = {}) => stmt(sql).all(params),
    tx(fn) {
      db.exec("BEGIN IMMEDIATE");
      try {
        const out = fn();
        db.exec("COMMIT");
        return out;
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
    },
    close: () => db.close(),
  };
}
