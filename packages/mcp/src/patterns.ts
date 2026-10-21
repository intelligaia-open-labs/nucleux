import knowledge from "./knowledge.json";

export type Pattern = (typeof knowledge.patterns)[number];
export interface CompositionNode {
  component?: string;
  element?: string;
  role?: string;
  children?: CompositionNode[];
}

export const patterns: Pattern[] = knowledge.patterns;
export const workflow: string = knowledge.workflow;

const STOP = new Set([
  "a",
  "an",
  "and",
  "app",
  "application",
  "are",
  "can",
  "for",
  "from",
  "i",
  "in",
  "into",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "page",
  "pages",
  "screen",
  "should",
  "that",
  "the",
  "their",
  "them",
  "this",
  "to",
  "ui",
  "use",
  "want",
  "where",
  "which",
  "who",
  "will",
  "with",
]);

/** Lowercase word stems: "dashboards" → "dashboard", "filtering" → "filter". */
function stems(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? [])
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => w.replace(/(ing|ed|es|s)$/, "").replace(/(.)\1$/, "$1") || w);
}

// Field weights: what a pattern is *for* outranks how it is described.
const FIELDS: Array<[(p: Pattern) => string, number]> = [
  [(p) => p.keywords.join(" "), 3],
  [(p) => p.useCases.join(" "), 3],
  [(p) => `${p.id.replace(/-/g, " ")} ${p.name}`, 2],
  [(p) => p.summary, 1],
  [(p) => `${p.description} ${p.whenToUse.join(" ")}`, 1],
];

const index = patterns.map((p) => ({
  p,
  fields: FIELDS.map(([get, weight]) => ({ words: new Set(stems(get(p))), weight })),
}));

export function searchPatterns(
  query: string,
  limit = 5,
): Array<{ pattern: Pattern; score: number }> {
  const terms = [...new Set(stems(query))];
  if (!terms.length) return [];
  return index
    .map(({ p, fields }) => {
      let score = 0;
      for (const t of terms) {
        // Count a term once per pattern, at the weight of the best field it hits.
        let best = 0;
        for (const f of fields) if (f.words.has(t)) best = Math.max(best, f.weight);
        score += best;
      }
      return { pattern: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.pattern.id.localeCompare(b.pattern.id))
    // Drop weak matches that only share an incidental word with the query.
    .filter((r, _, all) => r.score >= all[0].score * 0.5)
    .slice(0, limit);
}

export function resolvePattern(id: string): Pattern | undefined {
  const q = id.trim().toLowerCase();
  return patterns.find(
    (p) => p.id === q || p.name.toLowerCase() === q || p.id === q.replace(/\s+/g, "-"),
  );
}

/** Patterns whose components include `exportName` (for back-links from get_component). */
export function patternsUsing(exportNames: string[]): Pattern[] {
  const names = new Set(exportNames);
  return patterns.filter((p) =>
    [...p.components.required, ...p.components.optional].some((c) => names.has(c)),
  );
}

export function renderPatternBrief(p: Pattern): string {
  return [
    `- **${p.id}** — ${p.name}${p.status === "curated" ? "" : " (proposed, not yet curated)"}`,
    `  ${p.summary}`,
    `  Use for: ${p.useCases.slice(0, 4).join("; ")}`,
    `  Needs: ${p.components.required.join(", ")}`,
    p.related.length ? `  Related: ${p.related.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderTree(nodes: CompositionNode[] | undefined, depth = 0): string[] {
  const out: string[] = [];
  for (const n of nodes ?? []) {
    const name = n.component ? `\`${n.component}\`` : `<${n.element}>`;
    out.push(`${"  ".repeat(depth)}- ${name}${n.role ? ` — ${n.role}` : ""}`);
    out.push(...renderTree(n.children, depth + 1));
  }
  return out;
}

const list = (title: string, items: string[]) =>
  items.length ? [`## ${title}`, ...items.map((i) => `- ${i}`), ""] : [];

export function renderPattern(p: Pattern, includeExample: boolean): string {
  const extra = p as Pattern & { states?: string; routing?: string };
  const status =
    p.status === "curated"
      ? `Curated Nucleux pattern (since ${p.since}). The example is typechecked and render-tested against the library.`
      : "Proposed pattern — not yet curated. Treat as a suggestion.";
  const npm = p.dependencies.npm.map((d) => `\`${d.name}\` — ${d.reason}`);
  return [
    `# ${p.name} (\`${p.id}\`)`,
    "",
    status,
    "",
    p.description,
    "",
    ...list("When to use", p.whenToUse),
    ...list("When not to use", p.whenNotToUse),
    "## Components",
    `- Required: ${p.components.required.join(", ")}`,
    `- Optional: ${p.components.optional.join(", ") || "—"}`,
    `- All are exported by \`@nucleux/react\` (or individually: ${p.packages.map((x) => `\`${x}\``).join(", ")}).`,
    "- Read each with `get_component` before using it.",
    "",
    "## Composition",
    ...renderTree(p.composition as CompositionNode[]),
    "",
    ...list("Layout", p.layout),
    ...list("Responsive rules", p.responsive),
    ...list("Design tokens", p.tokens),
    ...list("Accessibility", p.accessibility),
    ...(extra.states ? ["## States", extra.states, ""] : []),
    ...(extra.routing ? ["## Routing", extra.routing, ""] : []),
    ...list("Anti-patterns", p.antiPatterns),
    ...list("Other dependencies", npm),
    p.related.length ? `**Related patterns:** ${p.related.join(", ")}\n` : "",
    includeExample
      ? `## Example\n\nComplete, working reference. Adapt the data model; keep the structure.\n\n\`\`\`tsx\n${p.exampleSource}\n\`\`\``
      : "Example omitted (call again with includeExample: true for the full TSX).",
  ].join("\n");
}
