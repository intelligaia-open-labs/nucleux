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
        info: {
          DEFAULT: "hsl(var(--nx-info))",
          foreground: "hsl(var(--nx-info-foreground))",
        },
        brand: {
          DEFAULT: "hsl(var(--nx-brand))",
          foreground: "hsl(var(--nx-brand-foreground))",
          muted: "hsl(var(--nx-brand-muted))",
        },
        destructive: {
          DEFAULT: "hsl(var(--nx-destructive))",
          foreground: "hsl(var(--nx-destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--nx-success))",
          foreground: "hsl(var(--nx-success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--nx-warning))",
          foreground: "hsl(var(--nx-warning-foreground))",
        },
        // Material Design 3 tonal roles (consumed by @nucleux/md3-* components).
        md: {
          primary: "hsl(var(--nx-md-primary))",
          "on-primary": "hsl(var(--nx-md-on-primary))",
          "primary-container": "hsl(var(--nx-md-primary-container))",
          "on-primary-container": "hsl(var(--nx-md-on-primary-container))",
          secondary: "hsl(var(--nx-md-secondary))",
          "on-secondary": "hsl(var(--nx-md-on-secondary))",
          "secondary-container": "hsl(var(--nx-md-secondary-container))",
          "on-secondary-container": "hsl(var(--nx-md-on-secondary-container))",
          tertiary: "hsl(var(--nx-md-tertiary))",
          "on-tertiary": "hsl(var(--nx-md-on-tertiary))",
          "tertiary-container": "hsl(var(--nx-md-tertiary-container))",
          "on-tertiary-container": "hsl(var(--nx-md-on-tertiary-container))",
          error: "hsl(var(--nx-md-error))",
          "on-error": "hsl(var(--nx-md-on-error))",
          "error-container": "hsl(var(--nx-md-error-container))",
          "on-error-container": "hsl(var(--nx-md-on-error-container))",
          surface: "hsl(var(--nx-md-surface))",
          "on-surface": "hsl(var(--nx-md-on-surface))",
          "surface-variant": "hsl(var(--nx-md-surface-variant))",
          "on-surface-variant": "hsl(var(--nx-md-on-surface-variant))",
          "surface-container-low": "hsl(var(--nx-md-surface-container-low))",
          "surface-container": "hsl(var(--nx-md-surface-container))",
          "surface-container-high": "hsl(var(--nx-md-surface-container-high))",
          outline: "hsl(var(--nx-md-outline))",
          "outline-variant": "hsl(var(--nx-md-outline-variant))",
          "inverse-surface": "hsl(var(--nx-md-inverse-surface))",
          "inverse-on-surface": "hsl(var(--nx-md-inverse-on-surface))",
          "inverse-primary": "hsl(var(--nx-md-inverse-primary))",
        },
      },
      borderRadius: {
        lg: "var(--nx-radius)",
        md: "calc(var(--nx-radius) - 2px)",
        sm: "calc(var(--nx-radius) - 4px)",
        // Material Design 3 shape scale.
        "md-xs": "4px",
        "md-sm": "8px",
        "md-md": "12px",
        "md-lg": "16px",
        "md-xl": "28px",
      },
      boxShadow: {
        // Material Design 3 elevation levels 1–5.
        "md-1": "0 1px 2px 0 rgb(0 0 0 / 0.30), 0 1px 3px 1px rgb(0 0 0 / 0.15)",
        "md-2": "0 1px 2px 0 rgb(0 0 0 / 0.30), 0 2px 6px 2px rgb(0 0 0 / 0.15)",
        "md-3": "0 4px 8px 3px rgb(0 0 0 / 0.15), 0 1px 3px 0 rgb(0 0 0 / 0.30)",
        "md-4": "0 6px 10px 4px rgb(0 0 0 / 0.15), 0 2px 3px 0 rgb(0 0 0 / 0.30)",
        "md-5": "0 8px 12px 6px rgb(0 0 0 / 0.15), 0 4px 4px 0 rgb(0 0 0 / 0.30)",
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
