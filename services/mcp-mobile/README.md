# @intelligaia/nucleux-mobile-mcp

> **This copy.** The source of truth is the private `intelligaia/nucleux-mobile` repo
> (`mcp/`), where the catalog is generated from the kit's sources. This folder is a
> snapshot of it (from `b0859b3`) kept next to the web MCP and the hosted server
> (`services/mcp-http`, which serves Nucleux Mobile to signed-in users). To refresh it:
> in a clone of `nucleux-mobile` run `npm run mcp:catalog`, then copy `mcp/` here
> (`git -C <clone> archive HEAD mcp | tar -x --strip-components=1 -C services/mcp-mobile`)
> and keep the test change that skips the kit-dependent checks. Run those checks with
> `NUCLEUX_MOBILE_REPO=<clone> npm test`. Not published to npm (`"private": true`;
> licence `UNLICENSED`).

A [Model Context Protocol](https://modelcontextprotocol.io) server that lets AI coding agents (Claude Code, Cursor, any MCP client) discover and correctly use **Nucleux Mobile** in SwiftUI, Jetpack Compose, Flutter and React Native: what each component is, its exact public API per framework, the exact words it shows and announces, a working example, and how to set the kit up.

Everything it answers comes from `src/mobile-catalog.json`, which `scripts/gen-mcp-catalog.mjs` generates from this repo (the Component tracker in `docs/BUILD_LOG.md`, `specs/*.md` and `*.fixtures.json`, the four frameworks' sources, the iOS catalog app and the component tests). Regenerate it with `npm run mcp:catalog` after changing a component; `npm run mcp:catalog:check` and this package's tests fail when it is stale.

## Private: from GitHub

Nucleux Mobile is private, and so is this server. It is **not published to npm**, not part of the public `@nucleux/mcp` and not on the nucleux.in connector; `package.json` is `"private": true` so it can't be published by mistake.

**The quick way:** the private repo [intelligaia/nucleux-mobile-mcp](https://github.com/intelligaia/nucleux-mobile-mcp) holds the server bundled into one file (the MCP SDK, zod and the catalog included). npm fetches it with your own GitHub access (an SSH key on your account, or `gh auth setup-git` once):

```sh
claude mcp add nucleux-mobile -- npx -y github:intelligaia/nucleux-mobile-mcp
```

Maintainers refresh it after a component change with `npm run mcp:catalog && npm run mcp:publish` (`scripts/publish-mcp-repo.mjs`; `--dry-run` commits without pushing). It only ever holds the bundle, a package.json and a README.

**From a clone of this repo** (needs read access to `intelligaia/nucleux-mobile`):

```sh
gh repo clone intelligaia/nucleux-mobile        # or: git clone git@github.com:intelligaia/nucleux-mobile.git
cd nucleux-mobile/mcp
npm ci                                          # installs and builds dist/ (index.js the server, lib.js the module)
node dist/index.js                              # stdio
```

Node 18 or later. To update: `git pull && npm ci` in `mcp/`.

## Add it to an agent

Claude Code: `claude mcp add nucleux-mobile -- npx -y github:intelligaia/nucleux-mobile-mcp`, or from a clone, `claude mcp add nucleux-mobile -- node /absolute/path/to/nucleux-mobile/mcp/dist/index.js`.

Cursor (`.cursor/mcp.json` in the project, or `~/.cursor/mcp.json`) and any other MCP client:

```json
{
  "mcpServers": {
    "nucleux-mobile": { "command": "npx", "args": ["-y", "github:intelligaia/nucleux-mobile-mcp"] }
  }
}
```

## Tools

Every tool that depends on the platform takes `framework`: `"swiftui" | "compose" | "flutter" | "react-native"`. Without it, a tool covers all four (the server's instructions tell the agent to ask which one the project uses). Names are loose: `composer`, `PromptComposer`, `prompt-composer` and `NucleuxPromptComposer` all resolve.

| Tool | What it returns |
|---|---|
| `list_components` | Every component and pattern: kind, one line, status per framework (`kind` filters) |
| `get_component` | Description, status, import line, the framework's public API (Swift public types, inits and modifiers; Kotlin `@Composable` functions and classes with defaults; Dart constructors with named parameters; RN components and `Props`), key words, spec summary, related components |
| `search_components` | Keyword search over names, aliases, descriptions, symbols and spec text |
| `get_setup` | Dependency (SwiftPM, Gradle module, Flutter git/path, npm from GitHub Packages), theming, `NucleuxMenuHost`, the Lucide font, announcements, minimum versions, conventions |
| `list_examples` / `get_example` | The iOS catalog screen (SwiftUI) or the component-test host (Compose, Flutter, RN), under ~150 lines |
| `get_mobile_spec` | The full `specs/<name>.md` |
| `get_mobile_words` | The exact strings and announcements from the fixtures, and the framework's constants |
| `validate_mobile_usage` | A static check of agent-written code: Nucleux names that do not exist, removed APIs (`caveat`/`onCaveatPress` → `onLimitsPress`, `NucleuxTrust.caveat`/`CAVEAT_OUTPUT` → `NucleuxCaveat`), generic AI-warning copy, hard-coded colours, stolen focus, separate composers, web-kit imports. Returns JSON issues with fixes |

The shared names (`list_components`, `get_component`, `search_components`, `get_setup`, `list_examples`, `get_example`) match the web `@nucleux/mcp` server's, so an agent with both connected uses the same habits; the mobile-only tools carry `mobile` in their names. The two are served separately: this one stays private.

## Embedding the tools in another (private) server

`dist/lib.js` exports `registerMobileTools(server, catalog, { shared })`, the pure query functions (`listMobileComponents`, `getMobileComponent`, `searchMobileComponents`, `getMobileSetup`, `getMobileExample`, `getMobileWords`, `getMobileSpec`, `validateUsage`), `MOBILE_INSTRUCTIONS` and `MOBILE_CONVENTIONS`. A host that already owns the shared tool names registers with `{ shared: false }` (only the three mobile-only tools) and routes mobile `framework` values to the query functions from its own handlers.

## Tests

```sh
cd mcp && npm test   # typecheck, build, then node:test over the SDK's in-memory transport
```
