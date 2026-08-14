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

// react-docgen types every `React.ReactNode` prop (heading, title, children,
// icon, actions, …) as an object, so Storybook's `inferControls` gives it an
// "object" control — a "Set object" button. Clicking it sets the arg to `{}`,
// which the component then renders as a child → React error #31 ("Objects are
// not valid as a React child, found: object with keys {}"). The same is true
// for array/object data props. None of these are meaningfully JSON-editable, so
// globally disable their controls.
//
// `inferControls` defaults ANY type it can't map to a primitive/enum control
// (unions, aliased types, ReactNode, arrays, or props with no docgen type at
// all — e.g. `type` on a button) to an object control, so type-sniffing can't
// catch them all. Instead we run in the SECOND enhancer pass (`secondPass`),
// i.e. AFTER `inferControls`, and disable whatever ended up an object control.
// The type checks below stay as a belt-and-suspenders first line. Applies
// library-wide, no per-component setup.
type ArgType = {
  control?: unknown;
  type?: { name?: string; raw?: string; value?: unknown };
  table?: { type?: { summary?: string } };
} & Record<string, unknown>;

// ReactNode / ReactElement / JSX.Element etc. — docgen reports these as
// type.name "other" with the raw type in `raw`/`table.type.summary`.
const NODE_TYPE_RE = /React\.?Node|React\.?Element|ReactChild|ReactPortal|JSX\.Element|ElementType/i;

const isObjectControl = (control: unknown): boolean =>
  control === "object" ||
  (typeof control === "object" &&
    control !== null &&
    (control as { type?: unknown }).type === "object");

const shouldDisable = (argType: ArgType): boolean => {
  if (isObjectControl(argType?.control)) return true;
  const typeName = argType?.type?.name;
  if (typeName === "object" || typeName === "array") return true;
  const summary = String(
    argType?.table?.type?.summary ??
      argType?.type?.raw ??
      argType?.type?.value ??
      "",
  );
  return NODE_TYPE_RE.test(summary);
};

const disableObjectControls = (context: {
  argTypes?: Record<string, ArgType>;
}) => {
  const argTypes = context.argTypes ?? {};
  const next: Record<string, ArgType> = {};
  for (const [name, argType] of Object.entries(argTypes)) {
    next[name] = shouldDisable(argType)
      ? { ...argType, control: false }
      : argType;
  }
  return next;
};
// Run in the second pass, after Storybook's own `inferControls`, so `control`
// is fully computed and we can disable every object control it produced.
disableObjectControls.secondPass = true;

export const argTypesEnhancers = [disableObjectControls];

export default preview;
