// Server-rendered pages: the OAuth consent page, messages, and /admin. No
// client framework and no script: HTML strings, every interpolated value
// escaped through `e()`.

export const e = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const fmt = (ms) => {
  if (!ms) return "Never";
  return new Date(ms).toISOString().replace("T", " ").slice(0, 16) + " UTC";
};

const PROVIDERS = { anon: "anonymous", google: "Google", github: "GitHub", email: "email" };

export function createPages(config) {
  const p = (path) => `${config.basePath}${path}`;
  const csrfField = (csrf) => `<input type="hidden" name="_csrf" value="${e(csrf)}">`;

  function layout({ title, body, narrow = false }) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="robots" content="noindex">
<title>${e(title)} · Nucleux MCP</title>
<link rel="stylesheet" href="${p("/assets/tokens.css")}">
<link rel="stylesheet" href="${p("/assets/app.css")}">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="topbar"><div class="topbar-inner">
  <a class="brand" href="${e(config.site)}"><span class="brand-mark" aria-hidden="true">N</span>Nucleux MCP</a>
</div></header>
<main id="main" class="${narrow ? "narrow" : ""}">
${body}
</main>
</body>
</html>`;
  }

  // OAuth consent, no account: Allow creates an anonymous principal for this grant.
  function consent({ client, csrf, params, redirectHost }) {
    const hidden = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `<input type="hidden" name="${e(k)}" value="${e(v)}">`)
      .join("\n      ");
    const body = `
<section class="card" aria-labelledby="consent-title">
  <div class="card-header">
    <h1 class="card-title" id="consent-title">Allow ${e(client.name)} to use Nucleux?</h1>
    <p class="card-description">It will be able to look up Nucleux components, examples and setup. No account is needed: it gets its own access token, which you can remove by disconnecting it.</p>
  </div>
  <div class="card-content">
    <p class="small muted">After you choose, you return to <strong>${e(redirectHost)}</strong>.</p>
  </div>
  <form method="post" action="${p("/oauth/authorize")}" class="card-footer">
      ${csrfField(csrf)}
      ${hidden}
      <button class="btn btn-primary" type="submit" name="decision" value="allow">Allow</button>
      <button class="btn btn-outline" type="submit" name="decision" value="deny">Deny</button>
  </form>
</section>`;
    return layout({ title: "Authorize", body, narrow: true });
  }

  function message({ title, text, status = "error" }) {
    const body = `
<section class="card" aria-labelledby="msg-title">
  <div class="card-header"><h1 class="card-title" id="msg-title">${e(title)}</h1></div>
  <div class="card-content">
    <div class="alert ${status === "error" ? "alert-destructive" : "alert-warning"}" role="alert">${e(text)}</div>
    <p><a class="btn btn-outline" href="${e(config.site)}">Nucleux MCP setup</a></p>
  </div>
</section>`;
    return layout({ title, body, narrow: true });
  }

  function admin({ csrf, overview, notice }) {
    const post = (action, label, cls, aria) =>
      `<form method="post" action="${p(action)}">${csrfField(csrf)}<button class="btn ${cls} btn-sm" type="submit"${aria ? ` aria-label="${e(aria)}"` : ""}>${label}</button></form>`;
    const who = (u) => (u.email ? u.email : `${PROVIDERS[u.provider] ?? u.provider} #${u.id}`);

    const rows = overview.users
      .map((u) => {
        const status = u.disabled ? '<span class="badge badge-destructive">Disabled</span>' : '<span class="badge">Active</span>';
        const toggle = u.disabled
          ? post(`/admin/users/${u.id}/enable`, "Enable", "btn-outline", `Enable ${who(u)}`)
          : post(`/admin/users/${u.id}/disable`, "Disable", "btn-destructive", `Disable ${who(u)}`);
        return `<tr>
          <td><div>${e(who(u))}</div><div class="muted small">${e(PROVIDERS[u.provider] ?? u.provider)} · since ${fmt(u.created).slice(0, 10)}</div></td>
          <td>${status}</td>
          <td>${fmt(u.last_seen)}</td>
          <td class="num">${u.calls7}</td><td class="num">${u.calls30}</td>
          <td class="num">${u.tokens} / ${u.apps}</td>
          <td class="actions">${post(`/admin/users/${u.id}/revoke`, "Revoke all", "btn-outline", `Revoke all access for ${who(u)}`)}${toggle}</td>
        </tr>`;
      })
      .join("");

    const tokenRows = overview.tokens
      .map(
        (t) => `<tr>
          <td>${e(t.label)}</td>
          <td>${e(t.email || `${PROVIDERS[t.provider] ?? t.provider} #${t.user_id}`)}</td>
          <td>${fmt(t.created)}</td><td>${fmt(t.last_used)}</td>
          <td class="actions">${post(`/admin/tokens/${t.id}/revoke`, "Revoke", "btn-destructive", `Revoke token ${t.label}`)}</td>
        </tr>`
      )
      .join("");

    const body = `
${notice ? `<div class="alert alert-success" role="status">${e(notice)}</div>` : ""}
<section class="card" aria-labelledby="admin-title">
  <div class="card-header">
    <h1 class="card-title" id="admin-title">Principals</h1>
    <p class="card-description">${overview.users.length} listed · ${overview.unusedAnon} unused anonymous (never connected) · calls without a token: ${overview.anonymous7} (7 days), ${overview.anonymous30} (30 days)</p>
  </div>
  <div class="card-content">
    <div class="table-wrap"><table>
      <caption class="sr-only">Principals and their usage</caption>
      <thead><tr><th scope="col">Principal</th><th scope="col">Status</th><th scope="col">Last used</th>
        <th scope="col" class="num">7 days</th><th scope="col" class="num">30 days</th><th scope="col" class="num">Tokens / apps</th>
        <th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
      <tbody>${rows || '<tr><td colspan="7" class="empty">No principals yet.</td></tr>'}</tbody>
    </table></div>
  </div>
</section>

<section class="card" aria-labelledby="tokens-title">
  <div class="card-header">
    <h2 class="card-title" id="tokens-title">Active tokens</h2>
    <p class="card-description">Personal tokens (connect codes and self-serve). OAuth grants are revoked per principal.</p>
  </div>
  <div class="card-content">
    <div class="table-wrap"><table>
      <caption class="sr-only">Active personal tokens</caption>
      <thead><tr><th scope="col">Label</th><th scope="col">Principal</th><th scope="col">Created</th><th scope="col">Last used</th>
        <th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
      <tbody>${tokenRows || '<tr><td colspan="5" class="empty">No active tokens.</td></tr>'}</tbody>
    </table></div>
  </div>
</section>`;
    return layout({ title: "Admin", body });
  }

  return { consent, message, admin };
}
