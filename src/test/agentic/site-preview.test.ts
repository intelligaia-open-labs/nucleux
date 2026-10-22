import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Every agentic pattern nucleux.in marks Available, in both families, ships the
// composition its live preview shows (src/site-preview.tsx). The MCP serves it
// as "As on nucleux.in" code, and it is the package's first story.
const PATTERNS = ["agent-avatar","ai-icons","attachments","autocomplete","caveat","color","connectors","consent","disclaimer","disclosure","example-gallery","gesture","handwriting","iconography","initial-cta","knowledge-base","mcp-connection","model-selection","name","nudges","open-input","personality","proactive","randomize","structured-input","suggested-prompts","templates","visual-input","voice-input","suggestions","madlibs","prompt-enhancer","modes","voice-tone","preset-styles"];
const PACKAGES = PATTERNS.flatMap((p) => [p, `md3-${p}`]);
const root = resolve(__dirname, "../../../packages");

describe("site previews", () => {
  it.each(PACKAGES)("%s ships a copyable SitePreview that is its first story", (pkg) => {
    const file = resolve(root, pkg, "src/site-preview.tsx");
    expect(existsSync(file)).toBe(true);
    const src = readFileSync(file, "utf8");
    expect(src).toMatch(/export function SitePreview\(/);
    // Copy-paste code: only the package itself, other Nucleux packages, React and lucide.
    const deps = JSON.parse(readFileSync(resolve(root, pkg, "package.json"), "utf8")).dependencies ?? {};
    for (const [, from] of src.matchAll(/from "([^"]+)"/g)) {
      if (from === "./index" || from === "react" || from === "lucide-react") continue;
      expect(from, `${pkg} imports ${from}`).toMatch(/^@nucleux\//);
      expect(deps, `${pkg} must depend on ${from}`).toHaveProperty([from]);
    }
    expect(src).not.toMatch(/@storybook|style=\{\{|#[0-9a-fA-F]{3,6}\b/);
    const stories = readdirSync(resolve(root, pkg, "src")).find((f) => f.endsWith(".stories.tsx"));
    const first = readFileSync(resolve(root, pkg, "src", stories!), "utf8").match(/export const (\w+)/)?.[1];
    expect(first).toBe("SitePreview");
  });
});
