// The Playground's planner: nucleux.in/playground sends a prompt and the
// pattern catalog it already has; Yantra (Intelligaia's model gateway) picks
// the patterns to build with. The key stays here; the browser never sees it.
//
// Yantra speaks Ollama's /api/chat: it streams NDJSON unless stream:false,
// "thinks" out loud unless think:false, and format:"json" makes message.content
// one JSON object. An OpenAI-style reply (choices[0].message.content) is read
// too, in case the gateway changes.

const SYSTEM = `You plan UI screens for Nucleux, a design-system pattern library for AI products.
You get a user's request and the catalog of available patterns (id, name, summary).
Pick the patterns that best build what the user asked for, in the order they appear on screen (top to bottom).
Use only ids from the catalog. Pick 1 to 8. If nothing fits, return an empty list and say so in "reply".
Reply with one JSON object and nothing else:
{"reply": "<one or two friendly sentences on what you built and why>", "title": "<short name for the screen>", "picks": [{"id": "<catalog id>", "why": "<a few words>"}]}`;

export function createYantra({ url, key, model, timeoutMs = 25_000, fetchImpl = fetch } = {}) {
  if (!url || !key) return null;

  async function plan({ prompt, patterns }) {
    const catalog = patterns.map((p) => `${p.id} | ${p.name}${p.summary ? ` | ${p.summary}` : ""}`).join("\n");
    const body = {
      model,
      stream: false,
      think: false,
      format: "json",
      options: { temperature: 0.2 },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Catalog:\n${catalog}\n\nRequest: ${prompt}` },
      ],
    };
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new Error(`yantra ${res.status}`);
    const text = await res.text();
    const out = parsePlan(contentOf(text));
    const known = new Set(patterns.map((p) => p.id));
    const seen = new Set();
    const picks = out.picks
      .filter((p) => known.has(p.id) && !seen.has(p.id) && seen.add(p.id))
      .slice(0, 8);
    return { reply: out.reply, title: out.title, picks };
  }

  return { plan, model };
}

// The assistant text from a non-streamed reply, or from NDJSON chunks if the
// gateway streamed anyway.
export function contentOf(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  let content = "";
  for (const line of lines) {
    let j;
    try {
      j = JSON.parse(line);
    } catch {
      continue;
    }
    if (j?.message?.content) content += j.message.content;
    else if (j?.choices?.[0]?.message?.content) content += j.choices[0].message.content;
  }
  return content;
}

export function parsePlan(content) {
  let j;
  try {
    j = JSON.parse(content);
  } catch {
    // Models sometimes wrap JSON in prose or a code fence.
    const m = /\{[\s\S]*\}/.exec(content);
    if (!m) throw new Error("yantra: no JSON in reply");
    j = JSON.parse(m[0]);
  }
  const str = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
  const picks = Array.isArray(j?.picks) ? j.picks : [];
  return {
    reply: str(j?.reply, 600),
    title: str(j?.title, 80),
    picks: picks
      .map((p) => (typeof p === "string" ? { id: p } : p))
      .filter((p) => p && typeof p.id === "string")
      .map((p) => ({ id: p.id.trim(), why: str(p.why, 160) })),
  };
}
