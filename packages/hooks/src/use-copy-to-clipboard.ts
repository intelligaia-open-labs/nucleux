import { useCallback, useRef, useState } from "react";

export interface UseCopyToClipboardOptions {
  /** How long (ms) the `copied` flag stays true after a successful copy. */
  timeout?: number;
}

/**
 * Copy text to the clipboard and expose a transient `copied` flag, handy for
 * "copy" buttons on code blocks and messages.
 */
export function useCopyToClipboard({ timeout = 2000 }: UseCopyToClipboardOptions = {}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (value: string) => {
      if (typeof navigator === "undefined" || !navigator.clipboard) return false;
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), timeout);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [timeout],
  );

  return { copied, copy };
}
