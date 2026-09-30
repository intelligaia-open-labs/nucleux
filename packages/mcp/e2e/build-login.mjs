// PURE MCP-DRIVEN login pages: connect to the built @nucleux/mcp server, and
// assemble login pages entirely from the markup it returns via
// get_component(framework:"html"). The only edits are visible label text
// (Email->Password, Save->Sign in, Accept->Remember me) — every element, class,
// and structure comes verbatim from the MCP server. Records the full exchange.
//
//   node packages/mcp/e2e/build-login.mjs
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const mcpDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const root = join(mcpDir, "..", "..");
const outDir = join(root, "examples", "e2e");

const textOf = (r) => r.content?.map((c) => c.text ?? "").join("\n") ?? "";
const fenced = (s) => (s.match(/```html\n([\s\S]*?)```/) || [])[1]?.trim() ?? null;
const swap = (s, a, b) => s.split(a).join(b);

const log = ["# Pure MCP-driven login — transcript", ""];
const rec = (t, b) => log.push(`## ${t}`, "", "```", b.trim(), "```", "");

async function main() {
  const transport = new StdioClientTransport({ command: "node", args: ["dist/index.js"], cwd: mcpDir });
  const client = new Client({ name: "nucleux-login-builder", version: "1.0.0" });
  await client.connect(transport);

  // Discover + setup, exactly as an agent would
  rec("search_components 'login form text field button checkbox'",
    textOf(await client.callTool({ name: "search_components", arguments: { query: "login form text field button checkbox password" } })));
  const setupHtml = textOf(await client.callTool({ name: "get_setup", arguments: { framework: "html" } }));
  rec("get_setup · html", setupHtml);

  // Pull the exact HTML markup for each component from the server
  const getHtml = async (name) => {
    const out = textOf(await client.callTool({ name: "get_component", arguments: { name, framework: "html" } }));
    rec(`get_component ${name} · html`, out);
    const html = fenced(out);
    if (!html) throw new Error(`no html snippet for ${name}`);
    return html;
  };

  // --- Material UI 3 login (md3-* snippets) ---
  const mdField = await getHtml("md3-text-field");
  const mdBtn = await getHtml("md3-button");
  const mdCheck = await getHtml("md3-checkbox");

  // Each field snippet carries its own generated id; reusing it verbatim would
  // duplicate ids. Uniquify the clone's id so label/aria wiring stays valid.
  const mdBaseId = (mdField.match(/\sid="([^"]+)"/) || [])[1];
  const mdEmail = mdField;
  const mdPassword = mdBaseId
    ? swap(swap(mdField, "Email", "Password"), mdBaseId, `${mdBaseId}-pw`)
    : swap(mdField, "Email", "Password");
  const mdSignIn = `<div class="[&>button]:w-full">${swap(mdBtn, "Save", "Sign in")}</div>`;
  const mdRemember = `<label class="flex items-center gap-1 text-sm text-md-on-surface">${mdCheck}Remember me</label>`;

  const mdLogin = `<div class="grid min-h-screen place-items-center bg-md-surface p-6">
  <div class="w-full max-w-sm rounded-md-xl bg-md-surface-container-low p-8 shadow-md-1">
    <h1 class="mb-1 text-2xl text-md-on-surface">Sign in</h1>
    <p class="mb-6 text-sm text-md-on-surface-variant">Welcome back to Nucleux</p>
    <div class="flex flex-col gap-5">
      ${mdEmail}
      ${mdPassword}
      ${mdRemember}
      ${mdSignIn}
    </div>
  </div>
</div>`;

  // --- shadcn login (base primitives) ---
  const scLabelPair = await getHtml("label"); // <label…>Name</label><input id…>
  const scBtn = await getHtml("button");
  const scCheck = await getHtml("checkbox");
  const scSep = await getHtml("separator");

  // The label snippet ships id/for="nm"; give each field a unique id.
  const scEmail = swap(swap(scLabelPair, "Name", "Email"), "nm", "email");
  const scPassword = swap(swap(scLabelPair, "Name", "Password"), "nm", "password");
  const scSignIn = `<div class="[&>button]:w-full">${swap(scBtn, "Save", "Sign in")}</div>`;
  const scRemember = `<label class="flex items-center gap-2 text-sm text-foreground">${scCheck}Remember me</label>`;

  const scLogin = `<div class="grid min-h-screen place-items-center bg-muted/30 p-6">
  <div class="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
    <h1 class="mb-1 text-2xl font-semibold text-foreground">Sign in</h1>
    <p class="mb-6 text-sm text-muted-foreground">Welcome back to Nucleux</p>
    <div class="flex flex-col gap-4">
      <div class="space-y-1.5">${scEmail}</div>
      <div class="space-y-1.5">${scPassword}</div>
      ${scRemember}
      ${scSignIn}
    </div>
    <div class="my-5 flex items-center gap-3 text-xs uppercase text-muted-foreground">${scSep}or${scSep}</div>
  </div>
</div>`;

  await client.close();

  mkdirSync(outDir, { recursive: true });
  const pageDoc = (cls, body) =>
    `<!doctype html>\n<html lang="en"${cls}><head><meta charset="utf-8"/><link rel="stylesheet" href="./output.css"/></head><body>${body}</body></html>\n`;
  writeFileSync(join(outDir, "login-mcp.html"), pageDoc(' class="nx-theme-mui"', mdLogin));
  writeFileSync(join(outDir, "login-shadcn-mcp.html"), pageDoc("", scLogin));
  writeFileSync(join(outDir, "login-mcp-transcript.md"), log.join("\n"));

  // Build CSS per get_setup(html), scanning all e2e pages, then inline artifacts.
  execSync(
    "pnpm exec tailwindcss -c examples/e2e/tailwind.config.cjs -i examples/e2e/input.css -o examples/e2e/output.css --minify",
    { cwd: root, stdio: "inherit" },
  );
  const css = readFileSync(join(outDir, "output.css"), "utf8");
  writeFileSync(join(outDir, "login-mcp.artifact.html"), `<style>\n${css}\n</style>\n<div class="nx-theme-mui">${mdLogin}</div>\n`);
  writeFileSync(join(outDir, "login-shadcn-mcp.artifact.html"), `<style>\n${css}\n</style>\n${scLogin}\n`);

  console.log("Pure MCP login pages built from get_component(html) snippets:");
  console.log("  examples/e2e/login-mcp.artifact.html  (Material UI 3)");
  console.log("  examples/e2e/login-shadcn-mcp.artifact.html  (shadcn)");
  console.log("  examples/e2e/login-mcp-transcript.md");
}

main().catch((err) => {
  console.error("build-login failed:", err);
  process.exit(1);
});
