import type { Meta, StoryObj } from "@storybook/react";
import { AiDisclosure, AiCaveat } from "./index";

const meta = {
  title: "Agent/AiDisclosure",
  component: AiDisclosure,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof AiDisclosure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="flex w-[26rem] flex-col items-start gap-3">
      <AiDisclosure variant="pill" />
      <AiDisclosure variant="badge" />
      <AiDisclosure variant="banner" />
      <AiCaveat />
    </div>
  ),
};
