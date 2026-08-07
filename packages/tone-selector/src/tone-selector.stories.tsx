import type { Meta, StoryObj } from "@storybook/react";
import { ToneSelector } from "./index";

const meta = {
  title: "Agent/ToneSelector",
  component: ToneSelector,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
  args: { defaultValue: "professional", onValueChange: () => {} },
} satisfies Meta<typeof ToneSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
