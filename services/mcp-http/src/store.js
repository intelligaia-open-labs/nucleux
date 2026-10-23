// Data access. Every secret (session id, token, code) is stored as its SHA-256;
// the plaintext exists only in the response that hands it out.

import {
  sha256,
  safeEqual,
  newPersonalToken,
  newCliCode,
  newAccessToken,
  newRefreshToken,
  newOpaque,
  PAT_RE,
} from "./security.js";

export const SESSION_TTL = 30 * 24 * 3600 * 1000;
export const CLI_CODE_TTL = 10 * 60 * 1000;
export const OAUTH_CODE_TTL = 5 * 60 * 1000;
export const ACCESS_TTL = 3600 * 1000;
export const REFRESH_TTL = 60 * 24 * 3600 * 1000;
const DAY = 24 * 3600 * 1000;

export function createStore(db, { now = () => Date.now() } = {}) {
  const store = {
    now,

    // ---- users ------------------------------------------------------------
    upsertUser({ provider, providerId, email, name, avatar }) {
      const t = now();
      const existing = db.get("SELECT * FROM users WHERE provider = @provider AND provider_id = @providerId", {
        provider,
        providerId: String(providerId),
      });
      if (existing) {
        db.run(
          "UPDATE users SET email = @email, name = @name, avatar = @avatar, last_seen = @t WHERE id = @id",
          { email, name: name ?? null, avatar: avatar ?? null, t, id: existing.id }
        );
        return store.userById(existing.id);
      }
      const info = db.run(
        `INSERT INTO users (provider, provider_id, email, name, avatar, created, last_seen)
         VALUES (@provider, @providerId, @email, @name, @avatar, @t, @t)`,
        { provider, providerId: String(providerId), email, name: name ?? null, avatar: avatar ?? null, t }
      );
      return store.userById(Number(info.lastInsertRowid));
    },
    userById: (id) => db.get("SELECT * FROM users WHERE id = @id", { id }),
    touchUser(id) {
      db.run("UPDATE users SET last_seen = @t WHERE id = @id", { t: now(), id });
    },
    setUserDisabled(id, disabled) {
      db.tx(() => {
        db.run("UPDATE users SET disabled = @d WHERE id = @id", { d: disabled ? 1 : 0, id });
        if (disabled) {
          db.run("DELETE FROM sessions WHERE user_id = @id", { id });
        }
      });
    },
    revokeAllForUser(id) {
      const t = now();
      db.tx(() => {
        db.run("UPDATE tokens SET revoked = @t WHERE user_id = @id AND revoked IS NULL", { t, id });
        db.run("UPDATE oauth_tokens SET revoked = @t WHERE user_id = @id AND revoked IS NULL", { t, id });
      });
    },

    // ---- sessions ---------------------------------------------------------
    createSession(userId) {
      const id = newOpaque(43);
      const csrf = newOpaque(32);
      const t = now();
      db.run(
        "INSERT INTO sessions (id_hash, user_id, csrf, created, expires) VALUES (@h, @u, @csrf, @t, @e)",
        { h: sha256(id), u: userId, csrf, t, e: t + SESSION_TTL }
      );
      return { id, csrf };
    },
    // Returns { session, user } for a live session of an enabled user.
    getSession(id) {
      if (!id || typeof id !== "string" || id.length > 100) return null;
      const row = db.get(
        `SELECT s.csrf, s.expires, s.id_hash, u.* FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.id_hash = @h`,
        { h: sha256(id) }
      );
      if (!row || row.expires < now() || row.disabled) return null;
      const { csrf, expires, id_hash, ...user } = row;
      return { session: { csrf, expires, idHash: id_hash }, user };
    },
    deleteSession(id) {
      if (id) db.run("DELETE FROM sessions WHERE id_hash = @h", { h: sha256(id) });
    },

    // ---- personal access tokens -------------------------------------------
    createToken(userId, label) {
      const token = newPersonalToken();
      const info = db.run(
        "INSERT INTO tokens (hash, user_id, label, created) VALUES (@h, @u, @l, @t)",
        { h: sha256(token), u: userId, l: label, t: now() }
      );
      return { token, id: Number(info.lastInsertRowid) };
    },
    listTokens: (userId) =>
      db.all(
        "SELECT id, label, created, last_used FROM tokens WHERE user_id = @u AND revoked IS NULL ORDER BY created DESC",
        { u: userId }
      ),
    revokeToken(userId, tokenId) {
      return db.run("UPDATE tokens SET revoked = @t WHERE id = @id AND user_id = @u AND revoked IS NULL", {
        t: now(),
        id: tokenId,
        u: userId,
      }).changes;
    },

    // `nx_` token revoking itself (CLI logout). Returns true if it was live.
    revokeTokenByValue(token) {
      if (typeof token !== "string" || !PAT_RE.test(token)) return false;
      const h = sha256(token);
      const row = db.get("SELECT id, hash, revoked FROM tokens WHERE hash = @h", { h });
      if (!row || !safeEqual(row.hash, h) || row.revoked) return false;
      return db.run("UPDATE tokens SET revoked = @t WHERE id = @id AND revoked IS NULL", { t: now(), id: row.id }).changes === 1;
    },

    // ---- CLI connect codes -------------------------------------------------
    createCliCode(userId) {
      const code = newCliCode();
      const t = now();
      db.run("INSERT INTO cli_codes (hash, user_id, created, expires) VALUES (@h, @u, @t, @e)", {
        h: sha256(code),
        u: userId,
        t,
        e: t + CLI_CODE_TTL,
      });
      // Opportunistic cleanup of long-dead codes.
      db.run("DELETE FROM cli_codes WHERE expires < @old", { old: t - DAY });
      return { code, expires: t + CLI_CODE_TTL };
    },
    // Single use: the UPDATE is the claim, so two racing exchanges cannot both win.
    consumeCliCode(code) {
      const t = now();
      const h = sha256(code);
      return db.tx(() => {
        const claimed = db.run(
          "UPDATE cli_codes SET used = @t WHERE hash = @h AND used IS NULL AND expires >= @t",
          { t, h }
        ).changes;
        if (claimed !== 1) return null;
        const row = db.get("SELECT user_id FROM cli_codes WHERE hash = @h", { h });
        const user = store.userById(row.user_id);
        if (!user || user.disabled) return null;
        return user;
      });
    },

    // ---- bearer authentication ----------------------------------------------
    // Returns { user, kind: "pat"|"oauth", tokenId } or null.
    authenticateBearer(token) {
      if (typeof token !== "string" || token.length > 200) return null;
      const t = now();
      const h = sha256(token);
      if (token.startsWith("nx_")) {
        if (!PAT_RE.test(token)) return null;
        const row = db.get("SELECT * FROM tokens WHERE hash = @h", { h });
        if (!row || !safeEqual(row.hash, h) || row.revoked) return null;
        const user = store.userById(row.user_id);
        if (!user || user.disabled) return null;
        db.run("UPDATE tokens SET last_used = @t WHERE id = @id", { t, id: row.id });
        db.run("UPDATE users SET last_seen = @t WHERE id = @id", { t, id: user.id });
        return { user, kind: "pat", tokenId: row.id };
      }
      const row = db.get("SELECT * FROM oauth_tokens WHERE access_hash = @h", { h });
      if (!row || !safeEqual(row.access_hash, h) || row.revoked || row.access_expires < t) return null;
      const user = store.userById(row.user_id);
      if (!user || user.disabled) return null;
      db.run("UPDATE oauth_tokens SET last_used = @t WHERE id = @id", { t, id: row.id });
      db.run("UPDATE users SET last_seen = @t WHERE id = @id", { t, id: user.id });
      return { user, kind: "oauth", tokenId: row.id, clientId: row.client_id };
    },

    // ---- OAuth clients (dynamic registration) --------------------------------
    createClient({ name, redirectUris, authMethod, metadata }) {
      const id = `nxc_${newOpaque(24)}`;
      const secret = authMethod === "client_secret_post" || authMethod === "client_secret_basic" ? `nxs_${newOpaque(43)}` : null;
      db.run(
        `INSERT INTO oauth_clients (id, secret_hash, name, redirect_uris, auth_method, metadata, created)
         VALUES (@id, @s, @n, @r, @m, @md, @t)`,
        {
          id,
          s: secret ? sha256(secret) : null,
          n: name,
          r: JSON.stringify(redirectUris),
          m: authMethod,
          md: JSON.stringify(metadata),
          t: now(),
        }
      );
      return { id, secret };
    },
    getClient(id) {
      if (typeof id !== "string" || id.length > 100) return null;
      const row = db.get("SELECT * FROM oauth_clients WHERE id = @id", { id });
      if (!row) return null;
      return { ...row, redirectUris: JSON.parse(row.redirect_uris) };
    },

    // ---- OAuth authorization codes ------------------------------------------
    createAuthCode({ clientId, userId, redirectUri, codeChallenge, scope, resource }) {
      const code = newOpaque(43);
      const t = now();
      db.run(
        `INSERT INTO oauth_codes (hash, client_id, user_id, redirect_uri, code_challenge, scope, resource, family, created, expires)
         VALUES (@h, @c, @u, @r, @cc, @s, @res, @f, @t, @e)`,
        {
          h: sha256(code),
          c: clientId,
          u: userId,
          r: redirectUri,
          cc: codeChallenge,
          s: scope,
          res: resource ?? null,
          f: newOpaque(16),
          t,
          e: t + OAUTH_CODE_TTL,
        }
      );
      db.run("DELETE FROM oauth_codes WHERE expires < @old", { old: t - DAY });
      return code;
    },
    // Returns { ok: row } or { error } — a replayed code revokes what it minted.
    consumeAuthCode(code) {
      const t = now();
      const h = sha256(code);
      return db.tx(() => {
        const row = db.get("SELECT * FROM oauth_codes WHERE hash = @h", { h });
        if (!row) return { error: "invalid_grant" };
        if (row.used) {
          db.run("UPDATE oauth_tokens SET revoked = @t WHERE family = @f AND revoked IS NULL", { t, f: row.family });
          return { error: "invalid_grant" };
        }
        db.run("UPDATE oauth_codes SET used = @t WHERE hash = @h", { t, h });
        if (row.expires < t) return { error: "invalid_grant" };
        return { ok: row };
      });
    },

    // ---- OAuth tokens ----------------------------------------------------------
    issueOAuthTokens({ clientId, userId, scope, resource, family }) {
      const access = newAccessToken();
      const refresh = newRefreshToken();
      const t = now();
      db.run(
        `INSERT INTO oauth_tokens (access_hash, refresh_hash, client_id, user_id, scope, resource, family, created, access_expires, refresh_expires)
         VALUES (@a, @r, @c, @u, @s, @res, @f, @t, @ae, @re)`,
        {
          a: sha256(access),
          r: sha256(refresh),
          c: clientId,
          u: userId,
          s: scope,
          res: resource ?? null,
          f: family,
          t,
          ae: t + ACCESS_TTL,
          re: t + REFRESH_TTL,
        }
      );
      return { access, refresh, expiresIn: ACCESS_TTL / 1000 };
    },
    // Rotation: the old pair dies; presenting a rotated refresh token again
    // revokes the whole family (RFC 9700 refresh token reuse detection).
    rotateRefresh(refresh, clientId) {
      const t = now();
      const h = sha256(refresh);
      return db.tx(() => {
        const row = db.get("SELECT * FROM oauth_tokens WHERE refresh_hash = @h", { h });
        if (!row || row.client_id !== clientId) return { error: "invalid_grant" };
        if (row.revoked) {
          db.run("UPDATE oauth_tokens SET revoked = @t WHERE family = @f AND revoked IS NULL", { t, f: row.family });
          return { error: "invalid_grant" };
        }
        if (row.refresh_expires < t) return { error: "invalid_grant" };
        const user = store.userById(row.user_id);
        if (!user || user.disabled) return { error: "invalid_grant" };
        db.run("UPDATE oauth_tokens SET revoked = @t WHERE id = @id", { t, id: row.id });
        const issued = store.issueOAuthTokens({
          clientId,
          userId: row.user_id,
          scope: row.scope,
          resource: row.resource,
          family: row.family,
        });
        return { ok: issued, scope: row.scope };
      });
    },
    // RFC 7009: revoke the pair the token belongs to (whichever half it is).
    revokeOAuthToken(token, clientId) {
      const h = sha256(String(token));
      const row = db.get("SELECT * FROM oauth_tokens WHERE access_hash = @h OR refresh_hash = @h", { h });
      if (!row || row.client_id !== clientId) return 0;
      return db.run("UPDATE oauth_tokens SET revoked = @t WHERE family = @f AND revoked IS NULL", {
        t: now(),
        f: row.family,
      }).changes;
    },
    listConnectedApps: (userId) =>
      db.all(
        `SELECT c.id AS client_id, c.name, MIN(t.created) AS created, MAX(t.last_used) AS last_used
         FROM oauth_tokens t JOIN oauth_clients c ON c.id = t.client_id
         WHERE t.user_id = @u AND t.revoked IS NULL AND t.refresh_expires >= @now
         GROUP BY c.id ORDER BY created DESC`,
        { u: userId, now: now() }
      ),
    revokeApp(userId, clientId) {
      return db.run(
        "UPDATE oauth_tokens SET revoked = @t WHERE user_id = @u AND client_id = @c AND revoked IS NULL",
        { t: now(), u: userId, c: clientId }
      ).changes;
    },

    // ---- usage ------------------------------------------------------------------
    // `upstream`: which catalog answered — "web", "mobile" or "web+mobile".
    logUsage({ userId, kind, tokenId, tool, upstream, ms, ok }) {
      db.run(
        "INSERT INTO usage (user_id, token_kind, token_id, tool, upstream, ts, ms, ok) VALUES (@u, @k, @tid, @tool, @up, @ts, @ms, @ok)",
        {
          u: userId ?? null,
          k: kind ?? null,
          tid: tokenId ?? null,
          tool: String(tool).slice(0, 100),
          up: upstream ? String(upstream).slice(0, 20) : null,
          ts: now(),
          ms: Math.max(0, Math.round(ms)),
          ok: ok ? 1 : 0,
        }
      );
    },
    usageSummary(userId) {
      const t = now();
      const count = (since) =>
        db.get("SELECT COUNT(*) AS n FROM usage WHERE user_id = @u AND ts >= @s", { u: userId, s: since }).n;
      return {
        last7: count(t - 7 * DAY),
        last30: count(t - 30 * DAY),
        topTools: db.all(
          `SELECT tool, COUNT(*) AS n FROM usage WHERE user_id = @u AND ts >= @s
           GROUP BY tool ORDER BY n DESC, tool LIMIT 5`,
          { u: userId, s: t - 30 * DAY }
        ),
      };
    },
    adminOverview() {
      const t = now();
      const users = db.all(
        `SELECT u.id, u.provider, u.email, u.name, u.created, u.last_seen, u.disabled,
           (SELECT COUNT(*) FROM usage x WHERE x.user_id = u.id AND x.ts >= @d7) AS calls7,
           (SELECT COUNT(*) FROM usage x WHERE x.user_id = u.id AND x.ts >= @d30) AS calls30,
           (SELECT COUNT(*) FROM tokens k WHERE k.user_id = u.id AND k.revoked IS NULL) AS tokens,
           (SELECT COUNT(DISTINCT o.client_id) FROM oauth_tokens o WHERE o.user_id = u.id AND o.revoked IS NULL AND o.refresh_expires >= @now) AS apps
         FROM users u ORDER BY COALESCE(u.last_seen, u.created) DESC`,
        { d7: t - 7 * DAY, d30: t - 30 * DAY, now: t }
      );
      const anon = (since) =>
        db.get("SELECT COUNT(*) AS n FROM usage WHERE user_id IS NULL AND ts >= @s", { s: since }).n;
      return { users, anonymous7: anon(t - 7 * DAY), anonymous30: anon(t - 30 * DAY) };
    },
  };
  return store;
}
