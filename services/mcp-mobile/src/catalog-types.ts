// Shape of mobile-catalog.json (written by scripts/gen-mcp-catalog.mjs). Kept loose where the generator's output
// varies by framework, so the module also accepts a vendored copy of the JSON.

export const MOBILE_FRAMEWORKS = ["swiftui", "compose", "flutter", "react-native"] as const;
export type MobileFramework = (typeof MOBILE_FRAMEWORKS)[number];

export function isMobileFramework(x: unknown): x is MobileFramework {
  return typeof x === "string" && (MOBILE_FRAMEWORKS as readonly string[]).includes(x);
}

export interface ApiParam {
  name: string;
  type: string;
  named?: boolean;
  required?: boolean;
  default?: string;
  doc?: string;
}

export interface ApiMember {
  name: string;
  signature?: string;
  doc?: string;
  kind?: string;
  params?: ApiParam[];
  paramDocs?: Record<string, string>;
  /** TypeScript interface members. */
  type?: string;
  optional?: boolean;
}

export interface ApiSymbol {
  name: string;
  kind: string;
  signature: string;
  doc: string;
  file: string;
  line: number;
  members: ApiMember[];
  annotations?: string[];
  paramDocs?: Record<string, string>;
  body?: string;
  extends?: string;
}

export interface FrameworkEntry {
  files: string[];
  import: string;
  primary: string | null;
  symbols: ApiSymbol[];
  constants?: Record<string, string>;
  example?: string;
}

export interface FixtureWords {
  constants: Record<string, unknown>;
  inCases: string[];
}

export interface MobileComponent {
  id: string;
  name: string;
  aliases: string[];
  kind: string;
  description: string;
  status: Record<MobileFramework, string>;
  tracker: string[];
  spec: string | null;
  specSummary: string | null;
  specText: string | null;
  fixtures: string[];
  words: Record<string, FixtureWords>;
  related: string[];
  frameworks: Record<MobileFramework, FrameworkEntry | null>;
}

export interface MobileExample {
  name: string;
  component: string;
  framework: MobileFramework;
  title: string;
  source: string;
  code: string;
  lines: number;
}

export interface MobileCatalog {
  library: string;
  version: string;
  frameworks: Record<MobileFramework, { label: string; language: string; package: string; import: string; sourceRoot: string; minimum: string }>;
  versions: Record<string, string>;
  setup: Record<MobileFramework, string>;
  counts: Record<string, number>;
  components: MobileComponent[];
  examples: MobileExample[];
  symbols: Record<MobileFramework, string[]>;
  icons: string[];
}
