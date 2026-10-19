import type { Meta, StoryObj } from "@storybook/react";
import { Personality } from "./index";

const meta = {
  title: "Agent/Personality",
  component: Personality,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
  args: { defaultValue: "professional", onValueChange: () => {} },
} satisfies Meta<typeof Personality>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
