// Token generation, hashing, signing and small request helpers.

import crypto from "node:crypto";

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
// No 0/O, 1/I/L: codes are read off a screen and typed.
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

// Uniform random string over `alphabet` (rejection sampling, no modulo bias).
export function randomString(length, alphabet = BASE62) {
  const max = 256 - (256 % alphabet.length);
  let out = "";
  while (out.length < length) {
    for (const byte of crypto.randomBytes(length * 2)) {
      if (byte < max) out += alphabet[byte % alphabet.length];
      if (out.length === length) break;
    }
  }
  return out;
}

export const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

export function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  if (x.length !== y.length) {
    crypto.timingSafeEqual(x, x); // keep the timing shape
    return false;
  }
  return crypto.timingSafeEqual(x, y);
}

// Personal access token: nx_ + 40 base62.
export const newPersonalToken = () => `nx_${randomString(40)}`;
export const PAT_RE = /^nx_[0-9A-Za-z]{40}$/;
// OAuth tokens are opaque; their prefix only helps humans and secret scanners.
export const newAccessToken = () => `nxa_${randomString(43)}`;
export const newRefreshToken = () => `nxr_${randomString(43)}`;
export const newOpaque = (n = 32) => randomString(n);

// CLI connect code: 8 chars, shown as XXXX-XXXX.
export const newCliCode = () => randomString(8, CODE_ALPHABET);
export const formatCliCode = (code) => `${code.slice(0, 4)}-${code.slice(4)}`;
export function normalizeCliCode(input) {
  if (typeof input !== "string") return null;
  const code = input.trim().toUpperCase().replace(/-/g, "");
  if (code.length !== 8) return null;
  for (const ch of code) if (!CODE_ALPHABET.includes(ch)) return null;
  return code;
}

// HMAC-signed, expiring payloads (OAuth `state` for sign-in).
export function sign(secret, payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verify(secret, token, now = Date.now()) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [body, mac] = token.split(".", 2);
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (!safeEqual(mac, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export const pkceS256 = (verifier) => crypto.createHash("sha256").update(verifier).digest("base64url");

// ---------------------------------------------------------------------------
// In-memory fixed-window rate limiter (one process, so this is enough).
// ---------------------------------------------------------------------------

export function rateLimiter({ windowMs, max, name, now = () => Date.now() }) {
  const hits = new Map();
  let lastSweep = now();
  return function limit(req, res, next) {
    const t = now();
    if (t - lastSweep > windowMs) {
      for (const [k, v] of hits) if (v.reset <= t) hits.delete(k);
      lastSweep = t;
    }
    const key = req.ip ?? "unknown";
    let entry = hits.get(key);
    if (!entry || entry.reset <= t) {
      entry = { count: 0, reset: t + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader("Retry-After", String(Math.ceil((entry.reset - t) / 1000)));
      res.status(429).json({ error: "rate_limited", error_description: `Too many ${name} requests. Try again later.` });
      return;
    }
    next();
  };
}

// ---------------------------------------------------------------------------
// Cookies
// ---------------------------------------------------------------------------

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (!(k in out)) {
      try {
        out[k] = decodeURIComponent(v);
      } catch {
        out[k] = v;
      }
    }
  }
  return out;
}

export function serializeCookie(name, value, { maxAge, path = "/", secure = true, httpOnly = true, sameSite = "Lax" } = {}) {
  let c = `${name}=${encodeURIComponent(value)}; Path=${path}; SameSite=${sameSite}`;
  if (maxAge !== undefined) c += `; Max-Age=${Math.floor(maxAge / 1000)}`;
  if (httpOnly) c += "; HttpOnly";
  if (secure) c += "; Secure";
  return c;
}

export function appendSetCookie(res, cookie) {
  const prev = res.getHeader("Set-Cookie");
  if (!prev) res.setHeader("Set-Cookie", [cookie]);
  else res.setHeader("Set-Cookie", [...(Array.isArray(prev) ? prev : [prev]), cookie]);
}
