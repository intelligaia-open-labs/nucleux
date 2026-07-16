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

// Unmount React trees between tests so DOM assertions don't leak across cases.
afterEach(() => {
  cleanup();
});
