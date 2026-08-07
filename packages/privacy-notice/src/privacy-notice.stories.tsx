import type { Meta, StoryObj } from "@storybook/react";
import { PrivacyNotice } from "./index";

const meta = {
  title: "Agent/PrivacyNotice",
  component: PrivacyNotice,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof PrivacyNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Temporary: Story = { args: { variant: "temporary" } };
export const Incognito: Story = { args: { variant: "incognito" } };
