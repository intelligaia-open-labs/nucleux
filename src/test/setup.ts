import "@testing-library/jest-dom/vitest";
import { afterEach, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";

// Extend expect with axe accessibility matcher.
expect.extend(toHaveNoViolations);

// jsdom doesn't implement Element.scrollTo; provide a no-op so scroll-managing
// components (e.g. Thread's auto-scroll) can mount under test.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}

// jsdom lacks matchMedia (used by embla-carousel) — provide a stub.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// jsdom lacks ResizeObserver (used by recharts' ResponsiveContainer) — stub it.
if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// jsdom lacks IntersectionObserver (used by embla-carousel) — stub it.
if (!("IntersectionObserver" in globalThis)) {
  globalThis.IntersectionObserver = class {
    root = null;
    rootMargin = "";
    thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

// Unmount React trees between tests so DOM assertions don't leak across cases.
afterEach(() => {
  cleanup();
});
