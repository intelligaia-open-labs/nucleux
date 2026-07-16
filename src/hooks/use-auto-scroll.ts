import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export interface UseAutoScrollOptions {
  /** Re-evaluate scrolling whenever this value changes (e.g. message count). */
  dependency?: unknown;
  /** Distance (px) from the bottom still considered "pinned". */
  threshold?: number;
}

/**
 * Keep a scroll container pinned to the bottom as new content streams in —
 * unless the user has scrolled up, in which case auto-scroll pauses until they
 * return to the bottom. Ideal for chat/agent transcripts.
 */
export function useAutoScroll<T extends HTMLElement = HTMLDivElement>({
  dependency,
  threshold = 48,
}: UseAutoScrollOptions = {}) {
  const ref = useRef<T>(null);
  const [pinned, setPinned] = useState(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    setPinned(true);
  }, []);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setPinned(distance <= threshold);
  }, [threshold]);

  useLayoutEffect(() => {
    if (pinned) scrollToBottom("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return { ref, pinned, scrollToBottom };
}
