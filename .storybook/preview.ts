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
// icon, actions, …) as an object, so Storybook infers an "object" control — a
// "Set object" button. Clicking it sets the arg to `{}`, which the component
// then renders as a child → React error #31 ("Objects are not valid as a React
// child, found: object with keys {}"). Node props aren't meaningfully JSON-
// editable anyway, so globally downgrade EVERY inferred object control to a
// disabled (read-only) one. This runs after the framework's own
// `enhanceArgTypes`, so it sees and overrides the inferred `object` control.
// Applies library-wide — no per-component argTypes needed to stay crash-safe.
type ControlArgType = { control?: unknown } & Record<string, unknown>;

const isObjectControl = (control: unknown): boolean =>
  control === "object" ||
  (typeof control === "object" &&
    control !== null &&
    (control as { type?: unknown }).type === "object");

export const argTypesEnhancers = [
  (context: { argTypes?: Record<string, ControlArgType> }) => {
    const argTypes = context.argTypes ?? {};
    const next: Record<string, ControlArgType> = {};
    for (const [name, argType] of Object.entries(argTypes)) {
      next[name] = isObjectControl(argType?.control)
        ? { ...argType, control: false }
        : argType;
    }
    return next;
  },
];

export default preview;
