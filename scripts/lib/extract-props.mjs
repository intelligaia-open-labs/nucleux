// Structured Props extraction for the MCP catalog. Parses a package entry with
// the TypeScript compiler (syntax only — no type checker, so it stays fast) and
// returns every exported `*Props` interface with its members, the interfaces it
// extends, string-literal variant values resolved from local type aliases, and
// default values read from the component's destructuring pattern.
import ts from "typescript";

function jsDocOf(node) {
  const docs = node.jsDoc ?? [];
  const last = docs[docs.length - 1];
  if (!last) return { description: "", deprecated: undefined };
  const comment = typeof last.comment === "string" ? last.comment : ts.getTextOfJSDocComment(last.comment) ?? "";
  const dep = (last.tags ?? []).find((t) => t.tagName.text === "deprecated");
  const deprecated = dep
    ? (typeof dep.comment === "string" ? dep.comment : ts.getTextOfJSDocComment(dep.comment) ?? "")
        .replace(/\s+/g, " ")
        .trim() || true
    : undefined;
  return { description: comment.replace(/\s*\n\s*/g, " ").trim(), deprecated };
}

function isExported(node) {
  return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
}

/** Local `type X = "a" | "b"` aliases → their literal members. */
function literalUnions(sf) {
  const out = new Map();
  for (const st of sf.statements) {
    if (!ts.isTypeAliasDeclaration(st)) continue;
    const t = st.type;
    const members = ts.isUnionTypeNode(t) ? t.types : [t];
    const isLiteral = (m) =>
      ts.isLiteralTypeNode(m) && (ts.isStringLiteral(m.literal) || ts.isNumericLiteral(m.literal));
    // Only pure literal unions are variants; anything mixed is left alone.
    if (members.length && members.every(isLiteral)) {
      out.set(st.name.text, members.map((m) => m.literal.text));
    }
  }
  return out;
}

/** Literal values a member type allows, inline (`"a" | "b"`) or via a local alias. */
function variantValues(typeNode, aliases) {
  if (!typeNode) return undefined;
  const parts = ts.isUnionTypeNode(typeNode) ? typeNode.types : [typeNode];
  const values = [];
  for (const p of parts) {
    if (ts.isLiteralTypeNode(p) && (ts.isStringLiteral(p.literal) || ts.isNumericLiteral(p.literal))) {
      values.push(p.literal.text);
    } else if (ts.isTypeReferenceNode(p) && ts.isIdentifier(p.typeName) && aliases.has(p.typeName.text)) {
      values.push(...aliases.get(p.typeName.text));
    } else if (p.kind === ts.SyntaxKind.UndefinedKeyword) {
      continue;
    } else return undefined;
  }
  return values.length ? values : undefined;
}

/**
 * Defaults from `forwardRef<El, XProps>(({ a = 1, ... }) => …)` and
 * `function X({ a = 1 }: XProps)` — keyed by the Props interface name.
 */
function destructuredDefaults(sf) {
  const out = new Map();
  const record = (propsName, param) => {
    if (!propsName || !param || !ts.isObjectBindingPattern(param.name)) return;
    const map = out.get(propsName) ?? {};
    for (const el of param.name.elements) {
      if (!el.initializer || el.dotDotDotToken) continue;
      const key = (el.propertyName ?? el.name).getText(sf);
      map[key] = el.initializer.getText(sf);
    }
    out.set(propsName, map);
  };
  const refName = (t) => (t && ts.isTypeReferenceNode(t) ? t.typeName.getText(sf) : undefined);
  const visit = (node) => {
    if (ts.isCallExpression(node) && /(^|\.)forwardRef$/.test(node.expression.getText(sf))) {
      const fn = node.arguments[0];
      const propsName = refName(node.typeArguments?.[1]);
      if (fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) {
        record(propsName ?? refName(fn.parameters[0]?.type), fn.parameters[0]);
      }
    } else if ((ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) && node.parameters.length) {
      record(refName(node.parameters[0].type), node.parameters[0]);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

/** Leading JSDoc + declaration text, exactly as written in the source. */
function declarationSource(node, sf) {
  const docs = node.jsDoc ?? [];
  const start = docs.length ? docs[docs.length - 1].getStart(sf) : node.getStart(sf);
  return sf.text.slice(start, node.getEnd()).trim();
}

export function extractProps(src, fileName = "index.tsx") {
  if (!src) return [];
  const sf = ts.createSourceFile(fileName, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const aliases = literalUnions(sf);
  const defaults = destructuredDefaults(sf);
  const out = [];
  for (const st of sf.statements) {
    if (!ts.isInterfaceDeclaration(st) || !isExported(st) || !/Props$/.test(st.name.text)) continue;
    const name = st.name.text;
    const defs = defaults.get(name) ?? {};
    const members = [];
    for (const m of st.members) {
      if (!ts.isPropertySignature(m) || !m.name) continue;
      const key = m.name.getText(sf).replace(/^["']|["']$/g, "");
      const doc = jsDocOf(m);
      const member = {
        name: key,
        type: m.type ? m.type.getText(sf).replace(/\s+/g, " ") : "unknown",
        required: !m.questionToken,
      };
      if (doc.description) member.description = doc.description;
      const values = variantValues(m.type, aliases);
      if (values) member.values = values;
      if (key in defs) member.default = defs[key];
      if (doc.deprecated) member.deprecated = doc.deprecated;
      members.push(member);
    }
    const ext = (st.heritageClauses ?? []).flatMap((h) => h.types.map((t) => t.getText(sf).replace(/\s+/g, " ")));
    out.push({
      name,
      source: declarationSource(st, sf),
      ...(ext.length ? { extends: ext } : {}),
      members,
    });
  }
  return out;
}
