/**
 * ShadCN fallback.
 *
 * Nucleux is an *agentic* UI library: it owns the chat, reasoning, tool-call and
 * consent surfaces, plus enough basics to build a screen. It deliberately does
 * not try to be a general component library, so an agent asking for a date
 * picker or a command palette will find nothing — and, left to itself, will
 * invent one.
 *
 * The house answer is to take the ShadCN component as the base and restyle it
 * onto Nucleux tokens. That is already the public position: nucleux.in's
 * "Basic Components" nav entry links straight to ui.shadcn.com. This module
 * makes the same answer reachable from the MCP tools, at the moment a lookup
 * misses.
 *
 * Entries here are the gaps only. Anything Nucleux already ships resolves in
 * the catalog first and never reaches this file.
 */

export const SHADCN_DOCS = "https://ui.shadcn.com/docs/components";

export interface ShadcnEntry {
  /** Registry id for `npx shadcn@latest add <id>`. Empty for docs-only recipes. */
  id: string;
  title: string;
  keywords: string[];
  /** Set when ShadCN documents this as a composition rather than shipping it. */
  recipe?: string;
  /** Closest Nucleux component, when one exists — prefer it over scaffolding. */
  near?: string;
}

/**
 * Note the `recipe` entries: `combobox`, `date-picker`, `data-table` and
 * `typography` are documentation pages, not registry items. `shadcn add
 * combobox` fails. Naming the primitives instead is the difference between
 * guidance that works and guidance that sends an agent into an error.
 */
export const SHADCN_FALLBACK: ShadcnEntry[] = [
  // Forms — the biggest single gap. Nucleux has Checkbox/RadioGroup/Select/
  // Switch and the chat composers, but no plain field primitives and no form
  // plumbing at all.
  { id: "form", title: "Form", keywords: ["form", "validation", "react-hook-form", "zod", "field", "fieldset", "errors"] },
  { id: "input", title: "Input", keywords: ["input", "text field", "textbox", "email", "password"], near: "SearchInput (search only) / InputBar (chat composer)" },
  { id: "textarea", title: "Textarea", keywords: ["textarea", "multiline", "long text"], near: "InputBar (auto-resizing chat composer)" },
  { id: "label", title: "Label", keywords: ["label", "caption", "field label"] },
  { id: "input-otp", title: "Input OTP", keywords: ["otp", "one time password", "verification code", "pin", "2fa"] },
  { id: "slider", title: "Slider", keywords: ["slider", "range", "seek", "volume"] },
  { id: "toggle", title: "Toggle", keywords: ["toggle", "pressed", "toolbar button"], near: "Switch (on/off), IconButton variant=\"active\"" },
  { id: "toggle-group", title: "Toggle Group", keywords: ["toggle group", "segmented control", "button group"] },

  // Dates.
  { id: "calendar", title: "Calendar", keywords: ["calendar", "date", "month", "day picker"] },
  { id: "", title: "Date Picker", recipe: "Popover + Calendar", keywords: ["date picker", "datepicker", "date range", "schedule"] },

  // Search / palette.
  { id: "command", title: "Command", keywords: ["command", "command palette", "cmdk", "quick open", "spotlight"] },
  { id: "", title: "Combobox", recipe: "Popover + Command", keywords: ["combobox", "autocomplete", "typeahead", "searchable select", "multi select"] },

  // Data.
  { id: "chart", title: "Chart", keywords: ["chart", "graph", "plot", "recharts", "bar", "line", "area", "pie"] },
  { id: "", title: "Data Table", recipe: "Table + @tanstack/react-table", keywords: ["data table", "datagrid", "grid", "sorting", "column", "row selection", "pagination table"], near: "Table (semantic primitives, no sorting/paging)" },
  { id: "pagination", title: "Pagination", keywords: ["pagination", "pager", "page numbers", "next previous"] },

  // Layout / surfaces.
  { id: "skeleton", title: "Skeleton", keywords: ["skeleton", "loading placeholder", "shimmer"], near: "Progress (indeterminate), TypingIndicator" },
  { id: "scroll-area", title: "Scroll Area", keywords: ["scroll area", "scrollbar", "overflow", "custom scrollbar"] },
  { id: "resizable", title: "Resizable", keywords: ["resizable", "split pane", "panel group", "drag handle", "splitter"] },
  { id: "aspect-ratio", title: "Aspect Ratio", keywords: ["aspect ratio", "16:9", "video box"] },
  { id: "carousel", title: "Carousel", keywords: ["carousel", "slider gallery", "embla", "slideshow"] },
  { id: "collapsible", title: "Collapsible", keywords: ["collapsible", "disclosure", "show more", "expand"], near: "Accordion (multi-panel), Reasoning (chain-of-thought)" },
  { id: "drawer", title: "Drawer", keywords: ["drawer", "bottom sheet", "vaul", "mobile panel"], near: "Sheet (side slide-over)" },

  // Overlays / navigation.
  { id: "hover-card", title: "Hover Card", keywords: ["hover card", "preview card", "profile hover"], near: "Tooltip (text only), Popover (click)" },
  { id: "context-menu", title: "Context Menu", keywords: ["context menu", "right click", "secondary click"], near: "Menu" },
  { id: "menubar", title: "Menubar", keywords: ["menubar", "application menu", "file edit view"], near: "GlobalNav, Menu" },
  { id: "navigation-menu", title: "Navigation Menu", keywords: ["navigation menu", "mega menu", "nav dropdown"], near: "GlobalNav, NavPanel" },
  { id: "alert-dialog", title: "Alert Dialog", keywords: ["alert dialog", "confirm", "confirmation", "destructive confirm", "are you sure"], near: "ActionConfirmation (agent guardrail), Dialog" },
  { id: "sonner", title: "Sonner", keywords: ["sonner", "toaster", "notification stack"], near: "Toast + ToastProvider/useToast" },

  // Typography.
  { id: "", title: "Typography", recipe: "plain Tailwind classes, no component", keywords: ["typography", "prose", "heading styles", "blockquote"] },
];

const norm = (s: string) => s.trim().toLowerCase().replace(/[\s_-]+/g, " ");

/** Exact-ish lookup: matches an entry's registry id, title, or a keyword. */
export function resolveShadcn(query: string): ShadcnEntry | undefined {
  const q = norm(query);
  return (
    SHADCN_FALLBACK.find((e) => e.id && norm(e.id) === q) ??
    SHADCN_FALLBACK.find((e) => norm(e.title) === q) ??
    SHADCN_FALLBACK.find((e) => e.keywords.some((k) => norm(k) === q))
  );
}

/** Free-text scoring, for the search miss path. */
export function searchShadcn(query: string, limit = 5): ShadcnEntry[] {
  const terms = norm(query).split(" ").filter(Boolean);
  if (!terms.length) return [];
  return SHADCN_FALLBACK.map((e) => {
    const hay = norm([e.id, e.title, e.recipe ?? "", e.keywords.join(" ")].join(" "));
    // Whole-phrase hits beat scattered word hits, so "data table" ranks the
    // Data Table recipe above anything merely containing "table".
    const phrase = hay.includes(norm(query)) ? 2 : 0;
    return { e, score: phrase + terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0) };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.e);
}

function line(e: ShadcnEntry): string {
  const how = e.id ? `\`npx shadcn@latest add ${e.id}\`` : `compose it from ${e.recipe} (ShadCN documents this one; there is no \`add\` for it)`;
  const near = e.near ? ` Closest in Nucleux: ${e.near} — prefer it if it fits.` : "";
  return `- **${e.title}** — ${how}.${near}`;
}

/**
 * The adaptation notes. Points 2 and 3 are the whole reason this is worth
 * saying: the Nucleux preset happens to use ShadCN's own token vocabulary, so
 * pasted markup mostly resolves untouched — except for three names it never
 * defines, which fail *silently* as an invalid colour rather than a build
 * error. An agent that does not know that ships transparent cards.
 */
const HOW_TO_ADAPT = [
  "## Using a ShadCN component as the base",
  "",
  "1. Scaffold it into your own tree (`npx shadcn@latest add <id>`). ShadCN writes editable source, not a dependency, so it is a starting point you own.",
  "2. Most Tailwind classes already resolve: the Nucleux preset defines the same token names ShadCN expects — `background`, `foreground`, `border`, `input`, `ring`, `primary`, `muted`, `accent`, `destructive` — plus `info`, `brand`, `success` and `warning`.",
  "3. ⚠️ Nucleux defines **no `card`, `popover` or `secondary` tokens**. `bg-card`, `bg-popover` and `bg-secondary` resolve to an invalid colour and render transparent, with no build error. Swap `bg-card`/`bg-popover` for `bg-background` and `bg-secondary` for `bg-muted`, or declare `--nx-card` and friends yourself alongside the theme import.",
  "4. Radius comes from `--nx-radius` through `rounded-sm|md|lg`. Keep those classes; drop any hardcoded pixel radius.",
  "5. Compose with Nucleux wherever it already owns the part — Button, Dialog, Popover, Menu, Tooltip, Table — instead of pulling ShadCN's copies in beside them, so one system owns the look.",
  "6. Dark mode is `darkMode: \"class\"` in both, so ShadCN's `dark:` variants keep working under Nucleux's `.dark` root.",
].join("\n");

/**
 * The block appended to a tool result that found nothing. `matches` empty means
 * "no specific suggestion" — still worth stating the policy so the agent reaches
 * for ShadCN rather than hand-rolling.
 */
export function renderFallback(matches: ShadcnEntry[]): string {
  const head = `## Not in Nucleux — use ShadCN as the base\n\nNucleux covers agentic surfaces and the common basics. For anything it does not ship, the house rule is to start from the ShadCN component and restyle it onto Nucleux tokens, not to write one from scratch. Docs: ${SHADCN_DOCS}`;
  const body = matches.length
    ? ["", "### Closest ShadCN equivalents", "", ...matches.map(line)].join("\n")
    : ["", `Browse ${SHADCN_DOCS} for the closest primitive.`].join("\n");
  return [head, body, "", HOW_TO_ADAPT].join("\n");
}

/**
 * Short version, appended alongside real Nucleux results.
 *
 * The catalog search scores a hit for *any* matching term, so "data table
 * sorting" returns RightSidebar ("table of contents") and never looks empty —
 * which means the miss path above almost never fires for the queries that most
 * need it. When the best Nucleux hit did not match every term, the results are
 * probably incidental, so name the ShadCN equivalent too and let the caller
 * choose. Deliberately without the adaptation notes: those are long, and they
 * are already in the server instructions and get_setup.
 */
export function renderFallbackBrief(matches: ShadcnEntry[]): string {
  if (!matches.length) return "";
  return [
    "",
    "---",
    "",
    "None of those fit? Nucleux does not ship this one — start from ShadCN and restyle onto Nucleux tokens:",
    "",
    ...matches.map(line),
    "",
    `(Adaptation notes: get_setup, or ${SHADCN_DOCS}.)`,
  ].join("\n");
}

/** One-line version, for appending to results that DID find something. */
export const FALLBACK_HINT = `_Need something Nucleux does not ship? Start from the ShadCN component and restyle it onto Nucleux tokens — ${SHADCN_DOCS}._`;
