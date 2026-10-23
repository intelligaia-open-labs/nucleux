// The connect prompt the site's MCP page (nucleux.in/mcp) hands out for a
// one-time code. It is pasted into a coding agent that has no other context, may
// run sandboxed, and must never echo the token, so it has to be self-contained.

export function connectPrompt({ code, base, site }) {
  const cmd = `npx -y @nucleux/mcp@latest add --code ${code}`;
  return [
    `Connect the coding agents on this machine to the Nucleux MCP server, hosted at ${base}.`,
    ``,
    `1. Run this once, in a terminal on THIS machine (not a remote container or cloud sandbox), from the root of the project I'm working in:`,
    ``,
    `   ${cmd}`,
    ``,
    `   - The code ${code} works once and expires 10 minutes after it was generated. If the command says the code is "unknown, expired or already used", don't retry it: ask me for a new prompt from ${site}.`,
    `   - It needs Node.js 18 or later and network access to registry.npmjs.org and ${new URL(base).host}. If npx is missing, tell me to install Node.js from https://nodejs.org; don't install it yourself. If npm is behind a proxy, it uses the HTTPS_PROXY setting.`,
    `   - If your sandbox blocks network access or writing to my home folder, stop and ask me to run the command myself in my own terminal.`,
    `   - It finds Claude Code, Cursor, VS Code, Codex, Windsurf, Gemini CLI and Claude Desktop, and connects each one directly to ${base} with a personal token for this machine. It replaces any existing "nucleux" MCP entry and keeps every other server and setting. If it finds no agent, run it again with --only and the agent you are (claude-code, cursor, vscode, codex, windsurf, gemini or claude-desktop).`,
    `   - If it can't read an agent's config file (for example JSON with comments), it leaves that file untouched and prints what to add. Tell me which file, but don't add it yourself and don't show the token.`,
    `   - Run from a project folder, it also adds the nucleux-design guidance (a skill and an AGENTS.md section) to the project. Add --no-project if I don't want project files changed.`,
    ``,
    `2. Check it worked: run \`npx -y @nucleux/mcp@latest whoami\`. It should print "Signed in to ${base}". If it says the token was rejected, ask me for a new prompt from ${site}.`,
    ``,
    `3. Tell me which agents were connected, and that each one has to be restarted before it can use Nucleux (MCP servers are loaded when an agent starts, so this session won't see the tools until then). After the restart the nucleux tools (list_components, get_component, search_patterns, get_setup…) are available.`,
    ``,
    `4. Keep the token secret. It is stored in ~/.config/nucleux/credentials.json and in each agent's MCP config, readable only by me. Never print, paste, log or commit it, and never copy those files into the project. To disconnect this machine and remove the token, run \`npx -y @nucleux/mcp logout\`; if the token may have leaked, also ask the Nucleux team to revoke it.`,
    ``,
    `5. Afterwards, when I ask you to build UI with Nucleux, first work out the platform from the project: Package.swift or an .xcodeproj is SwiftUI, build.gradle(.kts) with Compose is Jetpack Compose, pubspec.yaml is Flutter, a package.json with react-native is React Native, and a React, Next.js or Vite web app is web. For mobile, pass that framework (swiftui, compose, flutter or react-native) to the Nucleux tools. For web, ask me "Material 3 or shadcn?". Ask me only what you can't tell from the project or what it already records (AGENTS.md or CLAUDE.md, e.g. "Nucleux platform: SwiftUI" or "Nucleux family: Material 3"), record the answer there, then follow the Nucleux MCP's instructions.`,
  ].join("\n");
}
