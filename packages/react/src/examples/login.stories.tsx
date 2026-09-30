import type { Meta, StoryObj } from "@storybook/react";
import { LoginPage } from "./login-page";

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
