import type { Config } from "tailwindcss";

/**
 * Nucleux Tailwind preset.
 *
 * Consumers add this to their own `tailwind.config` so the design tokens
 * (colors, radii, animations) used by Nucleux components resolve correctly:
 *
 * ```ts
 * import nucleux from "nucleux/preset";
 * export default { presets: [nucleux], content: [...] };
 * ```
 *
 * The token *values* are defined as CSS variables in `nucleux/styles.css`
 * so themes can be overridden at runtime (light/dark, brand colors, etc.).
 */
const preset: Config = {
  content: [],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--nx-border))",
        input: "hsl(var(--nx-input))",
        ring: "hsl(var(--nx-ring))",
        background: "hsl(var(--nx-background))",
        foreground: "hsl(var(--nx-foreground))",
        primary: {
          DEFAULT: "hsl(var(--nx-primary))",
          foreground: "hsl(var(--nx-primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--nx-muted))",
          foreground: "hsl(var(--nx-muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--nx-accent))",
          foreground: "hsl(var(--nx-accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--nx-destructive))",
          foreground: "hsl(var(--nx-destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--nx-success))",
          foreground: "hsl(var(--nx-success-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--nx-radius)",
        md: "calc(var(--nx-radius) - 2px)",
        sm: "calc(var(--nx-radius) - 4px)",
      },
      keyframes: {
        "nx-caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "nx-typing": {
          "0%,60%,100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-3px)", opacity: "1" },
        },
        "nx-fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "nx-caret-blink": "nx-caret-blink 1.1s steps(1) infinite",
        "nx-typing": "nx-typing 1.2s ease-in-out infinite",
        "nx-fade-in": "nx-fade-in 0.2s ease-out",
      },
    },
  },
};

export default preset;
