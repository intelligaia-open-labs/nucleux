import type { Meta, StoryObj } from "@storybook/react";
import { Disclosure } from "./index";

const meta = {
  title: "Agent/Disclosure",
  component: Disclosure,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Disclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="flex w-[26rem] flex-col items-start gap-3">
      <Disclosure variant="pill" />
      <Disclosure variant="badge" />
      <Disclosure variant="banner" />
    </div>
  ),
};
