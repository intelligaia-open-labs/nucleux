import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import "../packages/tokens/src/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    backgrounds: { disable: true },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

// Storybook's `inferControls` gives an "object" control (a "Set object" button)
// to every prop it can't map to a primitive/enum — React.ReactNode (heading,
// title, icon, children, actions, …), arrays/objects, unions (`FeedbackRating |
// null`), aliased types (`FollowUpAssumption`), and props with no docgen type at
// all (a button's `type`). Clicking "Set object" sets the arg to `{}`, which the
// component renders as a child → React error #31 ("Objects are not valid as a
// React child, found: object with keys {}").
//
// `inferControls` runs in a later phase we can't reliably run after, but it does
// respect a `control` we set here first. So rather than trying to catch every
// object control after the fact, we allow-list the provably-safe primitive types
// and disable the control for everything else. Runs library-wide — no per-
// component setup needed to stay crash-safe.
type ArgType = {
  control?: unknown;
  type?: { name?: string };
} & Record<string, unknown>;

// docgen `type.name`s that map to a safe, non-object control (boolean toggle,
// number/range, text input, enum select/radio).
const SAFE_TYPE_NAMES = new Set(["boolean", "number", "string", "enum"]);
// control types that are already safe (e.g. a story set `control: "text"`).
const SAFE_CONTROL_TYPES = new Set([
  "boolean",
  "number",
  "range",
  "text",
  "color",
  "date",
  "select",
  "radio",
  "inline-radio",
  "multi-select",
  "check",
  "inline-check",
]);

const shouldDisable = (argType: ArgType): boolean => {
  const control = argType?.control;
  // Already disabled (e.g. a per-story `control: false`) → leave as-is.
  if (
    control === false ||
    (typeof control === "object" &&
      control !== null &&
      (control as { disable?: unknown }).disable)
  ) {
    return false;
  }
  // An explicitly-set safe control (string form or `{ type }` form) → keep it.
  const controlType =
    typeof control === "object" && control !== null
      ? (control as { type?: unknown }).type
      : control;
  if (typeof controlType === "string" && SAFE_CONTROL_TYPES.has(controlType)) {
    return false;
  }
  // Otherwise keep only the provably-safe primitive types; disable the rest
  // (object, array, union, aliased/other, or untyped — all crash vectors).
  const typeName = argType?.type?.name;
  return !(typeof typeName === "string" && SAFE_TYPE_NAMES.has(typeName));
};

export const argTypesEnhancers = [
  (context: { argTypes?: Record<string, ArgType> }) => {
    const argTypes = context.argTypes ?? {};
    const next: Record<string, ArgType> = {};
    for (const [name, argType] of Object.entries(argTypes)) {
      next[name] = shouldDisable(argType)
        ? { ...argType, control: false }
        : argType;
    }
    return next;
  },
];

export default preview;
