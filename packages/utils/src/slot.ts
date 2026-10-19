import * as React from "react";
import { cn } from "./utils";

type AnyProps = Record<string, unknown>;

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

/**
 * Renders its single child element instead of its own, merging props onto it:
 * classes are combined with `cn`, event handlers both run (child first, then
 * ours unless the child called `preventDefault`), and refs are joined. This is
 * what `asChild` uses, e.g. `<Button asChild><a href="/docs">Docs</a></Button>`.
 */
export const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }>(
  ({ children, ...slotProps }, ref) => {
    if (!React.isValidElement(children)) return null;
    const child = children as React.ReactElement<AnyProps> & { ref?: React.Ref<HTMLElement> };
    const childProps = child.props;
    const merged: AnyProps = { ...slotProps, ...childProps };
    for (const key of Object.keys(slotProps)) {
      const ours = (slotProps as AnyProps)[key];
      const theirs = childProps[key];
      if (/^on[A-Z]/.test(key) && typeof ours === "function" && typeof theirs === "function") {
        merged[key] = (event: { defaultPrevented?: boolean }, ...rest: unknown[]) => {
          (theirs as (...a: unknown[]) => void)(event, ...rest);
          if (!event?.defaultPrevented) (ours as (...a: unknown[]) => void)(event, ...rest);
        };
      } else if (key === "className") {
        merged.className = cn(ours as string, theirs as string);
      } else if (key === "style") {
        merged.style = { ...(ours as object), ...(theirs as object) };
      }
    }
    // React 19 exposes the ref as a prop; React 18 on the element.
    const childRef = (childProps.ref as React.Ref<HTMLElement> | undefined) ?? child.ref;
    merged.ref = mergeRefs(ref, childRef);
    return React.cloneElement(child, merged);
  },
);
Slot.displayName = "Slot";
