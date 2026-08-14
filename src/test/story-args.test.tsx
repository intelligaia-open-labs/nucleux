/// <reference types="vite/client" />
import { isValidElement } from "react";
import { describe, expect, it } from "vitest";
import { composeStories } from "@storybook/react";

// Regression guard for the Storybook "Objects are not valid as a React child
// (found: object with keys {})" crash. Storybook serializes a story's `args`
// across the preview↔manager channel (and for the Docs/Controls panel). React
// elements can't survive that round-trip — they come back as bare objects and
// crash the story render. So no `args` value may be (or contain) a React
// element: node-typed props must be supplied via a story `render` instead.

const modules = import.meta.glob("../../packages/*/src/*.stories.tsx", {
  eager: true,
});

/** Deep-search a value for a React element (arrays + plain objects). */
function containsElement(value: unknown, seen = new Set<unknown>()): boolean {
  if (value == null || typeof value !== "object") return false;
  if (isValidElement(value)) return true;
  if (seen.has(value)) return false;
  seen.add(value);
  const values = Array.isArray(value) ? value : Object.values(value);
  return values.some((v) => containsElement(v, seen));
}

const storyName = (path: string) =>
  path.split("/").slice(-1)[0].replace(".stories.tsx", "");

describe("story args never contain React elements (Storybook-serializable)", () => {
  for (const [path, mod] of Object.entries(modules)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const composed = composeStories(mod as any);
    const entries = Object.entries(composed) as [
      string,
      { args?: Record<string, unknown> },
    ][];
    for (const [name, story] of entries) {
      it(`${storyName(path)} › ${name}`, () => {
        const offending = Object.entries(story.args ?? {})
          .filter(([, v]) => containsElement(v))
          .map(([k]) => k);
        expect(offending).toEqual([]);
      });
    }
  }
});
