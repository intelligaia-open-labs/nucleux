import type { Meta, StoryObj } from "@storybook/react";
import { PromptEnhancer } from "./index";

const meta = {
  title: "Agent/PromptEnhancer",
  component: PromptEnhancer,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[32rem]"><Story /></div>],
  args: {
    suggestions: ["Make it professional", "Convert to bullet points", "Make longer"],
    onEnhance: () => {},
    onSelect: () => {},
  },
} satisfies Meta<typeof PromptEnhancer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
