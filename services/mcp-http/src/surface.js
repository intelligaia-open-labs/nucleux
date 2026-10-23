// The tool surface a request sees: the web catalog (@nucleux/mcp) for everyone,
// merged with Nucleux Mobile for signed-in requests.
//
// Both upstreams use the same names for the shared tools (list_components,
// get_component, search_components, get_setup, list_examples, get_example), so
// a signed-in client sees ONE tool per shared name whose `framework` takes the
// web values (react/html) plus the mobile ones (swiftui, compose, flutter,
// react-native) and is routed by that value. Tools only one side has pass
// through unchanged. Anonymous requests (NUCLEUX_AUTH=optional|off) see the web
// tools and instructions exactly as the web package serves them.

export const MOBILE_FRAMEWORKS = ["swiftui", "compose", "flutter", "react-native"];
export const SHARED_TOOLS = ["list_components", "get_component", "search_components", "get_setup", "list_examples", "get_example"];

const MOBILE_LABEL = "Mobile (SwiftUI, Compose, Flutter, React Native)";
const FW_LIST = `${MOBILE_FRAMEWORKS.slice(0, -1).map((f) => `"${f}"`).join(", ")} or "${MOBILE_FRAMEWORKS.at(-1)}"`;

export const PLATFORM_PREAMBLE = `Nucleux comes in two platforms: web — @nucleux/react, in two families, shadcn and Material 3 (Md3*) — and mobile — Nucleux Mobile, the same agentic components in SwiftUI, Jetpack Compose, Flutter and React Native. These tools serve both.

Detect the platform from the project before anything else, and ask only when you can't tell: Package.swift or an .xcodeproj → SwiftUI; build.gradle(.kts) with Compose → Jetpack Compose; pubspec.yaml → Flutter; package.json with react-native → React Native; a React, Next.js or Vite web app → web (then the family rule below: Material 3 or shadcn). Record the answer once in the project's AGENTS.md or CLAUDE.md ("Nucleux platform: SwiftUI", or for web "Nucleux family: Material 3") and reuse it.

For mobile, pass framework ${FW_LIST} to list_components, get_component, search_components, get_setup, list_examples and get_example; get_mobile_spec, get_mobile_words and validate_mobile_usage are mobile-only. Without a mobile framework those shared tools answer for the web kit. The web tools (search_patterns, get_pattern, validate_design…) are web-only.`;

export function combinedInstructions(web, mobile) {
  return `${PLATFORM_PREAMBLE}\n\n# Web (@nucleux/react)\n\n${web}\n\n# Mobile (Nucleux Mobile)\n\n${mobile}`;
}

const isMobile = (fw) => typeof fw === "string" && MOBILE_FRAMEWORKS.includes(fw);
const textOf = (result) => (result?.content ?? []).map((c) => (c.type === "text" ? c.text : "")).join("\n");
const textResult = (text, isError = false) => ({ content: [{ type: "text", text }], ...(isError ? { isError: true } : {}) });

// The web package answers a miss with guidance rather than isError.
const webMiss = (result) => result?.isError === true || /^Nucleux has no "/.test(textOf(result));

function enumOf(tool, prop) {
  return tool?.inputSchema?.properties?.[prop]?.enum ?? null;
}

// One schema for a shared name: the web tool's, with `framework` widened to
// the mobile values and any mobile-only parameters (e.g. list_components'
// pattern/foundation kinds) folded in.
export function mergeTool(web, mobile) {
  const webProps = web.inputSchema?.properties ?? {};
  const mobileProps = mobile.inputSchema?.properties ?? {};
  const webFw = webProps.framework;
  const webValues = webFw?.enum ?? ["react"];
  const webDesc = webFw?.description
    ? `Web: ${webFw.description.trim().replace(/([^.!?])$/, "$1.")}`
    : `Web: "react" (or omit) for the web kit.`;
  const properties = { ...webProps };
  properties.framework = {
    type: "string",
    enum: [...webValues, ...MOBILE_FRAMEWORKS],
    description: `${webDesc} Mobile: ${FW_LIST} for Nucleux Mobile's native components in that framework. Omit for web.`,
  };
  for (const [key, schema] of Object.entries(mobileProps)) {
    if (key === "framework") continue;
    if (!properties[key]) {
      properties[key] = { ...schema, description: `${schema.description ?? ""} (mobile only)`.trim() };
    } else if (properties[key].enum && schema.enum) {
      const extra = schema.enum.filter((v) => !properties[key].enum.includes(v));
      if (extra.length) {
        properties[key] = {
          ...properties[key],
          enum: [...properties[key].enum, ...extra],
          description: `${properties[key].description ?? ""} Mobile: ${schema.enum.map((v) => `'${v}'`).join(", ")}${
            schema.description ? ` — ${schema.description}` : ""
          }`.trim(),
        };
      }
    }
  }
  const required = [...new Set([...(web.inputSchema?.required ?? [])])];
  return {
    ...web,
    description: `${web.description ?? ""} For Nucleux Mobile (native apps), pass framework ${FW_LIST}.`.trim(),
    inputSchema: { ...web.inputSchema, type: "object", properties, ...(required.length ? { required } : {}) },
  };
}

// Keep only the arguments the target tool declares (and only enum values it accepts).
function argsFor(tool, args) {
  const props = tool?.inputSchema?.properties;
  if (!props) return { ...args };
  const out = {};
  for (const [k, v] of Object.entries(args ?? {})) {
    if (!(k in props)) continue;
    if (props[k].enum && !props[k].enum.includes(v)) continue;
    out[k] = v;
  }
  return out;
}

export function createSurface({ web, mobile }) {
  const mobileOn = () => !!mobile?.available;

  async function bothTools() {
    const webTools = await web.listTools();
    if (!mobileOn()) return { webTools, mobileTools: null };
    try {
      return { webTools, mobileTools: await mobile.listTools() };
    } catch (err) {
      // A broken mobile child must not take the web tools down with it.
      console.error("[nucleux-mcp] mobile tools unavailable, serving web only:", err.message ?? err);
      return { webTools, mobileTools: null };
    }
  }

  async function instructions(signedIn) {
    const webText = await web.instructions();
    if (!signedIn || !mobileOn()) return webText;
    try {
      const mobileText = await mobile.instructions();
      // Only advertise mobile if its tools are actually reachable.
      await mobile.listTools();
      return mobileText ? combinedInstructions(webText, mobileText) : webText;
    } catch {
      return webText;
    }
  }

  async function listTools(signedIn) {
    if (!signedIn) return web.listTools();
    const { webTools, mobileTools } = await bothTools();
    if (!mobileTools) return webTools;
    const mobileByName = new Map(mobileTools.map((t) => [t.name, t]));
    const webNames = new Set(webTools.map((t) => t.name));
    const merged = webTools.map((t) =>
      SHARED_TOOLS.includes(t.name) && mobileByName.has(t.name) ? mergeTool(t, mobileByName.get(t.name)) : t
    );
    for (const t of mobileTools) if (!webNames.has(t.name)) merged.push(t);
    return merged;
  }

  // A short, grouped list of the mobile components for the no-framework list.
  function mobileDigest(text) {
    const groups = new Map();
    for (const m of text.matchAll(/^- \*\*(.+?)\*\* \(`([^`]+)`, ([^)]+?)\)/gm)) {
      const kind = m[3];
      if (!groups.has(kind)) groups.set(kind, []);
      groups.get(kind).push(`${m[1]} (\`${m[2]}\`)`);
    }
    const count = [...groups.values()].reduce((n, g) => n + g.length, 0);
    if (!count) return text;
    return [
      `Nucleux Mobile has ${count} components and patterns for native apps, the same in each framework. Pass framework ${FW_LIST} to list_components for their status there, and to get_component for the exact API.`,
      "",
      ...[...groups].map(([kind, names]) => `- ${kind}: ${names.join(", ")}`),
    ].join("\n");
  }

  // Returns { result, upstream } — upstream is "web", "mobile" or "web+mobile".
  async function callTool(name, args = {}, signedIn = false) {
    if (!signedIn) return { result: await web.callTool(name, args), upstream: "web" };
    const { webTools, mobileTools } = await bothTools();
    if (!mobileTools) return { result: await web.callTool(name, args), upstream: "web" };

    const webTool = webTools.find((t) => t.name === name);
    const mobileTool = mobileTools.find((t) => t.name === name);
    const toWeb = async () => ({ result: await web.callTool(name, argsFor(webTool, args)), upstream: "web" });
    const toMobile = async () => ({ result: await mobile.callTool(name, argsFor(mobileTool, args)), upstream: "mobile" });

    if (!webTool && mobileTool) return toMobile();
    if (!mobileTool || !SHARED_TOOLS.includes(name)) return toWeb();
    if (isMobile(args.framework)) return toMobile();
    if (args.framework !== undefined) return toWeb(); // a web value

    const webKinds = enumOf(webTool, "kind") ?? [];
    const mobileKinds = enumOf(mobileTool, "kind") ?? [];

    switch (name) {
      case "list_components": {
        const kind = args.kind;
        if (kind && !webKinds.includes(kind) && mobileKinds.includes(kind)) return toMobile();
        const webRes = await web.callTool(name, argsFor(webTool, args));
        if (webRes?.isError || (kind && !mobileKinds.includes(kind))) return { result: webRes, upstream: "web" };
        let mobileText;
        try {
          const r = await mobile.callTool(name, argsFor(mobileTool, args));
          if (r?.isError) return { result: webRes, upstream: "web" };
          mobileText = mobileDigest(textOf(r));
        } catch {
          return { result: webRes, upstream: "web" };
        }
        const content = [
          ...(webRes.content ?? []),
          { type: "text", text: `\n## ${MOBILE_LABEL} — pass framework\n\n${mobileText}` },
        ];
        return { result: { ...webRes, content }, upstream: "web+mobile" };
      }
      case "search_components": {
        const [w, m] = await Promise.allSettled([
          web.callTool(name, argsFor(webTool, args)),
          mobile.callTool(name, argsFor(mobileTool, args)),
        ]);
        if (w.status === "rejected" && m.status === "rejected") throw w.reason;
        const parts = [];
        if (w.status === "fulfilled") parts.push(`## Web (React — shadcn and Material 3)\n\n${textOf(w.value)}`);
        if (m.status === "fulfilled" && !m.value?.isError) {
          parts.push(`## ${MOBILE_LABEL} — pass framework to get_component\n\n${textOf(m.value)}`);
        }
        const upstream = [w.status === "fulfilled" && "web", m.status === "fulfilled" && "mobile"].filter(Boolean).join("+");
        return { result: textResult(parts.join("\n\n")), upstream };
      }
      case "get_component": {
        const webRes = await web.callTool(name, argsFor(webTool, args));
        let mobileRes = null;
        try {
          mobileRes = await mobile.callTool(name, argsFor(mobileTool, args));
        } catch {
          // mobile down: the web answer stands
        }
        const mobileHit = mobileRes && !mobileRes.isError;
        if (!webMiss(webRes)) {
          if (!mobileHit) return { result: webRes, upstream: "web" };
          const head = /^# (.+?) — Nucleux Mobile/m.exec(textOf(mobileRes))?.[1] ?? args.name;
          const note = `\n\n_Nucleux Mobile also has ${head}: for a native app, call get_component again with framework ${FW_LIST}._`;
          return { result: { ...webRes, content: [...(webRes.content ?? []), { type: "text", text: note }] }, upstream: "web" };
        }
        if (!mobileHit) return { result: webRes, upstream: "web" };
        const note = `"${args.name}" is not a web component; it is in Nucleux Mobile (native apps). Below is its overview; pass framework ${FW_LIST} for the exact API in one framework.`;
        return {
          result: { ...mobileRes, content: [{ type: "text", text: note }, ...(mobileRes.content ?? [])] },
          upstream: "mobile",
        };
      }
      default:
        return toWeb();
    }
  }

  return { instructions, listTools, callTool, mobileAvailable: mobileOn };
}
