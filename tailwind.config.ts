import type { Config } from "tailwindcss";
import preset from "./src/preset";

/**
 * Internal Tailwind config used to build the library's shipped stylesheet
 * (`dist/nucleux.css`) and to power Storybook. Consumers of the published
 * package use `nucleux/preset` instead — see src/preset.ts.
 */
export default {
  presets: [preset],
  content: ["./src/**/*.{ts,tsx}", "./.storybook/**/*.{ts,tsx}"],
} satisfies Config;
