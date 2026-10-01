// Builds examples/e2e/mcp-guide.artifact.html — a getting-started guide showing
// the end-user flow: add the @nucleux/mcp server to a Claude client, ask Claude
// to build a page, get a rendered result. Inlines the real login preview + CSS.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "examples", "e2e");
const css = readFileSync(join(outDir, "output.css"), "utf8");
const loginFull = readFileSync(join(outDir, "login-mcp.html"), "utf8");
const loginBody = (loginFull.match(/<body[^>]*>([\s\S]*)<\/body>/) || [, ""])[1]
  .replace(/min-h-screen/g, "min-h-[460px]");

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

const desktopConfig = `{
  "mcpServers": {
    "nucleux": {
      "command": "npx",
      "args": ["-y", "@nucleux/mcp"]
    }
  }
}`;

const page = `<style>
${css}
:root{
  --g-bg:#f6f5fb; --g-surface:#ffffff; --g-ink:#1a1725; --g-dim:#6b6880; --g-line:#e6e3f0;
  --g-accent:#7c3aed; --g-accent-ink:#ffffff; --g-code-bg:#faf9fe; --g-chip:#efe9fe; --g-chip-ink:#5b21b6;
  --g-term-bg:#141220; --g-term-ink:#e7e7f0; --g-term-dim:#9a97b5;
}
@media (prefers-color-scheme:dark){:root{
  --g-bg:#0e0c16; --g-surface:#16131f; --g-ink:#ece9f5; --g-dim:#9a97b5; --g-line:#2a2540;
  --g-accent:#a78bfa; --g-accent-ink:#1a1030; --g-code-bg:#120f1c; --g-chip:#2a2145; --g-chip-ink:#c7b8ff;
}}
:root[data-theme="dark"]{--g-bg:#0e0c16;--g-surface:#16131f;--g-ink:#ece9f5;--g-dim:#9a97b5;--g-line:#2a2540;--g-accent:#a78bfa;--g-accent-ink:#1a1030;--g-code-bg:#120f1c;--g-chip:#2a2145;--g-chip-ink:#c7b8ff;}
:root[data-theme="light"]{--g-bg:#f6f5fb;--g-surface:#ffffff;--g-ink:#1a1725;--g-dim:#6b6880;--g-line:#e6e3f0;--g-accent:#7c3aed;--g-accent-ink:#fff;--g-code-bg:#faf9fe;--g-chip:#efe9fe;--g-chip-ink:#5b21b6;}
.g{background:var(--g-bg);color:var(--g-ink);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.55;-webkit-font-smoothing:antialiased}
.g-wrap{max-width:820px;margin:0 auto;padding:40px 24px 64px}
.g-eyebrow{font:600 12px/1 ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--g-accent)}
.g h1{font-size:30px;line-height:1.15;margin:12px 0 8px;letter-spacing:-0.02em;text-wrap:balance}
.g .lead{color:var(--g-dim);font-size:16px;margin:0 0 8px;max-width:60ch}
.g-step{position:relative;margin-top:40px;padding-left:52px}
.g-step::before{content:attr(data-n);position:absolute;left:0;top:-2px;width:34px;height:34px;border-radius:50%;background:var(--g-accent);color:var(--g-accent-ink);display:grid;place-items:center;font-weight:700;font-size:15px}
.g-step h2{font-size:19px;margin:4px 0 12px;letter-spacing:-0.01em}
.g-card{background:var(--g-surface);border:1px solid var(--g-line);border-radius:14px;overflow:hidden}
.g-card+.g-card{margin-top:12px}
.g-card-h{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--g-line);font-size:13px;font-weight:600;color:var(--g-dim)}
.g-card-h .tag{margin-left:auto;font:600 11px/1 ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--g-accent)}
pre.g-code{margin:0;padding:14px 16px;background:var(--g-code-bg);overflow-x:auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;line-height:1.6;color:var(--g-ink)}
pre.g-code .c{color:var(--g-dim)}
.g-note{font-size:13px;color:var(--g-dim);margin:10px 2px 0}
.g-note code{background:var(--g-chip);color:var(--g-chip-ink);padding:1px 6px;border-radius:5px;font-family:ui-monospace,monospace;font-size:12px}
/* mock chat */
.chat{background:var(--g-surface);border:1px solid var(--g-line);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:14px}
.bubble{max-width:88%;padding:11px 14px;border-radius:14px;font-size:14px}
.bubble.user{align-self:flex-end;background:var(--g-accent);color:var(--g-accent-ink);border-bottom-right-radius:5px}
.bubble.ai{align-self:flex-start;background:var(--g-code-bg);border:1px solid var(--g-line);border-bottom-left-radius:5px}
.bubble .who{display:block;font:600 11px/1 ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;opacity:.7;margin-bottom:6px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px}
.chip{display:inline-flex;align-items:center;gap:6px;background:var(--g-chip);color:var(--g-chip-ink);border-radius:999px;padding:4px 10px;font:500 11.5px/1 ui-monospace,monospace}
.chip::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
/* browser frame */
.frame{border:1px solid var(--g-line);border-radius:14px;overflow:hidden;background:var(--g-surface)}
.frame-bar{display:flex;align-items:center;gap:6px;padding:9px 12px;border-bottom:1px solid var(--g-line);background:var(--g-code-bg)}
.frame-dot{width:10px;height:10px;border-radius:50%}
.frame-url{margin-left:10px;font:12px ui-monospace,monospace;color:var(--g-dim);background:var(--g-bg);border-radius:6px;padding:3px 10px}
.frame-body{padding:0}
.g-foot{margin-top:44px;padding-top:20px;border-top:1px solid var(--g-line);font-size:13px;color:var(--g-dim)}
.g-foot code{background:var(--g-chip);color:var(--g-chip-ink);padding:1px 6px;border-radius:5px;font-family:ui-monospace,monospace}
</style>
<div class="g">
  <div class="g-wrap">
    <p class="g-eyebrow">Nucleux · MCP</p>
    <h1>Build UI in Claude with the Nucleux MCP</h1>
    <p class="lead">Add one MCP server to your Claude client, then just ask for a page. Claude discovers the right components and hands you production markup — shadcn or Material UI 3.</p>

    <div class="g-step" data-n="1">
      <h2>Add the server to Claude</h2>
      <div class="g-card">
        <div class="g-card-h">Claude Desktop <span class="tag">claude_desktop_config.json</span></div>
        <pre class="g-code">${esc(desktopConfig)}</pre>
      </div>
      <div class="g-card">
        <div class="g-card-h">Claude Code <span class="tag">terminal</span></div>
        <pre class="g-code">claude mcp add nucleux -- npx -y @nucleux/mcp</pre>
      </div>
      <p class="g-note">Needs Node (for <code>npx</code>). Restart the client — you'll see the <code>nucleux</code> server with tools <code>list_components</code>, <code>search_components</code>, <code>get_component</code>, <code>get_setup</code>, <code>get_example</code>.</p>
    </div>

    <div class="g-step" data-n="2">
      <h2>Ask Claude to build a page</h2>
      <div class="chat">
        <div class="bubble user"><span class="who">You</span>Add a sign-in page to my app using Nucleux, Material UI 3 style.</div>
        <div class="bubble ai">
          <span class="who">Claude</span>
          On it — checking setup and pulling the components from Nucleux.
          <div class="chips">
            <span class="chip">get_setup · html</span>
            <span class="chip">get_component · md3-text-field</span>
            <span class="chip">get_component · md3-button</span>
            <span class="chip">get_component · md3-checkbox</span>
          </div>
          Here's a Material UI 3 sign-in page — email + password fields, remember-me, and a filled sign-in button. Add the Tailwind preset + tokens (from <code style="font-family:ui-monospace,monospace">get_setup</code>) and it renders as below.
        </div>
      </div>
      <p class="g-note">Claude picks components with <code>search_components</code>, reads the API/markup with <code>get_component</code> (<code>framework:"html"</code> or <code>"react"</code>), and follows <code>get_setup</code> for styling.</p>
    </div>

    <div class="g-step" data-n="3">
      <h2>You get a working page</h2>
      <div class="frame">
        <div class="frame-bar">
          <span class="frame-dot" style="background:#ff5f57"></span><span class="frame-dot" style="background:#febc2e"></span><span class="frame-dot" style="background:#28c840"></span>
          <span class="frame-url">localhost:3000/sign-in</span>
        </div>
        <div class="frame-body"><div class="nx-theme-mui">${loginBody}</div></div>
      </div>
      <p class="g-note">Rendered from the real MCP output — every element and class comes from <code>get_component</code>; ids are unique per response, so reused components don't collide.</p>
    </div>

    <p class="g-foot">Package: <code>@nucleux/mcp</code> on npm · <code>npx @nucleux/mcp</code> · works with Claude Desktop, Claude Code, and any MCP client.</p>
  </div>
</div>
`;

writeFileSync(join(outDir, "mcp-guide.artifact.html"), page);
console.log(`mcp-guide.artifact.html ready (${page.length} bytes)`);
