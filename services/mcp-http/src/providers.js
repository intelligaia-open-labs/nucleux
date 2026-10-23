// Sign-in providers. Each one builds its authorize URL and turns a callback
// `code` into a verified profile. Plain fetch, no SDKs. Tests inject fakes
// with the same shape instead of these.
//
// Provider: { id, label, authorizeUrl({ state, redirectUri }),
//             profile({ code, redirectUri }) -> { providerId, email, name, avatar } }
// `profile` must throw unless the email is verified by the provider.

async function readJson(res, what) {
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`${what}: HTTP ${res.status}, non-JSON response`);
  }
  if (!res.ok || body.error) {
    throw new Error(`${what}: HTTP ${res.status} ${body.error ?? ""}`.trim());
  }
  return body;
}

export function googleProvider({ clientId, clientSecret }, fetchImpl = fetch) {
  return {
    id: "google",
    label: "Google",
    authorizeUrl({ state, redirectUri }) {
      const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      u.search = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state,
        prompt: "select_account",
      }).toString();
      return u.toString();
    },
    async profile({ code, redirectUri }) {
      const tok = await readJson(
        await fetchImpl("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }),
        }),
        "google token"
      );
      const info = await readJson(
        await fetchImpl("https://openidconnect.googleapis.com/v1/userinfo", {
          headers: { authorization: `Bearer ${tok.access_token}`, accept: "application/json" },
        }),
        "google userinfo"
      );
      if (!info.sub || !info.email || info.email_verified !== true) {
        throw new Error("Google account has no verified email");
      }
      return { providerId: info.sub, email: info.email.toLowerCase(), name: info.name ?? null, avatar: info.picture ?? null };
    },
  };
}

export function githubProvider({ clientId, clientSecret }, fetchImpl = fetch) {
  const api = (path, token) =>
    fetchImpl(`https://api.github.com${path}`, {
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/vnd.github+json",
        "user-agent": "nucleux-mcp",
        "x-github-api-version": "2022-11-28",
      },
    });
  return {
    id: "github",
    label: "GitHub",
    authorizeUrl({ state, redirectUri }) {
      const u = new URL("https://github.com/login/oauth/authorize");
      u.search = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "read:user user:email",
        state,
        allow_signup: "true",
      }).toString();
      return u.toString();
    },
    async profile({ code, redirectUri }) {
      const tok = await readJson(
        await fetchImpl("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
          body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri }),
        }),
        "github token"
      );
      const user = await readJson(await api("/user", tok.access_token), "github user");
      const emails = await readJson(await api("/user/emails", tok.access_token), "github emails");
      const primary = Array.isArray(emails) ? emails.find((e) => e.primary && e.verified) : null;
      if (!user.id || !primary) throw new Error("GitHub account has no verified primary email");
      return {
        providerId: String(user.id),
        email: primary.email.toLowerCase(),
        name: user.name || user.login || null,
        avatar: user.avatar_url ?? null,
      };
    },
  };
}

export function providersFromConfig(config) {
  const out = {};
  if (config.providers.google) out.google = googleProvider(config.providers.google);
  if (config.providers.github) out.github = githubProvider(config.providers.github);
  return out;
}
