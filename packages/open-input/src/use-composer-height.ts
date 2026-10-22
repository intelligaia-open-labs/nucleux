import * as React from "react";

// useLayoutEffect warns when rendered on the server; fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/** Options of {@link useComposerHeight}. */
export interface ComposerHeightOptions {
  /** The field's current text. */
  value: string;
  /** Lines the field grows to before it scrolls. */
  maxLines: number;
  /** An explicit ceiling in px; when set it replaces the `maxLines` ceiling. */
  maxHeight?: number;
  /** Auto-grow at all (false for a single-line field). */
  enabled: boolean;
  /** Offer Expand once the text overflows the ceiling. */
  expandable: boolean;
  /** Line height in px to assume when the computed style has none. */
  fallbackLineHeight?: number;
}

/** What {@link useComposerHeight} returns. */
export interface ComposerHeightState {
  /** The field currently takes most of the available height. */
  expanded: boolean;
  /** Whether the Expand / Collapse control should be shown. */
  showToggle: boolean;
  /** Expand or collapse, then return focus to the field. */
  toggle: () => void;
  /**
   * The text has wrapped past one line at some point since the field was last
   * empty. Composers use it to move the field onto its own row above the
   * controls; it only resets when the field is emptied, so the layout never
   * flips back and forth while someone types.
   */
  wrapped: boolean;
}

/**
 * The composer-height behaviour shared by the composers: the field grows with
 * its text up to `maxLines` (or `maxHeight` px) and then scrolls; once the
 * text overflows, an Expand control may be shown, and expanded the field
 * takes most of the viewport's height. Emptying the field (e.g. sending)
 * collapses it again. Without layout (no `scrollHeight`, e.g. in tests),
 * overflow is judged from the number of explicit lines.
 */
export function useComposerHeight(
  ref: React.RefObject<HTMLTextAreaElement>,
  { value, maxLines, maxHeight, enabled, expandable, fallbackLineHeight = 20 }: ComposerHeightOptions,
): ComposerHeightState {
  const [expandedState, setExpanded] = React.useState(false);
  const [overflows, setOverflows] = React.useState(false);
  const [viewport, setViewport] = React.useState(0);
  const [wrappedState, setWrapped] = React.useState(false);

  const empty = value.trim().length === 0;
  const expanded = expandedState && enabled && expandable && !empty;
  const wrapped = wrappedState && enabled && !empty;

  // Sending empties the field, and an empty request has nothing to expand.
  React.useEffect(() => {
    if (empty && expandedState) setExpanded(false);
  }, [empty, expandedState]);

  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const onResize = () => setViewport(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [enabled]);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const cs = typeof window !== "undefined" ? window.getComputedStyle(el) : null;
    const lh = (cs && parseFloat(cs.lineHeight)) || fallbackLineHeight;
    const pad = cs ? (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0) : 0;
    const lines = Math.max(1, Math.floor(maxLines));
    const cap = maxHeight ?? Math.round(lines * lh + pad);

    el.style.maxHeight = "none";
    el.style.height = "auto";
    const natural = el.scrollHeight;
    const over = natural ? natural > cap + 1 : value.split("\n").length > lines;
    setOverflows(over);
    const wraps = value.includes("\n") || (natural > 0 && natural > lh * 1.5 + pad);
    setWrapped((w) => (value.trim().length === 0 ? false : w || wraps));

    if (expanded) {
      const vh = typeof window !== "undefined" ? window.innerHeight : 0;
      const big = Math.max(cap + 2 * lh, Math.round(vh * 0.62));
      el.style.height = `${big}px`;
    } else {
      el.style.maxHeight = `${cap}px`;
      el.style.height = `${Math.min(natural, cap)}px`;
    }
  }, [value, maxLines, maxHeight, enabled, expanded, viewport, fallbackLineHeight]);

  const toggle = React.useCallback(() => {
    setExpanded((x) => !x);
    ref.current?.focus({ preventScroll: true });
  }, [ref]);

  return {
    expanded,
    showToggle: enabled && expandable && !empty && (expanded || overflows),
    toggle,
    wrapped,
  };
}
