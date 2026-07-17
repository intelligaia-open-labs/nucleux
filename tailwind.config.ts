import type { Config } from "tailwindcss";
import preset from "./packages/tokens/src/preset";

/**
 * Root Tailwind config — powers Storybook by scanning every package's source
 * and applying the shipped `@nucleux/tokens` preset. Consumers of the published
 * packages use `@nucleux/tokens/preset` instead.
 */
export default {
  presets: [preset],
  content: ["./packages/*/src/**/*.{ts,tsx}", "./.storybook/**/*.{ts,tsx}"],
} satisfies Config;
