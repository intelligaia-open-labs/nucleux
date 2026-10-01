import type { Meta, StoryObj } from "@storybook/react";
import { AudioMessage } from "./index";

const meta = {
  title: "Agent/AudioMessage",
  component: AudioMessage,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[26rem]"><Story /></div>],
  args: { duration: "0:42", onPlayToggle: () => {} },
} satisfies Meta<typeof AudioMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Paused: Story = { args: { playing: false } };
export const Playing: Story = {
  args: {
    playing: true,
    transcript: "Here's a quick summary of the three renewal risks I found this quarter…",
  },
};
