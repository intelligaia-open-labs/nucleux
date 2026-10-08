import type { Meta, StoryObj } from "@storybook/react";
import { LoginPage } from "./login-page";
import { LoginPageShadcn } from "./login-page-shadcn";
import { LoginMui3 } from "./login-mui3";

const meta = {
  title: "Examples/Login",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Material Design 3 sign-in page composed from Nucleux md3-* components. */
export const MaterialUI3: Story = {
  render: () => <LoginPage />,
};

/** Full Material Design 3 sign-in — two-panel brand + form layout. */
export const MaterialUI3Full: Story = {
  render: () => <LoginMui3 />,
};

/** shadcn/slate sign-in page composed from Nucleux primitives. */
export const Shadcn: Story = {
  render: () => <LoginPageShadcn />,
};
