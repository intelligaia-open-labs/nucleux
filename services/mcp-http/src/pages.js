// Server-rendered pages. No client framework: HTML strings, every interpolated
// value escaped through `e()`; the only script is the copy button (assets/app.js).

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

const ICONS = {
  google:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"/></svg>',
  github:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>',
  copy:
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
};

export function createPages(config) {
  const p = (path) => `${config.basePath}${path}`;
  // "Google", "GitHub" or "Google or GitHub": only the providers that are configured.
  const signInWith = [config.providers.google && "Google", config.providers.github && "GitHub"].filter(Boolean).join(" or ") || "same";
  const csrfField = (csrf) => `<input type="hidden" name="_csrf" value="${e(csrf)}">`;

  function layout({ title, body, user, csrf, narrow = false }) {
    const userBar = user
      ? `<div class="topbar-user"><span>${e(user.email)}</span>
           <form method="post" action="${p("/auth/logout")}">${csrfField(csrf)}
             <button class="btn btn-ghost btn-sm" type="submit">Sign out</button></form></div>`
      : "";
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
<script src="${p("/assets/app.js")}" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="topbar"><div class="topbar-inner">
  <a class="brand" href="${p("/connect")}"><span class="brand-mark" aria-hidden="true">N</span>Nucleux MCP</a>
  ${userBar}
</div></header>
<main id="main" class="${narrow ? "narrow" : ""}">
${body}
</main>
</body>
</html>`;
  }

  function signIn({ providers, next, error }) {
    const qs = (id) => {
      const u = new URLSearchParams({ provider: id });
      if (next) u.set("next", next);
      return u.toString();
    };
    const buttons = Object.values(providers)
      .map(
        (pr) =>
          `<a class="btn btn-outline btn-block" href="${p(`/auth/login?${qs(pr.id)}`)}">${ICONS[pr.id] ?? ""}Continue with ${e(pr.label)}</a>`
      )
      .join("\n");
    const body = `
<section class="card" aria-labelledby="signin-title">
  <div class="card-header">
    <h1 class="card-title" id="signin-title">Connect Nucleux to your coding agent</h1>
    <p class="card-description">Sign in to get a one-line setup for Claude Code, Cursor, Codex and the other agents on your machine, or to connect claude.ai.</p>
  </div>
  <div class="card-content">
    ${error ? `<div class="alert alert-destructive" role="alert">${e(error)}</div>` : ""}
    ${buttons || '<div class="alert alert-warning" role="status">Sign-in is not configured on this server yet.</div>'}
    <p class="muted small">No account needed for the open package: <code class="inline">npx -y @nucleux/mcp add</code> runs the catalog locally.</p>
  </div>
</section>`;
    return layout({ title: "Sign in", body, narrow: true });
  }

  // The prompt a user pastes into their coding agent. It must be self-contained:
  // the agent has no other context, may run sandboxed, and must never echo the token.
  function connectPrompt({ code, email, base }) {
    const cmd = `npx -y @nucleux/mcp@latest add --code ${code}`;
    return [
      `Connect the coding agents on this machine to the Nucleux MCP server, hosted at ${base}, signed in as ${email}.`,
      ``,
      `1. Run this once, in a terminal on THIS machine (not a remote container or cloud sandbox), from the root of the project I'm working in:`,
      ``,
      `   ${cmd}`,
      ``,
      `   - The code ${code} works once and expires 10 minutes after it was generated. If the command says the code is "unknown, expired or already used", don't retry it: ask me for a new prompt from ${base}/connect.`,
      `   - It needs Node.js 18 or later and network access to registry.npmjs.org and ${new URL(base).host}. If npx is missing, tell me to install Node.js from https://nodejs.org; don't install it yourself. If npm is behind a proxy, it uses the HTTPS_PROXY setting.`,
      `   - If your sandbox blocks network access or writing to my home folder, stop and ask me to run the command myself in my own terminal.`,
      `   - It finds Claude Code, Cursor, VS Code, Codex, Windsurf, Gemini CLI and Claude Desktop, and connects each one directly to ${base} with my personal token. It replaces any existing "nucleux" MCP entry and keeps every other server and setting. If it finds no agent, run it again with --only and the agent you are (claude-code, cursor, vscode, codex, windsurf, gemini or claude-desktop).`,
      `   - If it can't read an agent's config file (for example JSON with comments), it leaves that file untouched and prints what to add. Tell me which file, but don't add it yourself and don't show the token.`,
      `   - Run from a project folder, it also adds the nucleux-design guidance (a skill and an AGENTS.md section) to the project. Add --no-project if I don't want project files changed.`,
      ``,
      `2. Check it worked: run \`npx -y @nucleux/mcp@latest whoami\`. It should print ${email}. If it says the token was rejected, ask me for a new prompt.`,
      ``,
      `3. Tell me which agents were connected, and that each one has to be restarted before it can use Nucleux (MCP servers are loaded when an agent starts, so this session won't see the tools until then). After the restart the nucleux tools (list_components, get_component, search_patterns, get_setup…) are available.`,
      ``,
      `4. Keep the token secret. It is stored in ~/.config/nucleux/credentials.json and in each agent's MCP config, readable only by me. Never print, paste, log or commit it, and never copy those files into the project. If something looks wrong, I can revoke this machine at ${base}/connect; to sign out and remove the connections, run \`npx -y @nucleux/mcp logout\`.`,
      ``,
      `5. Afterwards, when I ask you to build UI with Nucleux, first work out the platform from the project: Package.swift or an .xcodeproj is SwiftUI, build.gradle(.kts) with Compose is Jetpack Compose, pubspec.yaml is Flutter, a package.json with react-native is React Native, and a React, Next.js or Vite web app is web. For mobile, pass that framework (swiftui, compose, flutter or react-native) to the Nucleux tools. For web, ask me "Material 3 or shadcn?". Ask me only what you can't tell from the project or what it already records (AGENTS.md or CLAUDE.md, e.g. "Nucleux platform: SwiftUI" or "Nucleux family: Material 3"), record the answer there, then follow the Nucleux MCP's instructions.`,
    ].join("\n");
  }

  function connect({ user, csrf, code, tokens, apps, usage, isAdmin, notice }) {
    const line = code ? connectPrompt({ code, email: user.email, base: config.base }) : null;
    const greeting = user.name ? `Hi, ${user.name.split(" ")[0]}` : "Welcome";

    const codeBlock = line
      ? `<div class="stack" aria-live="polite">
           <p class="small"><strong>Your connect prompt is ready.</strong> Copy it and paste it into your coding agent (Claude Code, Cursor, Codex…). The agent sets everything up and knows what to do if something goes wrong.</p>
           <div>
             <button class="btn btn-primary btn-lg" type="button" data-copy-target="connect-line" data-reveal-on-fail>${ICONS.copy}<span data-copy-label aria-live="polite">Copy prompt</span></button>
           </div>
           <pre id="connect-line" class="connect-prompt" hidden>${e(line)}</pre>
           <p class="muted small">Works once, within 10 minutes. It connects your agents directly to Nucleux with your personal token, which never appears in the chat. You can revoke a machine below at any time.</p>
         </div>`
      : `<p class="muted small">Generates a single-use code and a prompt to paste into your coding agent.</p>`;

    const tokenRows = tokens.length
      ? tokens
          .map(
            (t) => `<tr><td>${e(t.label)}</td><td>${fmt(t.created)}</td><td>${fmt(t.last_used)}</td>
              <td class="actions"><form method="post" action="${p(`/connect/tokens/${t.id}/revoke`)}">${csrfField(csrf)}
                <button class="btn btn-destructive btn-sm" type="submit" aria-label="Revoke ${e(t.label)}">Revoke</button></form></td></tr>`
          )
          .join("")
      : "";
    const appRows = apps.length
      ? apps
          .map(
            (a) => `<tr><td>${e(a.name)} <span class="badge">OAuth</span></td><td>${fmt(a.created)}</td><td>${fmt(a.last_used)}</td>
              <td class="actions"><form method="post" action="${p(`/connect/apps/${encodeURIComponent(a.client_id)}/revoke`)}">${csrfField(csrf)}
                <button class="btn btn-destructive btn-sm" type="submit" aria-label="Disconnect ${e(a.name)}">Revoke</button></form></td></tr>`
          )
          .join("")
      : "";
    const accessTable =
      tokenRows || appRows
        ? `<div class="table-wrap"><table>
             <caption class="sr-only">Machines and apps with access</caption>
             <thead><tr><th scope="col">Name</th><th scope="col">Created</th><th scope="col">Last used</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
             <tbody>${tokenRows}${appRows}</tbody></table></div>`
        : `<div class="table-wrap"><p class="empty">Nothing connected yet.</p></div>`;

    const top = usage.topTools.length
      ? `<div class="table-wrap"><table><caption class="sr-only">Top tools, last 30 days</caption>
           <thead><tr><th scope="col">Tool</th><th scope="col" class="num">Calls (30 days)</th></tr></thead>
           <tbody>${usage.topTools.map((t) => `<tr><td><code class="inline">${e(t.tool)}</code></td><td class="num">${t.n}</td></tr>`).join("")}</tbody>
         </table></div>`
      : "";

    const body = `
${notice ? `<div class="alert alert-success" role="status">${e(notice)}</div>` : ""}
<section class="card" aria-labelledby="connect-title">
  <div class="card-header">
    <div class="who">
      ${user.avatar ? `<img class="avatar" src="${e(user.avatar)}" alt="" referrerpolicy="no-referrer">` : ""}
      <div>
        <h1 class="card-title" id="connect-title">${e(greeting)}</h1>
        <p class="card-description">Signed in as ${e(user.email)}${isAdmin ? ` · <a href="${p("/admin")}">Admin</a>` : ""}</p>
      </div>
    </div>
  </div>
  <div class="card-content">
    <h2 class="card-title">Connect your coding agents</h2>
    ${codeBlock}
  </div>
  <div class="card-footer">
    <form method="post" action="${p("/connect/code")}">${csrfField(csrf)}
      <button class="btn ${line ? "btn-outline" : "btn-primary"}" type="submit">${line ? "Generate a new prompt" : "Get connect prompt"}</button>
    </form>
  </div>
</section>

<section class="card" aria-labelledby="claude-title">
  <div class="card-header">
    <h2 class="card-title" id="claude-title">Connect claude.ai or Claude Desktop</h2>
    <p class="card-description">Uses the same account through OAuth — nothing to copy.</p>
  </div>
  <div class="card-content">
    <ol class="steps">
      <li>Open <strong>Settings → Connectors</strong> and choose <strong>Add custom connector</strong>.</li>
      <li>Enter <code class="inline">${e(config.base)}</code> as the URL.</li>
      <li>Click <strong>Connect</strong> and sign in with the same ${e(signInWith)} account.</li>
    </ol>
  </div>
</section>

<section class="card" aria-labelledby="access-title">
  <div class="card-header">
    <h2 class="card-title" id="access-title">Machines and apps with access</h2>
    <p class="card-description">Revoking stops that machine or app immediately.</p>
  </div>
  <div class="card-content">${accessTable}</div>
</section>

<section class="card" aria-labelledby="usage-title">
  <div class="card-header">
    <h2 class="card-title" id="usage-title">Your usage</h2>
    <p class="card-description">Tool calls made with your account. Arguments are never stored.</p>
  </div>
  <div class="card-content">
    <div class="stats">
      <div class="stat"><div class="stat-value">${usage.last7}</div><div class="stat-label">Calls, last 7 days</div></div>
      <div class="stat"><div class="stat-value">${usage.last30}</div><div class="stat-label">Calls, last 30 days</div></div>
    </div>
    ${top}
  </div>
</section>`;
    return layout({ title: "Connect", body, user, csrf });
  }

  function consent({ client, user, csrf, params, redirectHost }) {
    const hidden = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `<input type="hidden" name="${e(k)}" value="${e(v)}">`)
      .join("\n      ");
    const body = `
<section class="card" aria-labelledby="consent-title">
  <div class="card-header">
    <h1 class="card-title" id="consent-title">Allow ${e(client.name)} to use Nucleux as ${e(user.email)}?</h1>
    <p class="card-description">It will be able to look up Nucleux components, examples and setup on your behalf. Its calls are attributed to your account.</p>
  </div>
  <div class="card-content">
    <p class="small muted">After you choose, you return to <strong>${e(redirectHost)}</strong>. You can revoke access any time on the <a href="${p("/connect")}">Connect page</a>.</p>
  </div>
  <form method="post" action="${p("/oauth/authorize")}" class="card-footer">
      ${csrfField(csrf)}
      ${hidden}
      <button class="btn btn-primary" type="submit" name="decision" value="allow">Allow</button>
      <button class="btn btn-outline" type="submit" name="decision" value="deny">Deny</button>
  </form>
</section>`;
    return layout({ title: "Authorize", body, user, csrf, narrow: true });
  }

  function message({ title, text, user, csrf, status = "error" }) {
    const body = `
<section class="card" aria-labelledby="msg-title">
  <div class="card-header"><h1 class="card-title" id="msg-title">${e(title)}</h1></div>
  <div class="card-content">
    <div class="alert ${status === "error" ? "alert-destructive" : "alert-warning"}" role="alert">${e(text)}</div>
    <p><a class="btn btn-outline" href="${p("/connect")}">Back to Connect</a></p>
  </div>
</section>`;
    return layout({ title, body, user, csrf, narrow: true });
  }

  function admin({ user, csrf, overview }) {
    const rows = overview.users
      .map((u) => {
        const status = u.disabled ? '<span class="badge badge-destructive">Disabled</span>' : '<span class="badge">Active</span>';
        const toggle = u.disabled
          ? `<form method="post" action="${p(`/admin/users/${u.id}/enable`)}">${csrfField(csrf)}<button class="btn btn-outline btn-sm" type="submit">Enable</button></form>`
          : `<form method="post" action="${p(`/admin/users/${u.id}/disable`)}">${csrfField(csrf)}<button class="btn btn-destructive btn-sm" type="submit" aria-label="Disable ${e(u.email)}">Disable</button></form>`;
        return `<tr>
          <td><div>${e(u.name || u.email)}</div><div class="muted small">${e(u.email)} · ${e(u.provider)}</div></td>
          <td>${status}</td>
          <td>${fmt(u.last_seen)}</td>
          <td class="num">${u.calls7}</td><td class="num">${u.calls30}</td>
          <td class="num">${u.tokens} / ${u.apps}</td>
          <td class="actions">
            <form method="post" action="${p(`/admin/users/${u.id}/revoke`)}">${csrfField(csrf)}<button class="btn btn-outline btn-sm" type="submit" aria-label="Revoke all access for ${e(u.email)}">Revoke all</button></form>
            ${toggle}
          </td></tr>`;
      })
      .join("");
    const body = `
<section class="card" aria-labelledby="admin-title">
  <div class="card-header">
    <h1 class="card-title" id="admin-title">Users</h1>
    <p class="card-description">${overview.users.length} accounts · anonymous calls: ${overview.anonymous7} (7 days), ${overview.anonymous30} (30 days)</p>
  </div>
  <div class="card-content">
    <div class="table-wrap"><table>
      <caption class="sr-only">Users and their usage</caption>
      <thead><tr><th scope="col">User</th><th scope="col">Status</th><th scope="col">Last seen</th>
        <th scope="col" class="num">7 days</th><th scope="col" class="num">30 days</th><th scope="col" class="num">Tokens / apps</th>
        <th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
      <tbody>${rows || '<tr><td colspan="7" class="empty">No users yet.</td></tr>'}</tbody>
    </table></div>
  </div>
</section>`;
    return layout({ title: "Admin", body, user, csrf });
  }

  return { signIn, connect, consent, message, admin };
}
