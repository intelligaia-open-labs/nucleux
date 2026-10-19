import catalog from "./catalog.json";
import { patterns, resolvePattern } from "./patterns.js";

export interface PlannedComponent {
  /** Export name, e.g. "Button". */
  component: string;
  /** Props the plan passes. Values are checked against allowed variant values when given as strings. */
  props?: Record<string, unknown>;
  children?: PlannedComponent[];
}

export interface DesignPlan {
  patterns?: string[];
  components?: PlannedComponent[];
}

export interface Issue {
  severity: "error" | "warning";
  code:
    | "unknown_pattern"
    | "unknown_component"
    | "unknown_prop"
    | "invalid_value"
    | "missing_required_prop"
    | "deprecated_prop"
    | "pattern_component_missing";
  path: string;
  message: string;
  fix?: string;
}

type Member = {
  name: string;
  type: string;
  required: boolean;
  values?: string[];
  deprecated?: string | boolean;
};
type PropsDecl = { name: string; extends?: string[]; members: Member[] };

const pkgOf = new Map<string, (typeof catalog.packages)[number]>();
for (const p of catalog.packages) for (const e of p.exports) pkgOf.set(e, p);

/** `ButtonProps` for `Button`; falls back to the package's only Props interface. */
function propsFor(component: string): PropsDecl | undefined {
  const pkg = pkgOf.get(component);
  if (!pkg) return undefined;
  const all = pkg.props as PropsDecl[];
  return all.find((p) => p.name === `${component}Props`) ?? (all.length === 1 ? all[0] : undefined);
}

const nearest = (name: string, pool: string[]) => {
  const q = name.toLowerCase();
  return pool.filter((n) => n.toLowerCase().includes(q) || q.includes(n.toLowerCase())).slice(0, 3);
};

// Props React or the DOM always accept; not worth flagging.
const UNIVERSAL =
  /^(key|ref|children|className|style|id|role|title|hidden|tabIndex|on[A-Z]\w*|aria-[\w-]+|data-[\w-]+)$/;

export function validateDesign(plan: DesignPlan) {
  const issues: Issue[] = [];
  const used = new Set<string>();
  const exportNames = [...pkgOf.keys()];

  const visit = (nodes: PlannedComponent[] | undefined, base: string) => {
    (nodes ?? []).forEach((node, i) => {
      const path = `${base}[${i}] ${node.component}`;
      used.add(node.component);
      if (!pkgOf.has(node.component)) {
        const near = nearest(node.component, exportNames);
        issues.push({
          severity: "error",
          code: "unknown_component",
          path,
          message: `${node.component} is not exported by any @nucleux package.`,
          fix: near.length
            ? `Did you mean ${near.join(", ")}? Check with get_component.`
            : "Compose it from existing components or use the ShadCN equivalent (search_components names it), and report it as a gap.",
        });
        visit(node.children, `${path}.children`);
        return;
      }
      const decl = propsFor(node.component);
      const members = new Map((decl?.members ?? []).map((m) => [m.name, m]));
      const given = node.props ?? {};
      for (const [name, value] of Object.entries(given)) {
        const m = members.get(name);
        if (!m) {
          if (UNIVERSAL.test(name)) continue;
          issues.push({
            severity: decl?.extends?.length ? "warning" : "error",
            code: "unknown_prop",
            path: `${path}.${name}`,
            message: decl?.extends?.length
              ? `${name} is not an own prop of ${node.component}; it is only valid if it is an attribute of ${decl.extends.join(" / ")}.`
              : `${node.component} has no prop "${name}".`,
            fix: `Own props: ${[...members.keys()].join(", ") || "none"}.`,
          });
          continue;
        }
        if (m.deprecated) {
          issues.push({
            severity: "warning",
            code: "deprecated_prop",
            path: `${path}.${name}`,
            message: `${name} is deprecated${typeof m.deprecated === "string" ? `: ${m.deprecated}` : "."}`,
          });
        }
        if (m.values && typeof value === "string" && !m.values.includes(value)) {
          issues.push({
            severity: "error",
            code: "invalid_value",
            path: `${path}.${name}`,
            message: `"${value}" is not a valid ${name} for ${node.component}.`,
            fix: `Use one of: ${m.values.map((v) => `"${v}"`).join(", ")}.`,
          });
        }
      }
      for (const m of members.values()) {
        if (m.required && m.name !== "children" && !(m.name in given)) {
          issues.push({
            severity: "error",
            code: "missing_required_prop",
            path,
            message: `${node.component} requires "${m.name}" (${m.type}).`,
          });
        }
      }
      visit(node.children, `${path}.children`);
    });
  };
  visit(plan.components, "components");

  for (const id of plan.patterns ?? []) {
    const p = resolvePattern(id);
    if (!p) {
      issues.push({
        severity: "error",
        code: "unknown_pattern",
        path: `patterns.${id}`,
        message: `No pattern "${id}".`,
        fix: `Available: ${patterns.map((x) => x.id).join(", ")}.`,
      });
      continue;
    }
    if (!plan.components?.length) continue;
    for (const c of p.components.required) {
      if (!used.has(c)) {
        issues.push({
          severity: "warning",
          code: "pattern_component_missing",
          path: `patterns.${p.id}`,
          message: `Pattern ${p.id} requires ${c}, which the plan does not use.`,
          fix: `See get_pattern("${p.id}") for where ${c} goes.`,
        });
      }
    }
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  return {
    valid: errors === 0,
    errors,
    warnings: issues.length - errors,
    checked: {
      patterns: plan.patterns?.length ?? 0,
      components: used.size,
      catalogVersion: catalog.version,
    },
    issues,
  };
}
