#!/usr/bin/env node
// Runs the benchmark: each request × arm in a fresh copy of a template app,
// with headless Claude Code, then scores the result with evals/score.mjs.
//
//   node evals/run.mjs --template <app-dir> --out <dir> [--requests id,id] [--arms nucleux,baseline]
//                      [--budget 15] [--model <id>]
//
// Arms differ only in tooling; the prompt is identical:
//   nucleux   nucleux MCP server (this repo's packages/mcp/dist) + nucleux-design skill
//   baseline  no MCP servers, no skill (the agent can still read node_modules)
//
// The template must be a buildable app with @nucleux/react and @nucleux/tokens
// installed (see evals/README.md). Costs real API spend: budget is per run.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const template = arg("template") && resolve(arg("template"));
const out = arg("out") && resolve(arg("out"));
if (!template || !out) {
  console.error("usage: node evals/run.mjs --template <app-dir> --out <dir> [--requests ids] [--arms nucleux,baseline]");
  process.exit(1);
}
const { suffix, requests } = JSON.parse(readFileSync(join(root, "evals/requests.json"), "utf8"));
const pick = arg("requests")?.split(",");
const arms = (arg("arms") ?? "nucleux,baseline").split(",");
const budget = arg("budget", "15");
const model = arg("model");
const mcpBin = join(root, "packages/mcp/dist/index.js");
if (!existsSync(mcpBin)) throw new Error("Build the MCP server first: pnpm --filter @nucleux/mcp build");

mkdirSync(out, { recursive: true });
const mcpConfigs = {
  nucleux: { mcpServers: { nucleux: { command: "node", args: [mcpBin] } } },
  baseline: { mcpServers: {} },
};

const ALLOWED = ["Read", "Edit", "Write", "Glob", "Grep", "Skill", "mcp__nucleux", "Bash(npm *)", "Bash(npx *)",
  "Bash(node *)", "Bash(ls *)", "Bash(mkdir *)", "Bash(cat *)", "Bash(grep *)"];

const summary = [];
for (const req of requests.filter((r) => !pick || pick.includes(r.id))) {
  for (const arm of arms) {
    const dir = join(out, `${req.id}--${arm}`);
    cpSync(template, dir, { recursive: true });
    if (arm === "nucleux") spawnSync("node", [mcpBin, "init", "--claude"], { cwd: dir, stdio: "ignore" });
    const mcpFile = join(out, `mcp-${arm}.json`);
    writeFileSync(mcpFile, JSON.stringify(mcpConfigs[arm]));

    console.error(`▶ ${req.id} / ${arm}`);
    const started = Date.now();
    const res = spawnSync(
      "claude",
      ["-p", `${req.prompt}\n\n${suffix}`, "--mcp-config", mcpFile, "--strict-mcp-config", "--permission-mode", "dontAsk",
        "--allowedTools", ...ALLOWED, "--max-turns", "200", "--max-budget-usd", budget, "--output-format", "json",
        ...(model ? ["--model", model] : [])],
      { cwd: dir, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
    );
    writeFileSync(`${dir}.result.json`, res.stdout);
    let meta = {};
    try { meta = JSON.parse(res.stdout); } catch { /* run failed; scored as-is */ }
    // Claude Code stores the session transcript under ~/.claude/projects/<cwd with / and . as ->/.
    const transcript = join(homedir(), ".claude/projects", dir.replace(/[/.]/g, "-"), `${meta.session_id}.jsonl`);
    const score = JSON.parse(
      spawnSync("node", [join(root, "evals/score.mjs"), dir, transcript], { encoding: "utf8" }).stdout,
    );
    const row = {
      request: req.id, arm, minutes: +((Date.now() - started) / 60000).toFixed(1),
      costUsd: meta.total_cost_usd, turns: meta.num_turns, ...score,
    };
    writeFileSync(`${dir}.score.json`, JSON.stringify(row, null, 2));
    summary.push(row);
  }
}
writeFileSync(join(out, "summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary.map((r) => ({
  request: r.request, arm: r.arm, build: r.build.ok, nucleuxImports: r.nucleux.distinctImports,
  unknown: r.nucleux.unknownImports.length, handRolled: Object.values(r.handRolled).reduce((a, b) => a + b, 0),
  offToken: r.offTokenColors.hex + r.offTokenColors.palette, responsive: r.responsive, costUsd: r.costUsd,
})), null, 2));
