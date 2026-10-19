import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "@nucleux/utils";

export interface CaveatProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Leading icon. Defaults to an info glyph. Pass `null` to omit. */
  icon?: React.ReactNode;
}

/**
 * A short fallibility disclaimer shown near AI output — the standard
 * "verify before you trust" caption.
 * Source: Figma "Onboarding / Caveat".
 */
export const Caveat = React.forwardRef<HTMLParagraphElement, CaveatProps>(
  ({ icon, className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground [&_svg]:size-3.5",
        className,
      )}
      {...props}
    >
      {icon === undefined ? <Info aria-hidden="true" /> : icon}
      <span>{children ?? "AI can make mistakes. Verify important information."}</span>
    </p>
  ),
);
Caveat.displayName = "Caveat";
