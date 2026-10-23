// Vendored from intelligaia/nucleux-mobile mcp/src/validate.ts by scripts/vendor-mobile-mcp.mjs. Do not edit here.
// validate_mobile_usage: a light static check of agent-written SwiftUI, Compose, Flutter or React Native code that
// uses Nucleux Mobile. Table-driven: each rule is a pattern per framework, a message and a fix. It is not a compiler;
// it catches the mistakes agents make most: invented or removed APIs, generic AI-warning copy, raw colours, stolen
// focus and separate composers.
import type { MobileCatalog, MobileFramework } from "./catalog-types.js";

export type Severity = "error" | "warning";

export interface UsageIssue {
  severity: Severity;
  code: string;
  line: number;
  match: string;
  message: string;
  fix?: string;
}

export interface UsageReport {
  framework: MobileFramework;
  valid: boolean;
  errors: number;
  warnings: number;
  checked: { lines: number; symbols: number };
  issues: UsageIssue[];
}

type PerFramework<T> = Partial<Record<MobileFramework, T>>;

interface Rule {
  code: string;
  severity: Severity;
  /** One pattern per framework; `all` applies to every framework. */
  patterns: PerFramework<RegExp[]> & { all?: RegExp[] };
  /** Only when the code also matches this (e.g. the composer is used). */
  when?: PerFramework<RegExp>;
  message: string;
  fix: PerFramework<string> & { all?: string };
  /** Skip lines that are only comments (default true). */
  codeOnly?: boolean;
}

const COLOUR_FIX: Record<MobileFramework, string> = {
  swiftui: "Use NucleuxColor.<token> (background, foreground, muted, mutedForeground, primary, info, brand, destructive, success, warning…); they follow light and dark.",
  compose: "Use Nucleux.colors.<token> inside NucleuxTheme (background, foreground, muted, mutedForeground, info, brand, destructive…).",
  flutter: "Use NucleuxTheme.of(context).<token> (background, foreground, muted, mutedForeground, info, brand, destructive…).",
  "react-native": "Use const c = useNucleuxColors(); then c.<token> (background, foreground, muted, mutedForeground, info, brand, destructive…).",
};

const LIMITS_FIX: Record<MobileFramework, string> = {
  swiftui: "Remove it. For the line that opens what the agent can and cannot do, use .nucleuxDisclaimerLine(agent:onPress:) on the composer; for a known gap in one result, attach NucleuxCaveat(content) to that result.",
  compose: "Remove it. For the Disclaimer line pass onLimitsPress = { … } to NucleuxPromptComposer; for a known gap in one result, attach NucleuxCaveat(content) to that result.",
  flutter: "Remove it. For the Disclaimer line pass onLimitsPress: () { … } to NucleuxPromptComposer; for a known gap in one result, attach NucleuxCaveat(content: …) to that result.",
  "react-native": "Remove it. For the Disclaimer line pass onLimitsPress={…} to PromptComposer; for a known gap in one result, render <Caveat content={…} /> inside that result.",
};

/** The rules. Order is the order issues are reported in for the same line. */
export const USAGE_RULES: Rule[] = [
  {
    code: "removed-api",
    severity: "error",
    patterns: { all: [/\bonCaveatPress\b/] },
    message: "onCaveatPress was removed on 22 Oct 2026, with the composer's standing caveat line.",
    fix: LIMITS_FIX,
  },
  {
    code: "removed-api",
    severity: "error",
    patterns: {
      swiftui: [/\.nucleuxCaveat\s*\(/],
      compose: [/\bcaveat\s*=\s*(?!null\b)/],
      flutter: [/\bcaveat\s*:\s*(?!null\b)/],
      "react-native": [/\bcaveat\s*=\s*[{"']/],
    },
    when: {
      compose: /NucleuxPromptComposer\s*\(/,
      flutter: /NucleuxPromptComposer\s*\(/,
      "react-native": /<PromptComposer\b/,
    },
    message: "The composer's `caveat` (a standing \"can make mistakes\" line under the composer) was removed: generic warnings teach people to ignore them and say nothing about the answer in front of them.",
    fix: LIMITS_FIX,
  },
  {
    code: "removed-api",
    severity: "error",
    patterns: {
      all: [/\bNucleuxTrust(?:Rules)?\.caveat\s*\(/, /\bcaveatText\s*\(/, /\bCAVEAT_(?:OUTPUT|ACTION)\b/, /\b(?:OUTPUT|ACTION)_CAVEAT\b/, /\b(?:outputCaveat|actionCaveat)\b/],
    },
    message: "The generic caveat strings (NucleuxTrust.caveat, caveatText, CAVEAT_OUTPUT/CAVEAT_ACTION, outputCaveat/actionCaveat) were removed: the kit no longer ships a generic AI warning.",
    fix: {
      swiftui: "Use NucleuxCaveat(NucleuxCaveatRules.Content(message:why:short:noun:sources:recover:)) attached to the one result it is about, with the host's specific gap.",
      compose: "Use NucleuxCaveat(NucleuxCaveatRules.Content(message, why, short, noun, sources, recover)) attached to the one result it is about.",
      flutter: "Use NucleuxCaveat(content: NucleuxCaveatContent(message:, why:, short:, noun:, …)) attached to the one result it is about.",
      "react-native": "Use <Caveat content={{ message, why, short, noun, sources, recover }} /> inside the one result it is about.",
    },
  },
  {
    code: "removed-api",
    severity: "error",
    patterns: {
      all: [/\bNucleuxCaveatVariant\b/],
      swiftui: [/\bNucleuxCaveat\s*\(\s*"/, /\bNucleuxCaveat\s*\([^)]*variant\s*:/],
      compose: [/\bNucleuxCaveat\s*\(\s*(?:text\s*=\s*)?"/],
      flutter: [/\bNucleuxCaveat\s*\(\s*'/, /\bNucleuxCaveat\s*\(\s*"/],
      "react-native": [/<Caveat\b[^>]*\btext=/, /<Caveat\b[^>]*\bvariant=/],
    },
    message: "Caveat no longer takes a text or a caption/boxed variant. It is a note attached to one result: the specific gap, why it matters, its sources and a recovery the person chooses.",
    fix: {
      swiftui: "NucleuxCaveat(NucleuxCaveatRules.Content(message: …, why: …, short: …, noun: \"summary\", sources: […], recover: …), onRecover: { … }, onUpdate: { … })",
      compose: "NucleuxCaveat(content = NucleuxCaveatRules.Content(message, why, short, noun, sources, recover), onRecover = { … }, onUpdate = { … })",
      flutter: "NucleuxCaveat(content: NucleuxCaveatContent(message: …, why: …, short: …, noun: 'summary'), onRecover: …, onUpdate: …)",
      "react-native": "<Caveat content={content} onRecover={…} onUpdate={…} />",
    },
  },
  {
    code: "removed-api",
    severity: "error",
    patterns: { swiftui: [/\.nucleuxDisclaimerLine\s*\([^)]*\btext\s*:/] },
    message: "nucleuxDisclaimerLine no longer takes `text`: the line always reads \"What <agent> can and cannot do\".",
    fix: { swiftui: ".nucleuxDisclaimerLine(agent: \"Aria\", onPress: { showStatement = true })" },
  },
  {
    code: "removed-api",
    severity: "error",
    patterns: {
      all: [
        /\bNucleuxConsentAsk\b/, /\bConsentAsk\b/, /\bNucleuxConsentScope\b/, /\bConsentScope\b/,
        /\bconsentInitial\b/, /\bconsentGapNote\b/, /\bgapNote\b/, /\bCONSENT_ASK_ACTIONS\b/, /\baskActions\b/,
        /\bAllow selected\b/, /\bAllow once\b/, /\bAlways allow\b/,
      ],
    },
    message: "The multi-switch consent request (needed sources pre-switched on, \"Allow selected\"), its gap note and the \"Allow once / Always allow / Decline\" ask were removed on 22 Oct 2026. Consent is one request with the scope in plain lines and two equal answers, Not now and Continue, with nothing preselected; it handles approved, denied, expired and revoked itself.",
    fix: {
      swiftui: "NucleuxConsentRequest(NucleuxConsent.Content(agent: \"Aria\", resource: \"Google Drive\", why: …, scope: [.init(.can, …), .init(.cannot, …), .init(.duration, …)], then: …, granted: …), onConnect: { … }, onResume: { … })",
      compose: "NucleuxConsentRequest(NucleuxConsent.Content(agent, resource, why, scope, then, granted = …), onConnect = { … }, onResume = { … })",
      flutter: "NucleuxConsentRequest(content: NucleuxConsentContent(agent: 'Aria', resource: 'Google Drive', why: …, scope: […], then: …, granted: …), onConnect: …, onResume: …)",
      "react-native": "<ConsentRequest content={content} onConnect={…} onResume={…} onRevoke={…} onAlternative={…} />",
    },
  },
  {
    code: "removed-api",
    severity: "error",
    patterns: {
      all: [
        /\bNucleuxTemplateCard\b/, /\bNucleuxTemplateList\b/, /\bTemplateCard\b/, /\bTemplateList\b/,
        /\bNucleuxPromptTemplate\b/, /\bPromptTemplate\b/, /\bNucleuxTemplateSlot\b/, /\bTemplateSlot\b/,
        /\bassemblePrompt\b/, /\btemplateSegments\b/, /\bonEditAsText\b/,
      ],
    },
    message: "The sentence-with-slots Templates (TemplateList / TemplateCard, slots, \"Edit as text\") was removed on 22 Oct 2026: that pattern is now Madlibs. Templates is now a reusable workflow: previewed, applied as editable fields, never run until Run.",
    fix: {
      swiftui: "A sentence with blanks: NucleuxMadlibCard(control: NucleuxMadlibControl(madlib, onPlace: { … })). A repeatable workflow: NucleuxTemplateFlow(templates: [NucleuxTemplates.Template(…)], onRun: { t, values in … })",
      compose: "A sentence with blanks: NucleuxMadlibCard(…). A repeatable workflow: NucleuxTemplateFlow(templates = listOf(NucleuxTemplates.Template(…)), onRun = { t, values -> … })",
      flutter: "A sentence with blanks: NucleuxMadlibCard(control: NucleuxMadlibControl(madlib, onPlace: …)). A repeatable workflow: NucleuxTemplateFlow(templates: [NucleuxWorkflowTemplate(…)], onRun: (t, values) async { … })",
      "react-native": "A sentence with blanks: <MadlibCard …/>. A repeatable workflow: <TemplateFlow templates={templates} onRun={(t, values) => …} />",
    },
  },
  {
    code: "removed-api",
    severity: "error",
    patterns: {
      all: [/\bdraftedBy\b/, /\bDRAFTED_BY\b/, /\bdraftedByLabel\b/],
    },
    message: "\"Drafted by …\" was removed on 22 Oct 2026 with the Disclosure revision. Content AI wrote or changed carries \"Generated with AI\" where it sits, opening to what the agent did, what it used, what nobody checked and that the original is kept; agent turns carry \"AI agent\".",
    fix: {
      swiftui: "NucleuxGeneratedLabel(agent: \"Aria\", noun: \"paragraph\", details: .init(did: …, used: …, notChecked: …, original: …), onUndo: { … }) or NucleuxGeneratedValue(label:value:agent:details:)",
      compose: "NucleuxGeneratedLabel(\"Aria\", \"paragraph\", NucleuxTrust.Details(did, used, notChecked, original), onUndo = { … })",
      flutter: "NucleuxGeneratedLabel(agent: 'Aria', noun: 'paragraph', details: NucleuxGeneratedDetails(did: …, used: …, notChecked: …, original: …), onUndo: …)",
      "react-native": "<GeneratedLabel agent=\"Aria\" noun=\"paragraph\" details={{ did, used, notChecked, original }} onUndo={…} />",
    },
  },
  {
    code: "disclosure-claims-checked",
    severity: "error",
    patterns: {
      all: [
        /\b(?:AI|agent)[- ](?:verified|fact[- ]checked)\b/i,
        /\b(?:verified|fact[- ]checked) by (?:AI|the agent|Aria)\b/i,
        /\bGenerated with AI\b[^"'\n]{0,40}\b(?:verified|fact[- ]checked|accurate)\b/i,
      ],
    },
    message: "Disclosure never claims a check it can't make: no \"verified\", \"fact-checked\" or \"accurate\" beside AI-generated content. Say what was not checked instead (the generated label's \"Not checked\" line).",
    fix: {
      swiftui: "Drop the claim; put what nobody checked in NucleuxGeneratedLabel's details: .init(did: …, used: …, notChecked: \"Figures from the Q2 export\", …)",
      compose: "Drop the claim; put what nobody checked in NucleuxTrust.Details(did, used, notChecked = \"Figures from the Q2 export\") on NucleuxGeneratedLabel",
      flutter: "Drop the claim; put what nobody checked in NucleuxGeneratedDetails(notChecked: 'Figures from the Q2 export', …) on NucleuxGeneratedLabel",
      "react-native": "Drop the claim; put what nobody checked in <GeneratedLabel details={{ notChecked: 'Figures from the Q2 export', … }} />",
    },
  },
  {
    code: "removed-api",
    severity: "error",
    patterns: {
      all: [/\bwillNot\s*[:=]/, /\bcannotSee\s*[:=]/, /\bDisclaimerRowKind\.(?:WillNot|CannotSee|willNot|cannotSee)\b/, /\.(?:willNot|cannotSee)\b/],
    },
    message: "The three-row Disclaimer (Can / Will not / Cannot see) was replaced on 22 Oct 2026 by Agent Limits' four groups: can, cannot, needsApproval, mayGetWrong. The kit also has a compact statement, a note before an action that needs something missing, and a banner when the limit is reached.",
    fix: {
      swiftui: "NucleuxDisclaimerScope(can: …, cannot: …, needsApproval: …, mayGetWrong: …); NucleuxAgentLimits(agent:summary:scope:); NucleuxLimitNote / NucleuxLimitBanner(NucleuxLimitControl(limit, onConnect: { … }, onFinish: { … }))",
      compose: "NucleuxDisclaimerScope(can, cannot, needsApproval, mayGetWrong); NucleuxAgentLimits(agent, summary, scope); NucleuxLimitNote / NucleuxLimitBanner(rememberLimitControl(limit, onConnect = { … }, onFinish = { … }))",
      flutter: "NucleuxDisclaimerScope(can: …, cannot: …, needsApproval: …, mayGetWrong: …); NucleuxAgentLimits(…); NucleuxLimitNote / NucleuxLimitBanner(control: NucleuxLimitControl(limit, onConnect: …, onFinish: …))",
      "react-native": "scope={{ can, cannot, needsApproval, mayGetWrong }}; <AgentLimits …/>; const limit = useLimit(content, { onConnect, onFinish }); <LimitNote limit={limit} /> <LimitBanner limit={limit} />",
    },
  },
  {
    code: "removed-api",
    severity: "error",
    patterns: {
      all: [/\bNucleuxNudgeHint\b/, /\bNudgeHint\b/, /\bNucleuxNudgeController\b/, /\bNucleuxNudgeContent\b/, /\buseNudges\b/, /\bNucleuxNudgeTail\b/, /<Nudge\b/, /\bNucleuxNudge\s*\(/, /\brememberNucleuxNudgeController\b/],
    },
    message: "The anchored nudge (a floating card with a tail, \"No thanks\", and the quiet pill) was replaced on 23 Oct 2026 by an inline Tip: the line, Try it, Not now (a week), Why this tip? and Dismiss, with Undo after Dismiss or Not now. Never floating over the work.",
    fix: {
      swiftui: "let tips = NucleuxTipController([\"ask-selection\": .init(title: …, why: …)]); NucleuxTip(tips, id: \"ask-selection\") { … }; tips.earned(\"ask-selection\") on real behaviour, tips.withdraw() when the reason goes",
      compose: "val tips = rememberNucleuxTipController(mapOf(\"ask-selection\" to NucleuxTipContent(title, why))); NucleuxTip(tips, \"ask-selection\", onTry = { … })",
      flutter: "final tips = NucleuxTipController({'ask-selection': NucleuxTipContent(title: …, why: …)}); NucleuxTip(controller: tips, id: 'ask-selection', onTry: …)",
      "react-native": "const tips = useTips({ 'ask-selection': { title, why } }); <Tip tips={tips} id=\"ask-selection\" onTry={…} />",
    },
  },
  {
    code: "removed-api",
    severity: "error",
    patterns: {
      swiftui: [/\bNucleuxAgentAvatar\([^)\n]*size:\s*\.lg\b/, /\bNucleuxPersonAvatar\([^)\n]*size:\s*\.lg\b/, /\bringSeconds\b/],
      compose: [/\bNucleuxAvatarSize\.Lg\b/, /\bRING_MILLIS\b/],
      flutter: [/\bNucleuxAvatarSize\.lg\b/, /\bNucleuxIdentity\.ring\b/],
      "react-native": [/<(?:Agent|Person)Avatar\b[^>\n]*size=["']lg["']/, /\bAVATAR_RING_MS\b/],
    },
    message: "The 56 avatar and the pulsing ring were replaced on 23 Oct 2026 (Avatar revision): one shape at 24, 32 and 40 (xs, sm, md), the identity card at 40, a still ring for active and a turning ring for working, with words and Stop beside it.",
    fix: {
      swiftui: "NucleuxAgentAvatar(agent, size: .md) (40); .sm (32) for a turn; .xs (24) for activity and bylines; state: .active / .working",
      compose: "NucleuxAvatarSize.Md (40); Sm (32) for a turn; Xs (24) for activity and bylines; NucleuxIdentity.TURN_MILLIS",
      flutter: "NucleuxAvatarSize.md (40); sm (32) for a turn; xs (24) for activity and bylines; NucleuxIdentity.turn",
      "react-native": "<AgentAvatar size=\"md\" /> (40); \"sm\" (32) for a turn; \"xs\" (24) for activity and bylines; AVATAR_TURN_MS",
    },
  },
  {
    code: "ai-glyph-by-name",
    severity: "warning",
    patterns: {
      swiftui: [/\bNucleuxIconView\(\s*\.(?:sparkles|badgeInfo)\b/, /\bicon:\s*\.(?:sparkles|badgeInfo)\b/],
      compose: [/\bNucleuxIcons\.(?:Sparkles|BadgeInfo)\b/],
      flutter: [/\bNucleuxIcons\.(?:sparkles|badgeInfo)\b/],
      "react-native": [/name=\{?["'](?:sparkles|badge-info)["']/],
    },
    message: "An AI glyph drawn by name. Nucleux Mobile keeps one glyph per AI meaning (Iconography, 22 Oct): the star for an AI action and the agent's own mark, the info badge for generated content, the turning mark for working, the wrench for tool use. Take it from the role table so the meaning, not the drawing, is chosen.",
    fix: {
      swiftui: "NucleuxIconView(NucleuxAIRun.marks[.action]!) on a control that runs AI; NucleuxAIRun.marks[.generated]! on content AI wrote; NucleuxAIRun.agentGlyph for the agent itself",
      compose: "NucleuxAIRun.MARKS.getValue(NucleuxAIRun.Role.Action) / Role.Generated, or NucleuxAIRun.AGENT_GLYPH for the agent itself",
      flutter: "NucleuxAIRun.marks[NucleuxAIRole.action] / NucleuxAIRole.generated, or NucleuxAIRun.agentGlyph for the agent itself",
      "react-native": "<Icon name={AI_MARKS.action} /> / AI_MARKS.generated, or AGENT_GLYPH for the agent itself",
    },
  },
  {
    code: "generic-ai-warning",
    severity: "error",
    patterns: {
      all: [
        /can make mistakes/i,
        /may (?:be|contain|produce|give)\s+(?:\w+\s+)?(?:inaccurate|incorrect|wrong|errors|mistakes)/i,
        /\bverify\b[^.\n]{0,40}\bbefore\b/i,
        /\bcan be (?:wrong|inaccurate|incorrect)\b/i,
        /\bdouble[- ]check\b/i,
        /check (?:anything|everything) (?:important )?before/i,
        /AI[- ]generated (?:content|answers|responses) (?:may|can|might)/i,
        /\bnot always (?:be )?accurate\b/i,
        /\bmight be (?:wrong|inaccurate)\b/i,
      ],
    },
    message: "Generic AI-warning copy. Nucleux Mobile has no standing \"AI can make mistakes\" line: it teaches people to ignore warnings and says nothing about the answer in front of them.",
    fix: LIMITS_FIX,
  },
  {
    code: "hard-coded-colour",
    severity: "warning",
    patterns: {
      swiftui: [
        /\bColor\s*\(\s*(?:red|hue|white|\.sRGB|\.displayP3|hex)\s*:/,
        /\bColor\s*\(\s*hex\b/i,
        /\bUIColor\s*\(\s*(?:red|white|hue)\s*:/,
        /#colorLiteral/,
        /\bColor\.(?:red|blue|green|gray|grey|black|white|orange|yellow|purple|pink|indigo|teal|mint|cyan|brown)\b/,
        /(?:foregroundStyle|foregroundColor|background|tint|fill|stroke|border)\(\s*\.(?:red|blue|green|gray|black|white|orange|yellow|purple|pink|indigo|teal|mint|cyan|brown)\b/,
      ],
      compose: [/\bColor\s*\(\s*0x[0-9A-Fa-f]{6,8}/, /\bColor\s*\(\s*(?:red\s*=|[0-9.]+f?\s*,)/, /\bColor\.(?:Red|Blue|Green|Gray|Black|White|Yellow|Cyan|Magenta|DarkGray|LightGray)\b/],
      flutter: [/\bColor\s*\(\s*0x[0-9A-Fa-f]{6,8}/, /\bColor\.from(?:ARGB|RGBO)\s*\(/, /\bColors\.(?!transparent\b)[a-z]\w*/],
      "react-native": [/['"`]#[0-9a-fA-F]{3,8}['"`]/, /['"`]rgba?\(/, /['"`]hsla?\(/, /\b(?:color|backgroundColor|borderColor|tintColor)\s*:\s*['"](?:red|blue|green|gray|grey|black|white|orange|yellow|purple|pink)['"]/],
    },
    message: "Hard-coded colour. Nucleux screens use the kit's tokens so light, dark and the web kit stay in step.",
    fix: COLOUR_FIX,
  },
  {
    code: "steals-focus",
    severity: "warning",
    patterns: {
      swiftui: [/\b\w*[Ff]ocus\w*\s*=\s*true\b/, /\.becomeFirstResponder\s*\(/],
      compose: [/\.requestFocus\s*\(/, /\bshowSoftwareKeyboard\s*\(|\bkeyboardController\??\.show\s*\(/],
      flutter: [/\bautofocus\s*:\s*true\b/, /\.requestFocus\s*\(/],
      "react-native": [/\bautoFocus\b(?!\s*=\s*\{\s*false\s*\})/, /\.focus\s*\(\s*\)/],
    },
    message: "Moves focus or raises the keyboard on its own. Never steal focus: leave focus where the person put it and announce changes politely.",
    fix: {
      swiftui: "Remove it; post AccessibilityNotification.Announcement(\"…\") for the change instead.",
      compose: "Remove it; announce the change politely (a polite live region, or View.announceForAccessibility).",
      flutter: "Remove it; announce with SemanticsService.sendAnnouncement(…) instead.",
      "react-native": "Remove it; announce with AccessibilityInfo.announceForAccessibility(…) instead.",
    },
  },
  {
    code: "assertive-announcement",
    severity: "warning",
    patterns: {
      compose: [/LiveRegionMode\.Assertive/],
      "react-native": [/accessibilityLiveRegion\s*=\s*["']assertive["']/, /aria-live\s*=\s*["']assertive["']/],
      flutter: [/Assertiveness\.assertive/],
      swiftui: [/\.announcementPriority\s*,\s*value:\s*\.high|priority:\s*\.high/],
    },
    message: "Assertive announcement. Nucleux announces state changes politely; assertive interrupts whatever is being read.",
    fix: { all: "Use the polite form (Compose LiveRegionMode.Polite; RN accessibilityLiveRegion=\"polite\"; Flutter Assertiveness.polite; SwiftUI the default announcement priority)." },
  },
  {
    code: "separate-composer",
    severity: "error",
    patterns: { all: [/\b(?!(?:Nucleux)?PromptComposer\b)(?:Nucleux)?[A-Z]\w*Composer\b(?=\s*[({<]|\s*$)|<(?!PromptComposer\b)[A-Z]\w*Composer\b/] },
    message: "A separate composer. Composer features (voice, attachments, suggestions, autocomplete, Open Input, settings, the Disclaimer line) are options on the one PromptComposer, never new composers.",
    fix: {
      swiftui: "Use NucleuxPromptComposer with its modifiers (.nucleuxVoice, .nucleuxAttachments, .nucleuxSuggestions, .nucleuxAutocomplete, .nucleuxComposerSettings, .nucleuxDisclaimerLine…).",
      compose: "Use NucleuxPromptComposer with its parameters (voice, attachments, suggestions, autocomplete, settings, onLimitsPress…).",
      flutter: "Use NucleuxPromptComposer with its parameters (voice, attachments, suggestions, autocomplete, settings, onLimitsPress…).",
      "react-native": "Use PromptComposer with its props (voice, attachments, suggestions, autocomplete, settings, onLimitsPress…).",
    },
  },
  {
    code: "web-kit-import",
    severity: "error",
    patterns: { "react-native": [/from\s+['"]@nucleux\/[\w-]+['"]/] },
    message: "@nucleux/* is the web (React DOM) kit; it does not run in React Native.",
    fix: { "react-native": "Import from '@intelligaia/nucleux' (React Native)." },
  },
];

/** Names the agent calls that look like the kit's but are not in it. */
const SYMBOL_PATTERNS: Record<MobileFramework, RegExp[]> = {
  swiftui: [/\bNucleux[A-Z]\w*(?:\.[A-Za-z]\w*)?/g, /(?<=\.)nucleux[A-Z]\w*(?=\s*\()/g],
  compose: [/\bNucleux[A-Z]\w*(?:\.[A-Za-z]\w*)?/g],
  flutter: [/\bNucleux[A-Z]\w*(?:\.[A-Za-z]\w*)?/g],
  "react-native": [],
};

/** Removed names reported by the removed-api rules, so they are not also reported as unknown. */
const REMOVED_NAMES = new Set(["NucleuxCaveatVariant", "nucleuxCaveat", "onCaveatPress", "CAVEAT_OUTPUT", "CAVEAT_ACTION", "caveatText", "NucleuxConsentAsk", "NucleuxConsentScope", "NucleuxTemplateCard", "NucleuxTemplateList", "NucleuxPromptTemplate", "NucleuxTemplateSlot", "draftedBy"]);

function lineOf(text: string, index: number): number {
  let n = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

function isCommentLine(line: string): boolean {
  return /^\s*(?:\/\/|\/\*|\*|#(?!\w))/.test(line);
}

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[] = [];
  for (let j = 0; j <= n; j++) d[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[n];
}

/** Closest kit names to an unknown one. */
export function nearestSymbols(name: string, known: Iterable<string>, limit = 3): string[] {
  const q = name.toLowerCase();
  const scored: Array<{ s: string; d: number }> = [];
  for (const s of known) {
    if (s.includes(".")) continue;
    const l = s.toLowerCase();
    const d = l.includes(q) || q.includes(l) ? Math.abs(l.length - q.length) / 4 : editDistance(q, l);
    if (d <= Math.max(3, q.length / 4)) scored.push({ s, d });
  }
  return scored.sort((a, b) => a.d - b.d || a.s.length - b.s.length).slice(0, limit).map((x) => x.s);
}

/** Names imported from '@intelligaia/nucleux' (React Native), with their position. */
function rnImports(code: string): Array<{ name: string; index: number }> {
  const out: Array<{ name: string; index: number }> = [];
  const re = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]@intelligaia\/nucleux['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    const start = m.index + m[0].indexOf("{") + 1;
    let offset = 0;
    for (const raw of m[1].split(",")) {
      const name = raw.replace(/^\s*type\s+/, "").split(/\s+as\s+/)[0].trim();
      if (name) out.push({ name, index: start + offset + raw.indexOf(name.charAt(0)) });
      offset += raw.length + 1;
    }
  }
  return out;
}

export function validateUsage(catalog: MobileCatalog, framework: MobileFramework, code: string): UsageReport {
  const issues: UsageIssue[] = [];
  const lines = code.split("\n");
  const seen = new Set<string>();
  const push = (i: UsageIssue) => {
    const key = `${i.code}:${i.line}:${i.match}`;
    if (seen.has(key)) return;
    seen.add(key);
    issues.push(i);
  };

  for (const rule of USAGE_RULES) {
    const pats = [...(rule.patterns.all ?? []), ...(rule.patterns[framework] ?? [])];
    if (!pats.length) continue;
    const gate = rule.when?.[framework];
    if (gate && !gate.test(code)) continue;
    lines.forEach((line, i) => {
      if (rule.codeOnly !== false && isCommentLine(line)) return;
      for (const p of pats) {
        const m = line.match(p);
        if (!m) continue;
        push({
          severity: rule.severity,
          code: rule.code,
          line: i + 1,
          match: m[0].trim(),
          message: rule.message,
          fix: rule.fix[framework] ?? rule.fix.all,
        });
        break;
      }
    });
  }

  // Unknown kit symbols.
  const known = new Set(catalog.symbols[framework]);
  const removedReported = new Set(issues.filter((i) => i.code === "removed-api").map((i) => `${i.line}:${i.match}`));
  const unknown = (name: string, index: number) => {
    const line = lineOf(code, index);
    if (REMOVED_NAMES.has(name) || [...removedReported].some((k) => k.startsWith(`${line}:`) && k.includes(name)) || isCommentLine(lines[line - 1] ?? "")) return;
    const near = nearestSymbols(name.split(".").pop() === name ? name : name.split(".")[0], known);
    push({
      severity: "error",
      code: "unknown-symbol",
      line,
      match: name,
      message: `${name} is not part of Nucleux Mobile (${catalog.frameworks[framework].label}). The catalog is generated from the sources: if it is not there, it does not exist.`,
      fix: near.length ? `Did you mean ${near.join(", ")}? Check with get_component.` : "Use search_components to find the component, then get_component for its exact API.",
    });
  };
  if (framework === "react-native") {
    for (const { name, index } of rnImports(code)) if (!known.has(name)) unknown(name, index);
  } else {
    for (const re of SYMBOL_PATTERNS[framework]) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(code))) {
        const full = m[0];
        const [head, member] = full.split(".");
        if (known.has(full)) continue;
        if (!known.has(head)) {
          unknown(head, m.index);
          continue;
        }
        // A member on a kit type that has no such member: only a warning (nested names are not all indexed).
        const hasMembers = [...known].some((k) => k.startsWith(`${head}.`));
        if (member && hasMembers && !known.has(full)) {
          const line = lineOf(code, m.index);
          if (isCommentLine(lines[line - 1] ?? "")) continue;
          const near = nearestSymbols(member, [...known].filter((k) => k.startsWith(`${head}.`)).map((k) => k.slice(head.length + 1)));
          push({
            severity: "warning",
            code: "unknown-member",
            line,
            match: full,
            message: `${head} has no public member ${member} in the catalog.`,
            fix: near.length ? `Did you mean ${near.map((n) => `${head}.${n}`).join(", ")}?` : `See get_component for ${head}'s API.`,
          });
        }
      }
    }
  }

  issues.sort((a, b) => a.line - b.line || (a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1));
  const errors = issues.filter((i) => i.severity === "error").length;
  return {
    framework,
    valid: errors === 0,
    errors,
    warnings: issues.length - errors,
    checked: { lines: lines.length, symbols: known.size },
    issues,
  };
}
