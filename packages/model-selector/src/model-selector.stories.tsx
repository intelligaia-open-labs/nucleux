import type { Meta, StoryObj } from "@storybook/react";
import { ModelSelector } from "./index";

const meta = {
  title: "Agent/ModelSelector",
  component: ModelSelector,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    onValueChange: () => {},
    defaultValue: "5.5-instant",
    models: [
      { value: "5.5-instant", label: "Nebula 5.5 Instant", description: "Fastest — everyday tasks" },
      { value: "5.3", label: "Nebula 5.3", description: "Balanced speed and depth" },
      { value: "5.1-pro", label: "Nebula 5.1 Pro", description: "Deepest reasoning" },
    ],
  },
} satisfies Meta<typeof ModelSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
