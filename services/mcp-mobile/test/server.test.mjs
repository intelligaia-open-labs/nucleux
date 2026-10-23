// Runs the server in-process over the SDK's in-memory transport and exercises every tool, then checks the catalog
// is what scripts/gen-mcp-catalog.mjs would write now. `npm test` builds dist/ first.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  catalog,
  createServer,
  getMobileComponent,
  MOBILE_FRAMEWORKS,
  MOBILE_TOOL_NAMES,
  registerMobileTools,
  resolveMobileComponent,
  validateUsage,
} from "../dist/lib.js";

const here = dirname(fileURLToPath(import.meta.url));
// The kit's sources (generator, build log, specs) live in the private
// intelligaia/nucleux-mobile repo. Inside it this is ../..; elsewhere (this copy in
// intelligaia-open-labs/nucleux) point NUCLEUX_MOBILE_REPO at a clone to run the
// freshness and fixture checks, which are skipped otherwise.
const repo = process.env.NUCLEUX_MOBILE_REPO || join(here, "..", "..");
const needsKit = existsSync(join(repo, "specs")) ? {} : { skip: "needs a clone of intelligaia/nucleux-mobile (set NUCLEUX_MOBILE_REPO)" };

let client;
before(async () => {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "nucleux-mobile-test", version: "0.0.0" });
  await Promise.all([createServer().connect(serverSide), client.connect(clientSide)]);
});
after(() => client.close());

const call = async (name, args = {}) => {
  const res = await client.callTool({ name, arguments: args });
  return { text: res.content.map((c) => c.text).join("\n"), isError: res.isError === true };
};

describe("catalog", () => {
  it("is fresh: matches what the generator writes from the repo now", needsKit, () => {
    execFileSync(process.execPath, [join(repo, "scripts/gen-mcp-catalog.mjs"), "--check"], { stdio: "pipe" });
  });

  it("has every tracker row, with status in all four frameworks", needsKit, () => {
    const log = readFileSync(join(repo, "docs/BUILD_LOG.md"), "utf8").split("## Component tracker")[1].split("\n## ")[0];
    const rows = log.split("\n").filter((l) => /^\| [A-Z]/.test(l) && !l.startsWith("| Component |"));
    const tracked = new Set(catalog.components.flatMap((c) => c.tracker));
    for (const r of rows) assert.ok(tracked.has(r.split("|")[1].trim()), `tracker row not in the catalog: ${r.slice(0, 60)}`);
    for (const c of catalog.components) for (const fw of MOBILE_FRAMEWORKS) assert.ok(c.status[fw], `${c.id} ${fw}`);
  });

  it("extracts multi-line Swift inits, Kotlin defaults, Dart named params and RN Props", () => {
    const composer = resolveMobileComponent(catalog, "composer");
    const swift = composer.frameworks.swiftui.symbols.find((s) => s.name === "NucleuxPromptComposer");
    assert.match(swift.members.find((m) => m.name === "init").signature, /readyDelay: Duration = \.milliseconds\(600\), onSend: @escaping \(String\) -> Void\)$/);
    const kt = composer.frameworks.compose.symbols.find((s) => s.name === "NucleuxPromptComposer");
    assert.match(kt.signature, /agentName: String = "The assistant"/);
    assert.match(kt.signature, /onLimitsPress: \(\(\) -> Unit\)\? = null\)$/);
    assert.ok(kt.annotations.includes("@Composable"));
    const dart = composer.frameworks.flutter.symbols.find((s) => s.name === "NucleuxPromptComposer").members.find((m) => m.kind === "constructor");
    const p = Object.fromEntries(dart.params.map((x) => [x.name, x]));
    assert.deepEqual([p.controller.required, p.controller.type], [true, "TextEditingController"]);
    assert.deepEqual([p.agentName.required, p.agentName.default], [false, "'The assistant'"]);
    assert.equal(p.onLimitsPress.type, "VoidCallback?");
    const props = composer.frameworks["react-native"].symbols.find((s) => s.name === "PromptComposerProps");
    assert.ok(props.members.some((m) => m.name === "onLimitsPress" && m.optional));
    assert.ok(!props.members.some((m) => m.name === "caveat" || m.name === "onCaveatPress"));
  });

  it("gathers the SwiftUI composer options (View modifiers) on the composer", () => {
    const opts = resolveMobileComponent(catalog, "composer").frameworks.swiftui.symbols.find((s) => s.name === "NucleuxPromptComposer options");
    const names = opts.members.map((m) => m.name);
    for (const n of ["nucleuxVoice", "nucleuxAttachments", "nucleuxSuggestions", "nucleuxAutocomplete", "nucleuxComposerSettings", "nucleuxDisclaimerLine"]) assert.ok(names.includes(n), n);
  });

  it("keeps fixture words exact", needsKit, () => {
    const fx = JSON.parse(readFileSync(join(repo, "specs/caveat.fixtures.json"), "utf8"));
    const c = resolveMobileComponent(catalog, "Caveat");
    assert.deepEqual(c.words["specs/caveat.fixtures.json"].constants.words, fx.words);
  });

  it("has an example per framework for the core patterns, none longer than 150 lines", () => {
    for (const id of ["prompt-composer", "caveat", "modes", "madlibs"]) {
      for (const fw of MOBILE_FRAMEWORKS) assert.ok(catalog.examples.some((e) => e.name === id && e.framework === fw), `${id} ${fw}`);
    }
    for (const e of catalog.examples) assert.ok(e.code.split("\n").length <= 155, `${e.name} ${e.framework}: ${e.code.split("\n").length}`);
  });
});

describe("MCP server", () => {
  it("registers the shared and the mobile-only tools, with instructions", async () => {
    const names = (await client.listTools()).tools.map((t) => t.name).sort();
    assert.deepEqual(names, [...MOBILE_TOOL_NAMES.shared, ...MOBILE_TOOL_NAMES.mobileOnly].sort());
    assert.equal(client.getServerVersion().name, "nucleux-mobile");
    const ins = client.getInstructions();
    for (const s of ["SwiftUI", "Jetpack Compose", "Flutter", "React Native", "44pt", "48dp", "never a new composer", "rounded square", "AI generated", "can make mistakes", "exact wording"]) assert.ok(ins.includes(s), s);
  });

  it("list_components lists every component with status", async () => {
    const { text } = await call("list_components");
    for (const c of catalog.components) assert.ok(text.includes(`\`${c.id}\``), c.id);
    assert.match(text, /SwiftUI Done · Compose Done · Flutter Done · React Native Done/);
    const flutter = await call("list_components", { framework: "flutter", kind: "pattern" });
    assert.match(flutter.text, /NucleuxMadlibCard/);
    assert.doesNotMatch(flutter.text, /`button`/);
  });

  it("get_component resolves loose names and returns the framework's API", async () => {
    for (const q of ["composer", "PromptComposer", "prompt-composer", "NucleuxPromptComposer"]) {
      const { text } = await call("get_component", { name: q });
      assert.match(text, /^# PromptComposer/, q);
    }
    const swift = await call("get_component", { name: "Caveat", framework: "swiftui" });
    assert.match(swift.text, /public init\(_ content: NucleuxCaveatRules\.Content, onRecover: \(\(\) async -> Bool\)\? = nil/);
    assert.match(swift.text, /public static let review = "Review sources"/);
    const kt = await call("get_component", { name: "modes", framework: "compose" });
    assert.match(kt.text, /rememberModeControl|NucleuxModeControl/);
    const dart = await call("get_component", { name: "madlibs", framework: "flutter" });
    assert.match(dart.text, /`control`: `NucleuxMadlibControl` \*\*required\*\*/);
    const rn = await call("get_component", { name: "Madlibs", framework: "react-native" });
    assert.match(rn.text, /import \{ MadlibCard.*\} from '@intelligaia\/nucleux';/);
    const miss = await call("get_component", { name: "HoloDeck" });
    assert.equal(miss.isError, true);
  });

  it("search_components finds by what it does", async () => {
    assert.match((await call("search_components", { query: "fill in the blanks" })).text, /\*\*Madlibs\*\*/);
    assert.match((await call("search_components", { query: "voice input" })).text, /^.*\n\n- \*\*Voice input\*\*/);
    assert.match((await call("search_components", { query: "zzzz qqqq" })).text, /No Nucleux Mobile component matches/);
  });

  it("get_mobile_spec returns the full spec", needsKit, async () => {
    const { text } = await call("get_mobile_spec", { name: "caveat" });
    assert.ok(text.includes(readFileSync(join(repo, "specs/caveat.md"), "utf8").trim().slice(0, 400)));
    assert.equal((await call("get_mobile_spec", { name: "nope-nope" })).isError, true);
  });

  it("get_mobile_words returns the fixtures' exact strings and the framework constants", async () => {
    const { text } = await call("get_mobile_words", { name: "caveat", framework: "compose" });
    assert.match(text, /"recoverFailed": "Couldn’t reconnect\. Nothing changed; try again, or review the sources\."/);
    assert.match(text, /NucleuxCaveatRules\.RECOVER_FAILED/);
    const rn = await call("get_mobile_words", { name: "modes" });
    assert.match(rn.text, /MODE_CLEAR/);
  });

  it("get_setup covers each framework and the conventions", async () => {
    const swift = await call("get_setup", { framework: "swiftui" });
    for (const s of ["NucleuxMenuHost", "iOS 17", "nucleux-mobile.git", "lucide"]) assert.ok(swift.text.includes(s), s);
    const kt = await call("get_setup", { framework: "compose" });
    for (const s of ["minSdk 24", 'include(":nucleux")', "NucleuxTheme"]) assert.ok(kt.text.includes(s), s);
    const dart = await call("get_setup", { framework: "flutter" });
    for (const s of ["path: flutter", "package:nucleux/nucleux.dart", "NucleuxTheme"]) assert.ok(dart.text.includes(s), s);
    const rn = await call("get_setup", { framework: "react-native" });
    for (const s of ["npm.pkg.github.com", "@intelligaia/nucleux", "NucleuxProvider", "lucide.ttf"]) assert.ok(rn.text.includes(s), s);
    const all = await call("get_setup");
    assert.match(all.text, /Ask which one the project uses/);
  });

  it("list_examples and get_example", async () => {
    const list = await call("list_examples", { framework: "swiftui" });
    assert.match(list.text, /- caveat \(swiftui\) — CaveatScreen/);
    const swift = await call("get_example", { name: "Caveat", framework: "swiftui" });
    assert.match(swift.text, /struct CaveatScreen: View/);
    assert.match(swift.text, /NucleuxCaveat\(/);
    const kt = await call("get_example", { name: "modes", framework: "compose" });
    assert.match(kt.text, /setContent/);
    const dart = await call("get_example", { name: "madlibs", framework: "flutter" });
    assert.match(dart.text, /pumpWidget/);
    const rn = await call("get_example", { name: "composer", framework: "react-native" });
    assert.match(rn.text, /render\(/);
    assert.match(rn.text, /from '@intelligaia\/nucleux'/);
    assert.match((await call("get_example", { name: "personality", framework: "swiftui" })).text, /NucleuxPersonalitySetting\(/);
    assert.equal((await call("get_example", { name: "model-chip", framework: "swiftui" })).isError, true);
  });

  it("validate_mobile_usage reports invented and removed APIs, generic copy, colours and focus", async () => {
    const swift = JSON.parse((await call("validate_mobile_usage", {
      framework: "swiftui",
      code: [
        'NucleuxPromptComposer(text: $text, label: "Ask Aria") { send($0) }',
        "  .nucleuxCaveat(NucleuxTrust.caveat(\"Aria\"))",
        "  .foregroundStyle(Color(red: 0.2, green: 0.2, blue: 0.2))",
        'Text("Aria can make mistakes. Verify important information before sharing.")',
        "NucleuxVoiceComposer()",
        "NucleuxCaveatz(content)",
        "isFocused = true",
      ].join("\n"),
    })).text);
    const codes = swift.issues.map((i) => i.code);
    assert.equal(swift.valid, false);
    for (const c of ["removed-api", "hard-coded-colour", "generic-ai-warning", "separate-composer", "unknown-symbol", "steals-focus"]) assert.ok(codes.includes(c), c);
    assert.match(swift.issues.find((i) => i.match === "NucleuxCaveatz").fix, /NucleuxCaveat/);

    const rn = JSON.parse((await call("validate_mobile_usage", {
      framework: "react-native",
      code: "import { PromptComposer, CAVEAT_OUTPUT, FancyThing } from '@intelligaia/nucleux';\n<PromptComposer caveat={x} onCaveatPress={y} />\n<View style={{ backgroundColor: '#fff' }} />",
    })).text);
    const rnCodes = rn.issues.map((i) => `${i.code}:${i.match}`);
    assert.ok(rnCodes.some((c) => c.startsWith("removed-api:onCaveatPress")));
    assert.ok(rnCodes.some((c) => c.startsWith("removed-api:CAVEAT_OUTPUT")));
    assert.ok(rnCodes.includes("unknown-symbol:FancyThing"));

    const consent = JSON.parse((await call("validate_mobile_usage", {
      framework: "swiftui",
      code: "NucleuxConsentAsk(agent: \"Aria\", resource: \"Q2 board pack.pdf\") { _ in }\nlet on = NucleuxConsent.initial(scopes)",
    })).text);
    assert.ok(consent.issues.some((i) => i.code === "removed-api" && i.match === "NucleuxConsentAsk"));
    assert.match(consent.issues.find((i) => i.match === "NucleuxConsentAsk").fix, /NucleuxConsentRequest/);

    const tpl = JSON.parse((await call("validate_mobile_usage", {
      framework: "flutter",
      code: "NucleuxTemplateCard(template: t, onRun: run, onEditAsText: edit)",
    })).text);
    assert.ok(tpl.issues.some((i) => i.code === "removed-api" && i.match === "NucleuxTemplateCard"));
    assert.match(tpl.issues.find((i) => i.match === "NucleuxTemplateCard").fix, /NucleuxTemplateFlow/);

    const disc = JSON.parse((await call("validate_mobile_usage", {
      framework: "flutter",
      code: "NucleuxDisclosureChip(label: NucleuxTrust.draftedBy('Aria'))\nText('Generated with AI and verified by Aria')",
    })).text);
    assert.ok(disc.issues.some((i) => i.code === "removed-api" && i.match === "draftedBy"));
    assert.match(disc.issues.find((i) => i.match === "draftedBy").fix, /NucleuxGeneratedLabel/);
    assert.ok(disc.issues.some((i) => i.code === "disclosure-claims-checked"));

    const glyph = JSON.parse((await call("validate_mobile_usage", {
      framework: "compose",
      code: "Row { NucleuxIcon(NucleuxIcons.Sparkles, size = 14.dp); BasicText(\"Generated with AI\") }",
    })).text);
    assert.ok(glyph.issues.some((i) => i.code === "ai-glyph-by-name"));

    const lim = JSON.parse((await call("validate_mobile_usage", {
      framework: "swiftui",
      code: "NucleuxDisclaimerScope(can: a, willNot: b, cannotSee: c)",
    })).text);
    assert.ok(lim.issues.some((i) => i.code === "removed-api" && /willNot/.test(i.match)));

    const tip = JSON.parse((await call("validate_mobile_usage", {
      framework: "flutter",
      code: "NucleuxNudgeHint(controller: c, id: 'summarise', onAccept: go)",
    })).text);
    assert.ok(tip.issues.some((i) => i.code === "removed-api" && i.match === "NucleuxNudgeHint"));

    const av = JSON.parse((await call("validate_mobile_usage", {
      framework: "compose",
      code: "NucleuxAgentAvatar(\"Aria\", size = NucleuxAvatarSize.Lg)",
    })).text);
    assert.ok(av.issues.some((i) => i.code === "removed-api" && i.match === "NucleuxAvatarSize.Lg"));
    const gal = JSON.parse((await call("validate_mobile_usage", {
      framework: "react-native",
      code: "<ExampleDetail example={e} onUse={place} />",
    })).text);
    assert.ok(gal.issues.some((i) => i.code === "removed-api" && /ExampleDetail/.test(i.match)));
    assert.match(gal.issues.find((i) => /ExampleDetail/.test(i.match)).fix, /onPlace/);
    assert.match(tip.issues.find((i) => i.match === "NucleuxNudgeHint").fix, /NucleuxTip/);
    assert.match(lim.issues.find((i) => /willNot/.test(i.match)).fix, /needsApproval/);
    assert.match(glyph.issues.find((i) => i.code === "ai-glyph-by-name").fix, /MARKS/);
    assert.ok(rnCodes.some((c) => c.startsWith("hard-coded-colour")));

    const ok = JSON.parse((await call("validate_mobile_usage", {
      framework: "compose",
      code: "NucleuxTheme {\n  NucleuxPromptComposer(text = t, onTextChange = { t = it }, label = \"Message Aria\", onSend = {}, onLimitsPress = { open = true })\n  NucleuxCaveat(content, onRecover = { true })\n  BasicText(\"x\", style = TextStyle(color = Nucleux.colors.foreground))\n}",
    })).text);
    assert.deepEqual(ok.issues, []);
    assert.equal(ok.valid, true);
  });
});

describe("embedding", () => {
  it("registers only the mobile-only tools when the host owns the shared names", async () => {
    const host = new McpServer({ name: "host", version: "0.0.0" });
    host.tool("list_components", "host's own", {}, async () => ({ content: [{ type: "text", text: "web" }] }));
    registerMobileTools(host, catalog, { shared: false });
    const [a, b] = InMemoryTransport.createLinkedPair();
    const c = new Client({ name: "t", version: "0" });
    await Promise.all([host.connect(b), c.connect(a)]);
    const names = (await c.listTools()).tools.map((t) => t.name).sort();
    assert.deepEqual(names, ["get_mobile_spec", "get_mobile_words", "list_components", "validate_mobile_usage"]);
    await c.close();
  });

  it("pure functions work without a server", () => {
    assert.equal(getMobileComponent(catalog, "Modes", "flutter").found, true);
    assert.equal(validateUsage(catalog, "flutter", "Container(color: Colors.red)").issues[0].code, "hard-coded-colour");
  });
});
