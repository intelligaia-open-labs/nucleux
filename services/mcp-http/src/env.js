// Loads secrets from the .env next to the service (KEY=VALUE lines).
//
// The server reads it itself rather than relying on `node --env-file`: pm2
// records `node_args` but does not always pass them to the process, which left
// the OAuth secrets unset in production. Variables already in the environment
// win, so pm2's `env` block and the shell can still override a value.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_ENV_FILE = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");

/** Parses KEY=VALUE lines; blank lines and # comments are skipped, one pair of surrounding quotes is removed. */
export function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2];
    if (value.length >= 2 && (value[0] === '"' || value[0] === "'") && value.at(-1) === value[0]) {
      value = value.slice(1, -1);
    }
    out[m[1]] = value;
  }
  return out;
}

/** Copies the file's values into `env` without overriding what is already set. Returns the keys it set. */
export function loadEnvFile(file = process.env.NUCLEUX_ENV_FILE || DEFAULT_ENV_FILE, env = process.env) {
  if (!existsSync(file)) return [];
  const set = [];
  for (const [key, value] of Object.entries(parseEnv(readFileSync(file, "utf8")))) {
    if (env[key] === undefined) {
      env[key] = value;
      set.push(key);
    }
  }
  return set;
}
