// Builds a self-contained animated "how to build a page with the Nucleux MCP"
// walkthrough (examples/e2e/mcp-demo.artifact.html): a terminal that types the
// real MCP tool calls while the login page assembles from the actual snippets.
// Uses genuine data — html-snippets.json + the compiled output.css.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "examples", "e2e");
const css = readFileSync(join(outDir, "output.css"), "utf8");
const snippets = JSON.parse(readFileSync(join(root, "packages", "mcp", "src", "html-snippets.json"), "utf8")).snippets;

const fill = (html, id) => html.split("{{id}}").join(id).replace(/__NX_ID_\d+__/g, id);
const swap = (s, a, b) => s.split(a).join(b);

// snippet keys are the component export name lowercased (Md3TextField -> md3textfield)
const field = snippets["md3textfield"].html;
const emailField = fill(field, "email");
const passwordField = fill(swap(field, "Email", "Password"), "password");
const checkbox = snippets["md3checkbox"].html;
const button = swap(snippets["md3button"].html, "Save", "Sign in");

// The MCP calls the demo plays, with the preview part each one reveals.
const steps = [
  { cmd: 'client.callTool("get_setup", { framework: "html" })', resp: "Tailwind preset + @nucleux/tokens → output.css. Wrap in .nx-theme-mui for Material UI 3.", reveal: "card" },
  { cmd: 'client.callTool("search_components", { query: "login field button checkbox" })', resp: "md3-text-field · md3-button · md3-checkbox · md3-switch · …", reveal: null },
  { cmd: 'client.callTool("get_component", { name: "md3-text-field", framework: "html", template: true })', resp: "<div class=\"w-full\">…{{id}} slot… peer h-14 …</div>  → email field", reveal: "email" },
  { cmd: '// reuse the template, fill a fresh id + label', resp: "…{{id}} → \"password\"…  → password field", reveal: "password" },
  { cmd: 'client.callTool("get_component", { name: "md3-checkbox", framework: "html" })', resp: "<button role=\"checkbox\" …>  → remember me", reveal: "remember" },
  { cmd: 'client.callTool("get_component", { name: "md3-button", framework: "html" })', resp: "<button class=\"…bg-md-primary…\">Sign in</button>", reveal: "signin" },
  { cmd: "// npx tailwindcss -i input.css -o output.css   ✓ renders", resp: "Page assembled from MCP output — Material UI 3.", reveal: "done" },
];

const stepsJson = JSON.stringify(steps.map(({ cmd, resp, reveal }) => ({ cmd, resp, reveal })));

const page = `<style>
${css}
:root{ --demo-bg:#0b0b12; --demo-panel:#12121c; --demo-line:#26263a; --demo-dim:#8a8aa3; --demo-accent:#a78bfa; --demo-ok:#4ade80; }
*{box-sizing:border-box}
.demo{min-height:100%;background:var(--demo-bg);color:#e7e7f0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.demo-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 24px;border-bottom:1px solid var(--demo-line)}
.demo-title{font-size:15px;font-weight:600;letter-spacing:-0.01em}
.demo-title .sub{display:block;font-size:12px;font-weight:400;color:var(--demo-dim);letter-spacing:0}
.demo-replay{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--demo-line);background:var(--demo-panel);color:#e7e7f0;font:inherit;font-size:13px;padding:7px 14px;border-radius:999px;cursor:pointer}
.demo-replay:hover{border-color:var(--demo-accent);color:#fff}
.demo-replay:focus-visible{outline:2px solid var(--demo-accent);outline-offset:2px}
.demo-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;min-height:520px}
@media (max-width:800px){.demo-grid{grid-template-columns:1fr}}
.term{border-right:1px solid var(--demo-line);padding:20px 22px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;line-height:1.65;overflow:auto}
.term-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:middle}
.term-head{color:var(--demo-dim);margin-bottom:14px}
.term-line{white-space:pre-wrap;word-break:break-word;margin:0 0 4px}
.term-cmd{color:#e7e7f0}
.term-cmd .prompt{color:var(--demo-accent);user-select:none}
.term-resp{color:var(--demo-dim);margin:0 0 14px;padding-left:14px;border-left:2px solid var(--demo-line)}
.term-resp.ok{color:var(--demo-ok);border-color:var(--demo-ok)}
.cursor{display:inline-block;width:7px;height:15px;background:var(--demo-accent);vertical-align:text-bottom;animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.stage{display:grid;place-items:center;padding:28px;background:var(--demo-bg)}
.reveal{opacity:0;transform:translateY(8px);transition:opacity .5s ease,transform .5s ease}
.reveal.show{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.reveal{transition:none}.cursor{animation:none}}
</style>
<div class="demo">
  <div class="demo-head">
    <span class="demo-title">Build a page with the Nucleux MCP<span class="sub">get_setup → get_component(html) → render · Material UI 3</span></span>
    <button class="demo-replay" id="replay" type="button">▶ Replay</button>
  </div>
  <div class="demo-grid">
    <div class="term" aria-hidden="true">
      <div class="term-head"><span class="term-dot" style="background:#ff5f57"></span><span class="term-dot" style="background:#febc2e"></span><span class="term-dot" style="background:#28c840"></span> nucleux-mcp · stdio</div>
      <div id="log"></div>
    </div>
    <div class="stage">
      <div class="nx-theme-mui" style="width:100%;display:grid;place-items:center">
        <div class="reveal w-full max-w-sm rounded-md-xl bg-md-surface-container-low p-8 shadow-md-1" data-part="card">
          <h1 class="mb-1 text-2xl text-md-on-surface">Sign in</h1>
          <p class="mb-6 text-sm text-md-on-surface-variant">Welcome back to Nucleux</p>
          <div class="flex flex-col gap-5">
            <div class="reveal" data-part="email">${emailField}</div>
            <div class="reveal" data-part="password">${passwordField}</div>
            <label class="reveal flex items-center gap-1 text-sm text-md-on-surface" data-part="remember">${checkbox}Remember me</label>
            <div class="reveal [&>button]:w-full" data-part="signin">${button}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
const STEPS = ${stepsJson};
const log = document.getElementById("log");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const parts = {};
document.querySelectorAll("[data-part]").forEach((el) => (parts[el.dataset.part] = el));
let token = 0;

function reset() {
  token++;
  log.innerHTML = "";
  Object.values(parts).forEach((el) => el.classList.remove("show"));
}

async function type(el, text, speed) {
  if (reduce) { el.innerHTML = '<span class="prompt">$ </span>' + escapeHtml(text); return; }
  el.innerHTML = '<span class="prompt">$ </span><span class="cursor"></span>';
  const cur = el.querySelector(".cursor");
  for (let i = 0; i < text.length; i++) {
    cur.insertAdjacentText("beforebegin", text[i]);
    await sleep(speed);
  }
  cur.remove();
}
function escapeHtml(s){return s.replace(/[&<>]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));}

async function run() {
  const me = ++token;
  reset();
  token = me;
  for (const step of STEPS) {
    if (token !== me) return;
    const cmd = document.createElement("p");
    cmd.className = "term-line term-cmd";
    log.appendChild(cmd);
    await type(cmd, step.cmd, reduce ? 0 : 14);
    if (token !== me) return;
    await sleep(reduce ? 0 : 160);
    const resp = document.createElement("p");
    const done = step.reveal === "done";
    resp.className = "term-resp" + (done ? " ok" : "");
    resp.textContent = (done ? "✓ " : "→ ") + step.resp;
    log.appendChild(resp);
    if (step.reveal && parts[step.reveal]) parts[step.reveal].classList.add("show");
    else if (step.reveal === "done") Object.values(parts).forEach((el) => el.classList.add("show"));
    log.scrollTop = log.scrollHeight;
    await sleep(reduce ? 0 : 900);
  }
}

document.getElementById("replay").addEventListener("click", run);
run();
</script>
`;

writeFileSync(join(outDir, "mcp-demo.artifact.html"), page);
console.log(`mcp-demo.artifact.html ready (${page.length} bytes)`);
