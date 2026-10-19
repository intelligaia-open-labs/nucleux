import * as React from "react";
import { CircleCheck, Info, Loader2, OctagonX, TriangleAlert } from "lucide-react";
import { Toaster as Sonner, toast, type ToasterProps as SonnerToasterProps } from "sonner";

export type ToasterProps = SonnerToasterProps;

/**
 * Toast notifications from the `sonner` library, styled with Nucleux tokens.
 * Render `<Toaster />` once at the app root, then call `toast("Saved")`,
 * `toast.success(…)`, `toast.error(…)`, `toast.promise(…)` from anywhere.
 * Colors follow the `--nx-*` variables, so light and dark mode come from the
 * theme; pass `theme` only to change sonner's own rich colors.
 */
export const Toaster = ({ theme = "system", style, ...props }: ToasterProps) => (
  <Sonner
    theme={theme}
    className="toaster group"
    icons={{
      success: <CircleCheck className="size-4" />,
      info: <Info className="size-4" />,
      warning: <TriangleAlert className="size-4" />,
      error: <OctagonX className="size-4" />,
      loading: <Loader2 className="size-4 animate-spin" />,
    }}
    style={
      {
        "--normal-bg": "hsl(var(--nx-background))",
        "--normal-text": "hsl(var(--nx-foreground))",
        "--normal-border": "hsl(var(--nx-border))",
        "--border-radius": "var(--nx-radius)",
        ...style,
      } as React.CSSProperties
    }
    {...props}
  />
);
Toaster.displayName = "Toaster";

export { toast };
