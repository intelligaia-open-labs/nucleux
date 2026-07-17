import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@nucleux/utils";
import { useCopyToClipboard } from "@nucleux/hooks";

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The raw source code to display. */
  code: string;
  /** Language label shown in the header (e.g. "ts", "python"). */
  language?: string;
  /** Hide the copy button. */
  hideCopy?: boolean;
}

/**
 * A code surface with a language label and copy-to-clipboard button. Syntax
 * highlighting is intentionally left to the consumer (bring your own
 * highlighter such as Shiki) so the library stays dependency-light.
 */
export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ code, language, hideCopy = false, className, ...props }, ref) => {
    const { copied, copy } = useCopyToClipboard();
    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-md border border-border bg-muted/40 text-sm",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
          <span className="font-mono text-xs text-muted-foreground">
            {language ?? "text"}
          </span>
          {!hideCopy && (
            <button
              type="button"
              onClick={() => void copy(code)}
              aria-label={copied ? "Copied" : "Copy code"}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <pre className="overflow-x-auto p-3">
          <code className="font-mono text-[13px] leading-relaxed text-foreground">
            {code}
          </code>
        </pre>
      </div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";
