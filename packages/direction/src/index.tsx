import * as React from "react";

/** Reading direction: left-to-right or right-to-left. */
export type Direction = "ltr" | "rtl";

const DirectionContext = React.createContext<Direction | undefined>(undefined);

export interface DirectionProviderProps {
  /** Reading direction for everything below this provider. */
  dir?: Direction;
  /** Alias of `dir` (shadcn vocabulary); wins when both are given. */
  direction?: Direction;
  children?: React.ReactNode;
}

/**
 * Sets the reading direction ("ltr" or "rtl") for the components below it,
 * read with `useDirection()`. It renders no DOM of its own, so also set
 * `dir` on your `<html>` (or a wrapping element) for the browser's layout
 * and text flow to follow. Accepts `direction` as an alias of `dir`.
 */
export function DirectionProvider({ dir, direction, children }: DirectionProviderProps) {
  const value = direction ?? dir;
  return <DirectionContext.Provider value={value}>{children}</DirectionContext.Provider>;
}
DirectionProvider.displayName = "DirectionProvider";

/**
 * Returns the effective reading direction: `localDir` when given (a
 * component's own `dir` prop), otherwise the nearest DirectionProvider's
 * value, otherwise "ltr".
 */
export function useDirection(localDir?: Direction): Direction {
  const globalDir = React.useContext(DirectionContext);
  return localDir || globalDir || "ltr";
}
