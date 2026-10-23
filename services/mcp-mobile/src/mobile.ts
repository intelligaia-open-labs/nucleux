// The Nucleux Mobile tools. Pure query functions over mobile-catalog.json, plus registerMobileTools(), which adds
// them to any McpServer. The standalone server (server.ts) registers all of them; a host server that already owns
// the shared tool names (list_components, get_component, …), such as a private host, registers only the mobile-only
// tools ({ shared: false }) and routes framework: "swiftui" | "compose" | "flutter" | "react-native" to the query
// functions from its own handlers.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  isMobileFramework,
  MOBILE_FRAMEWORKS,
  type ApiMember,
  type ApiSymbol,
  type MobileCatalog,
  type MobileComponent,
  type MobileExample,
  type MobileFramework,
} from "./catalog-types.js";
import { validateUsage, type UsageReport } from "./validate.js";

export { MOBILE_FRAMEWORKS, isMobileFramework, validateUsage };
export type { MobileCatalog, MobileComponent, MobileFramework, UsageReport };

// ---------------------------------------------------------------- conventions

/** The rules every generated mobile screen follows. Shared by the server instructions and get_setup. */
export const MOBILE_CONVENTIONS = [
  "Tap targets are at least 44pt on iOS and 48dp on Android (the kit's controls already are; keep your own the same).",
  "Announce state changes politely with each platform's mechanism: SwiftUI AccessibilityNotification.Announcement(…).post(), Compose View.announceForAccessibility or a polite live region, Flutter SemanticsService.sendAnnouncement, React Native AccessibilityInfo.announceForAccessibility. Never assertive.",
  "Never steal focus: do not move focus, autofocus a field or raise the keyboard on your own.",
  "The agent's avatar is a rounded square; a person's is a circle. Every agent turn is marked \"AI generated\" (the Disclosure components do this).",
  "Composer features (voice, attachments, suggestions, autocomplete, Open Input, Mode/Tone/Style settings, the Disclaimer line) are options on the one PromptComposer, never a new composer.",
  "No generic warnings such as \"AI can make mistakes\" or \"verify before sharing\". When one result has a known gap, attach a Caveat to that result with the specific gap, why it matters and a recovery; what the agent can and cannot do lives in the Disclaimer statement (the composer's onLimitsPress line).",
  "Colours come from Nucleux tokens (NucleuxColor / Nucleux.colors / NucleuxTheme.of(context) / useNucleuxColors()), never hard-coded values.",
  "Use the exact wording the tools return (get_mobile_words, the Rules/constants in get_component). Do not invent or paraphrase the kit's copy.",
];

export const MOBILE_INSTRUCTIONS = `Nucleux Mobile is intelligaia's agentic-UI component kit for native apps, in four frameworks with the same components, rules and wording: SwiftUI (iOS 17+, Swift package "Nucleux"), Jetpack Compose (module com.intelligaia.nucleux), Flutter (package:nucleux) and React Native (@intelligaia/nucleux). It is the mobile sibling of the Nucleux web kit (@nucleux/react) and shares its tokens.

First ask which framework the project uses (look for Package.swift/.xcodeproj, build.gradle.kts, pubspec.yaml or a React Native package.json), then pass it as framework to every tool.

Workflow: list_components or search_components to find the component; get_component(name, framework) for its exact public API, import and key words; get_mobile_spec for the full rules; get_mobile_words for the exact strings and announcements; get_example(name, framework) for a working screen or test host; get_setup(framework) before the first screen. After writing code, run validate_mobile_usage(framework, code) and fix what it reports.

The catalog is generated from the kit's sources, specs and fixtures: if a component, parameter or string is not in it, it does not exist. Report the gap rather than inventing an API or copy.

Every generated screen follows these conventions:
${MOBILE_CONVENTIONS.map((c) => `- ${c}`).join("\n")}`;

/**
 * The paragraph a (private) host server adds to its own instructions when it embeds these tools with
 * { shared: false } and routes the mobile frameworks of its shared tools here.
 */
export const MOBILE_HOST_INSTRUCTIONS = `Native mobile apps: the same tools cover Nucleux Mobile, the kit's SwiftUI, Jetpack Compose, Flutter and React Native components (the same components, rules and wording in each). Ask which framework the project uses and pass framework "swiftui", "compose", "flutter" or "react-native" to list_components, get_component, search_components, get_setup, list_examples and get_example; get_mobile_spec, get_mobile_words and validate_mobile_usage are mobile-only. Mobile screens follow the kit's conventions: 44pt/48dp tap targets; polite announcements through each platform's mechanism; never steal focus; the agent's avatar is a rounded square, a person's a circle; "AI generated" on every agent turn; composer features are options on the one PromptComposer; no generic "AI can make mistakes" lines (attach a Caveat to the specific result); and the exact wording the tools return.`;

// ---------------------------------------------------------------- lookup

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export interface MobileIndex {
  catalog: MobileCatalog;
  byKey: Map<string, MobileComponent>;
}

const indexes = new WeakMap<MobileCatalog, MobileIndex>();

/** Name index: ids, names, aliases, then every framework's top-level symbol names (first claim wins). */
export function mobileIndex(catalog: MobileCatalog): MobileIndex {
  const cached = indexes.get(catalog);
  if (cached) return cached;
  const byKey = new Map<string, MobileComponent>();
  const add = (k: string, c: MobileComponent) => {
    const n = norm(k);
    if (n && !byKey.has(n)) byKey.set(n, c);
    const bare = n.replace(/^nucleux/, "");
    if (bare && bare !== n && !byKey.has(bare)) byKey.set(bare, c);
  };
  for (const c of catalog.components) {
    add(c.id, c);
    add(c.name, c);
  }
  for (const c of catalog.components) for (const a of c.aliases) add(a, c);
  for (const c of catalog.components) {
    for (const fw of MOBILE_FRAMEWORKS) {
      const p = c.frameworks[fw]?.primary;
      if (p) add(p, c);
    }
  }
  for (const c of catalog.components) {
    for (const fw of MOBILE_FRAMEWORKS) for (const s of c.frameworks[fw]?.symbols ?? []) if (s.kind !== "extension") add(s.name.split(".")[0], c);
  }
  const idx = { catalog, byKey };
  indexes.set(catalog, idx);
  return idx;
}

/** Resolve a loose name ("composer", "PromptComposer", "prompt-composer", "NucleuxCaveat", "Caveat"). */
export function resolveMobileComponent(catalog: MobileCatalog, query: string): MobileComponent | undefined {
  const { byKey } = mobileIndex(catalog);
  const q = norm(query);
  if (!q) return undefined;
  return byKey.get(q) ?? byKey.get(q.replace(/s$/, "")) ?? byKey.get(q.replace(/^nucleux/, ""));
}

function suggestions(catalog: MobileCatalog, query: string): string[] {
  const q = norm(query);
  return catalog.components
    .filter((c) => [c.id, c.name, ...c.aliases].some((n) => norm(n).includes(q) || (norm(n).length > 3 && q.includes(norm(n)))))
    .map((c) => c.id)
    .slice(0, 6);
}

function notFound(catalog: MobileCatalog, name: string): string {
  const near = suggestions(catalog, name);
  return near.length
    ? `No Nucleux Mobile component named "${name}". Did you mean: ${near.join(", ")}?`
    : `No Nucleux Mobile component named "${name}". Use list_components to see all ${catalog.components.length}, or search_components.`;
}

const LABEL: Record<MobileFramework, string> = { swiftui: "SwiftUI", compose: "Compose", flutter: "Flutter", "react-native": "React Native" };
const LANG: Record<MobileFramework, string> = { swiftui: "swift", compose: "kotlin", flutter: "dart", "react-native": "tsx" };

// ---------------------------------------------------------------- list / search

function statusLine(c: MobileComponent, framework?: MobileFramework): string {
  if (framework) return `${LABEL[framework]}: ${c.status[framework]}`;
  return MOBILE_FRAMEWORKS.map((fw) => `${LABEL[fw]} ${c.status[fw]}`).join(" · ");
}

function brief(c: MobileComponent, framework?: MobileFramework): string {
  const prim = framework ? c.frameworks[framework]?.primary : null;
  return `- **${c.name}** (\`${c.id}\`, ${c.kind}${prim ? `, \`${prim}\`` : ""}) — ${c.description} — ${statusLine(c, framework)}`;
}

export function listMobileComponents(catalog: MobileCatalog, opts: { framework?: MobileFramework; kind?: string } = {}): string {
  const rows = catalog.components.filter((c) => !opts.kind || opts.kind === "all" || c.kind.toLowerCase() === opts.kind.toLowerCase());
  const head = `Nucleux Mobile ${catalog.version} — ${catalog.components.length} components and patterns in SwiftUI, Jetpack Compose, Flutter and React Native${opts.framework ? ` (showing ${LABEL[opts.framework]})` : ""}.`;
  const tail = opts.framework
    ? `Call get_component with a name and framework "${opts.framework}" for the exact API.`
    : "Ask which framework the project uses, then call get_component(name, framework) for the exact API.";
  return [head, "", ...rows.map((c) => brief(c, opts.framework)), "", tail].join("\n");
}

export interface MobileSearchHit {
  component: MobileComponent;
  score: number;
}

export function searchMobileComponents(catalog: MobileCatalog, query: string, limit = 10): MobileSearchHit[] {
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1 && !STOP.has(t));
  if (!terms.length) return [];
  const hits: MobileSearchHit[] = [];
  for (const c of catalog.components) {
    const names = [c.id, c.name, ...c.aliases].join(" ").toLowerCase();
    const desc = `${c.description} ${c.specSummary ?? ""}`.toLowerCase();
    const syms = MOBILE_FRAMEWORKS.flatMap((fw) => (c.frameworks[fw]?.symbols ?? []).map((s) => s.name)).join(" ").toLowerCase();
    const spec = (c.specText ?? "").toLowerCase();
    let score = 0;
    let matched = 0;
    for (const t of terms) {
      let s = 0;
      if (names.includes(t)) s += 6;
      if (desc.includes(t)) s += 3;
      if (syms.includes(t)) s += 2;
      if (spec.includes(t)) s += 1 + Math.min(1.5, (spec.split(t).length - 1) / 15);
      if (s) matched++;
      score += s;
    }
    if (score) hits.push({ component: c, score: score * (matched / terms.length) });
  }
  hits.sort((a, b) => b.score - a.score);
  // Keep the results that are about the query, not those that only share a word with it.
  const top = hits[0]?.score ?? 0;
  return hits.filter((h) => h.score >= top * 0.4).slice(0, limit);
}

const STOP = new Set("a an and the to of for in on with by or is are be it my me we our you your this that from into as at can do does how what which who when where i".split(" "));

export function renderMobileSearch(catalog: MobileCatalog, query: string, framework?: MobileFramework): string {
  const hits = searchMobileComponents(catalog, query);
  if (!hits.length) return `No Nucleux Mobile component matches "${query}". Use list_components to browse all ${catalog.components.length}.`;
  return [`${hits.length} match${hits.length === 1 ? "" : "es"} for "${query}" (best first):`, "", ...hits.map((h) => brief(h.component, framework))].join("\n");
}

// ---------------------------------------------------------------- get_component

const firstPara = (doc: string, max = 400) => {
  const p = doc.split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim();
  return p.length > max ? `${p.slice(0, max - 1)}…` : p;
};

function renderMember(m: ApiMember, fw: MobileFramework): string {
  if (fw === "react-native" && m.type !== undefined) {
    return `- \`${m.name}${m.optional ? "?" : ""}: ${m.type}\`${m.doc ? ` — ${firstPara(m.doc, 240)}` : ""}`;
  }
  const lines = [`- \`${m.signature ?? m.name}\`${m.doc ? ` — ${firstPara(m.doc, 240)}` : ""}`];
  if (m.params?.length) {
    for (const p of m.params) {
      lines.push(`  - \`${p.name}\`${p.named ? "" : " (positional)"}: \`${p.type}\`${p.required ? " **required**" : ""}${p.default !== undefined ? ` = \`${p.default}\`` : ""}${p.doc ? ` — ${firstPara(p.doc, 200)}` : ""}`);
    }
  }
  if (m.paramDocs) for (const [k, v] of Object.entries(m.paramDocs)) lines.push(`  - \`${k}\`: ${firstPara(v, 200)}`);
  return lines.join("\n");
}

function renderSymbol(s: ApiSymbol, fw: MobileFramework): string {
  const out = [`### ${s.name} (${s.kind})`];
  if (s.doc) out.push(firstPara(s.doc, 600));
  out.push("```" + LANG[fw], [...(s.annotations ?? []).filter((a) => a.startsWith("@Composable")), s.signature].join("\n"), "```");
  if (s.paramDocs) for (const [k, v] of Object.entries(s.paramDocs)) out.push(`- \`${k}\`: ${firstPara(v, 200)}`);
  if (s.body && s.kind !== "const") out.push("```ts", s.body, "```");
  const members = s.members.filter((m) => m.name !== "" || m.signature);
  if (members.length) out.push(...members.map((m) => renderMember(m, fw)));
  return out.join("\n");
}

/** Words to copy: the fixture's `words` (and small constant groups), and the React Native reference constants. */
function keyWords(c: MobileComponent, max = 30): string[] {
  const out: string[] = [];
  for (const w of Object.values(c.words)) {
    const words = (w.constants as Record<string, unknown>).words;
    if (words && typeof words === "object") {
      for (const [k, v] of Object.entries(words as Record<string, unknown>)) if (typeof v === "string") out.push(`- ${k}: "${v}"`);
    }
  }
  const rn = c.frameworks["react-native"]?.constants ?? {};
  for (const [k, v] of Object.entries(rn)) if (out.length < max && !out.some((l) => l.endsWith(`"${v}"`))) out.push(`- ${k}: "${v}"`);
  return out.slice(0, max);
}

export function getMobileComponent(catalog: MobileCatalog, name: string, framework?: MobileFramework): { found: boolean; text: string } {
  const c = resolveMobileComponent(catalog, name);
  if (!c) return { found: false, text: notFound(catalog, name) };
  const lines = [`# ${c.name} (\`${c.id}\`, ${c.kind}) — Nucleux Mobile`, "", c.description, "", `**Status:** ${statusLine(c)}`];
  if (c.spec) lines.push(`**Spec:** \`${c.spec}\` (full text: get_mobile_spec)`);
  if (c.fixtures.length) lines.push(`**Fixtures (exact wording and state machine):** ${c.fixtures.map((f) => `\`${f}\``).join(", ")} (get_mobile_words)`);
  const fws = framework ? [framework] : MOBILE_FRAMEWORKS.slice();
  for (const fw of fws) {
    const e = c.frameworks[fw];
    lines.push("", `## ${LABEL[fw]}`);
    if (!e) {
      lines.push(`No ${LABEL[fw]} component: ${c.status[fw]}. ${c.id === "personality" ? "The voice rules are checked through the fixtures every framework is tested against." : ""}`.trim());
      continue;
    }
    lines.push(`**Import:** \`${e.import}\``, `**Source:** ${e.files.map((f) => `\`${f}\``).join(", ")}`);
    if (e.primary) lines.push(`**Main symbol:** \`${e.primary}\``);
    if (e.example) lines.push(`**Example:** ${e.example} (get_example name "${c.id}", framework "${fw}")`);
    if (framework) {
      lines.push("", "Only these public declarations exist (parsed from the source); parameters and defaults are exact.", "");
      lines.push(...e.symbols.map((s) => renderSymbol(s, fw)));
    } else {
      const prim = e.symbols.find((s) => s.name === e.primary);
      if (prim) lines.push("```" + LANG[fw], prim.kind === "struct" || prim.kind === "class" ? [prim.signature, ...prim.members.filter((m) => m.name === "init" || m.kind === "constructor").map((m) => `  ${m.signature}`)].join("\n") : prim.signature, "```");
      lines.push(`Public declarations: ${e.symbols.map((s) => s.name).join(", ")}`);
    }
  }
  const words = keyWords(c);
  if (words.length) lines.push("", "## Key words (copy exactly)", ...words);
  if (c.specSummary) lines.push("", "## Spec summary", c.specSummary);
  if (c.related.length) lines.push("", `**Related:** ${c.related.join(", ")}`);
  if (!framework) lines.push("", "Pass framework (swiftui, compose, flutter or react-native) for the full public API of one framework.");
  return { found: true, text: lines.join("\n").trim() };
}

// ---------------------------------------------------------------- spec / words

export function getMobileSpec(catalog: MobileCatalog, name: string): { found: boolean; text: string } {
  const c = resolveMobileComponent(catalog, name);
  if (!c) return { found: false, text: notFound(catalog, name) };
  if (!c.specText) {
    const files = MOBILE_FRAMEWORKS.flatMap((fw) => c.frameworks[fw]?.files ?? []);
    return { found: true, text: `# ${c.name}\n\n${c.description}\n\nNo spec document: ${c.id === "tokens" ? "the tokens are tokens/src/nucleux.tokens.json, generated into each framework" : "generated from icons/icons.json"}. Sources: ${files.map((f) => `\`${f}\``).join(", ")}.` };
  }
  return { found: true, text: `<!-- ${c.spec} -->\n${c.specText}` };
}

export function getMobileWords(catalog: MobileCatalog, name: string, framework?: MobileFramework): { found: boolean; text: string } {
  const c = resolveMobileComponent(catalog, name);
  if (!c) return { found: false, text: notFound(catalog, name) };
  const lines = [`# Exact words: ${c.name}`, "", "Copy these strings exactly; every framework is tested against them. Host-supplied content (names, sources, prompts) is shown as fixture examples and is yours to replace."];
  for (const [file, w] of Object.entries(c.words)) {
    lines.push("", `## ${file}`);
    const { words, ...rest } = w.constants as Record<string, unknown>;
    if (words) lines.push("### words", "```json", JSON.stringify(words, null, 2), "```");
    for (const [k, v] of Object.entries(rest)) lines.push(`### ${k}`, typeof v === "string" ? `"${v}"` : "```json\n" + JSON.stringify(v) + "\n```");
    if (w.inCases.length) lines.push("### Strings from the cases (announcements, labels, expected text)", ...w.inCases.map((s) => `- "${s}"`));
  }
  const fws = framework ? [framework] : (["react-native"] as MobileFramework[]);
  for (const fw of fws) {
    const e = c.frameworks[fw];
    if (!e) continue;
    const consts: string[] = [];
    for (const s of e.symbols) {
      if (fw === "react-native") {
        if (s.kind === "const" && /=\s*['"`]/.test(s.signature)) consts.push(`- \`${s.signature.replace(/^export const /, "")}\``);
        if (s.kind === "function" && /\{ *return [`'"]|=> *[`'"]|\) *: *string *\{ *[`'"]/.test(s.signature)) consts.push(`- \`${s.signature.replace(/^export function /, "")}\``);
        continue;
      }
      for (const m of s.members) {
        const sig = m.signature ?? "";
        if (/(static let|const val|static const|static func|public fun|static String)[^=]*(=|\{)\s*.*["']/.test(sig) && /["']/.test(sig)) consts.push(`- \`${s.name}.${m.name}\`: \`${sig}\``);
      }
    }
    if (consts.length) lines.push("", `## ${LABEL[fw]} constants and wording functions`, ...consts);
  }
  if (!Object.keys(c.words).length && lines.length <= 3) lines.push("", "This component has no fixtures; its wording is in the constants above and in get_component.");
  if (!framework) lines.push("", "Pass framework for the same words as that framework's constants (SwiftUI static let, Kotlin const val, Dart static const).");
  return { found: true, text: lines.join("\n") };
}

// ---------------------------------------------------------------- setup / examples

export function getMobileSetup(catalog: MobileCatalog, framework?: MobileFramework): string {
  const conventions = ["## Conventions every screen follows", ...MOBILE_CONVENTIONS.map((c) => `- ${c}`)].join("\n");
  if (framework) return `${catalog.setup[framework]}\n\n${conventions}`;
  return [
    "Nucleux Mobile ships the same components in four frameworks. Ask which one the project uses (Package.swift or an .xcodeproj → swiftui; build.gradle.kts with Compose → compose; pubspec.yaml → flutter; a React Native package.json → react-native) and call get_setup with that framework. All four follow:",
    "",
    ...MOBILE_FRAMEWORKS.map((fw) => catalog.setup[fw]),
    conventions,
  ].join("\n\n");
}

export function listMobileExamples(catalog: MobileCatalog, framework?: MobileFramework): string {
  const rows = catalog.examples.filter((e) => !framework || e.framework === framework);
  return [
    `${rows.length} examples${framework ? ` for ${LABEL[framework]}` : ""}: SwiftUI examples are the iOS catalog app's screens (run with SCREEN=<value>); Compose, Flutter and React Native examples are the component-test hosts.`,
    "",
    ...rows.map((e) => `- ${e.name} (${e.framework}) — ${e.title}, ${e.lines} lines`),
    "",
    "Call get_example with the name and framework.",
  ].join("\n");
}

export function getMobileExample(catalog: MobileCatalog, name: string, framework?: MobileFramework): { found: boolean; text: string } {
  const c = resolveMobileComponent(catalog, name);
  const id = c?.id ?? name.trim().toLowerCase();
  const matches = catalog.examples.filter((e: MobileExample) => e.name === id && (!framework || e.framework === framework));
  if (!matches.length) {
    const have = catalog.examples.filter((e) => e.name === id).map((e) => e.framework);
    if (c && have.length) return { found: false, text: `No ${framework ? LABEL[framework] : ""} example for ${c.name}. Available for: ${have.join(", ")}.` };
    return { found: false, text: c ? `No example for ${c.name} yet.` : notFound(catalog, name) };
  }
  return {
    found: true,
    text: matches
      .map((e) => [`# ${c?.name ?? e.name} — ${LABEL[e.framework]}: ${e.title}`, `Source: \`${e.source}\``, e.framework === "swiftui" ? "" : "A test host: it shows real usage; the test-only pieces (LocalNucleuxAnnounce, tester, render/screen) are not needed in an app.", "```" + LANG[e.framework], e.code, "```"].filter(Boolean).join("\n"))
      .join("\n\n"),
  };
}

// ---------------------------------------------------------------- registration

const text = (s: string) => ({ content: [{ type: "text" as const, text: s }] });
const errorText = (s: string) => ({ isError: true, content: [{ type: "text" as const, text: s }] });

export const mobileFrameworkSchema = z.enum(MOBILE_FRAMEWORKS);

export interface RegisterMobileOptions {
  /**
   * Also register the tools whose names the web server owns (list_components, get_component, search_components,
   * get_setup, list_examples, get_example). Default true (standalone). A host that has its own registers false and
   * routes mobile frameworks to the query functions.
   */
  shared?: boolean;
}

/** The names registerMobileTools adds, by group. */
export const MOBILE_TOOL_NAMES = {
  shared: ["list_components", "get_component", "search_components", "get_setup", "list_examples", "get_example"],
  mobileOnly: ["get_mobile_spec", "get_mobile_words", "validate_mobile_usage"],
} as const;

export const MOBILE_TOOL_DESCRIPTIONS = {
  get_mobile_spec:
    "Get the full spec of one Nucleux Mobile component or pattern (SwiftUI, Compose, Flutter, React Native): what the host supplies, the rules and state machine, look (tokens only), accessibility, and what is out of scope. Accepts loose names ('composer', 'PromptComposer', 'prompt-composer', 'Caveat').",
  get_mobile_words:
    "Get the exact strings a Nucleux Mobile component shows and announces — button labels, announcements, empty and error text — from the shared fixtures every framework is tested against, plus the framework's constants (pass framework). Copy these instead of writing your own copy.",
  validate_mobile_usage:
    "Check SwiftUI, Compose, Flutter or React Native code that uses Nucleux Mobile before or after writing it. Reports Nucleux names that do not exist, removed APIs (e.g. the composer's caveat/onCaveatPress → onLimitsPress, NucleuxTrust.caveat → NucleuxCaveat), generic AI-warning copy (\"can make mistakes\", \"verify before…\"), hard-coded colours instead of tokens, stolen focus and separate composers. Returns JSON: { framework, valid, errors, warnings, checked, issues: [{ severity, code, line, match, message, fix }] }.",
} as const;

export function registerMobileTools(server: McpServer, catalog: MobileCatalog, opts: RegisterMobileOptions = {}): void {
  const fwOpt = mobileFrameworkSchema.optional().describe("swiftui, compose, flutter or react-native. Omit to cover all four (ask the user which one the project uses).");

  if (opts.shared !== false) {
    server.tool(
      "list_components",
      "List every Nucleux Mobile component and pattern with its kind, one-line description and status in each framework (SwiftUI, Jetpack Compose, Flutter, React Native). Start here to see what the kit offers and to confirm a component exists before writing one.",
      {
        framework: fwOpt,
        kind: z.enum(["component", "pattern", "foundation", "all"]).optional().describe("Filter by kind (default all)."),
      },
      async ({ framework, kind }) => text(listMobileComponents(catalog, { framework, kind })),
    );

    server.tool(
      "get_component",
      "Get one Nucleux Mobile component: description, status, the import line, its exact public API in the chosen framework (Swift public structs/inits/modifiers, Kotlin @Composable functions and classes with defaults, Dart widget constructors with named parameters, React Native components and their Props), the key words to copy, a spec summary and related components. Accepts loose names ('composer', 'PromptComposer', 'prompt-composer', 'NucleuxCaveat', 'Caveat'). Pass framework for the full API.",
      {
        name: z.string().describe("Component or pattern name, e.g. 'PromptComposer', 'composer', 'caveat', 'Modes', 'NucleuxMadlibCard'."),
        framework: fwOpt,
      },
      async ({ name, framework }) => {
        const r = getMobileComponent(catalog, name, framework);
        return r.found ? text(r.text) : errorText(r.text);
      },
    );

    server.tool(
      "search_components",
      "Search Nucleux Mobile components by keyword across names, aliases, descriptions, public symbols and spec text. Use when you know what you need ('voice input', 'permission', 'fill in the blanks', 'model fallback') but not the component's name.",
      { query: z.string().min(1).describe("Free text, e.g. 'attach files', 'stop generating', 'tone of the reply'."), framework: fwOpt },
      async ({ query, framework }) => text(renderMobileSearch(catalog, query, framework)),
    );

    server.tool(
      "get_setup",
      "Get setup for Nucleux Mobile in one framework: how to add the dependency (SwiftPM from the git repo, the Gradle module, a Flutter git/path dependency, npm @intelligaia/nucleux from GitHub Packages), theming (NucleuxColor, NucleuxTheme, NucleuxProvider), the menu host (NucleuxMenuHost on iOS), the bundled Lucide icon font, announcements, minimum versions, and the conventions every screen follows. Read before writing the first screen.",
      { framework: fwOpt },
      async ({ framework }) => text(getMobileSetup(catalog, framework)),
    );

    server.tool(
      "list_examples",
      "List working Nucleux Mobile examples: each pattern's iOS catalog screen (SwiftUI) and its component-test host (Compose, Flutter, React Native).",
      { framework: fwOpt },
      async ({ framework }) => text(listMobileExamples(catalog, framework)),
    );

    server.tool(
      "get_example",
      "Get a working example of one Nucleux Mobile component in a framework (see list_examples): the iOS catalog screen for SwiftUI, the setContent/pumpWidget/render host from the tests for Compose, Flutter and React Native. Accepts the same loose names as get_component.",
      { name: z.string().describe("Component or pattern, e.g. 'caveat', 'madlibs', 'PromptComposer'."), framework: fwOpt },
      async ({ name, framework }) => {
        const r = getMobileExample(catalog, name, framework);
        return r.found ? text(r.text) : errorText(r.text);
      },
    );
  }

  server.tool(
    "get_mobile_spec",
    MOBILE_TOOL_DESCRIPTIONS.get_mobile_spec,
    { name: z.string().describe("Component or pattern name, e.g. 'caveat', 'PromptComposer', 'modes'.") },
    async ({ name }) => {
      const r = getMobileSpec(catalog, name);
      return r.found ? text(r.text) : errorText(r.text);
    },
  );

  server.tool(
    "get_mobile_words",
    MOBILE_TOOL_DESCRIPTIONS.get_mobile_words,
    { name: z.string().describe("Component or pattern name, e.g. 'caveat', 'madlibs', 'consent'."), framework: fwOpt },
    async ({ name, framework }) => {
      const r = getMobileWords(catalog, name, framework);
      return r.found ? text(r.text) : errorText(r.text);
    },
  );

  server.tool(
    "validate_mobile_usage",
    MOBILE_TOOL_DESCRIPTIONS.validate_mobile_usage,
    {
      framework: mobileFrameworkSchema.describe("The framework the code is written in."),
      code: z.string().min(1).describe("The code to check (a file or a snippet)."),
    },
    async ({ framework, code }) => text(JSON.stringify(validateUsage(catalog, framework, code), null, 2)),
  );
}
