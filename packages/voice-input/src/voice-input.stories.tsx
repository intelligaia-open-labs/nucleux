import type { Meta, StoryObj } from "@storybook/react";
import { VoiceInput } from "./index";

const meta = {
  title: "Agent/VoiceInput",
  component: VoiceInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[28rem]"><Story /></div>],
  args: { onStart: () => {}, onCancel: () => {}, onConfirm: () => {} },
} satisfies Meta<typeof VoiceInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = { args: { state: "idle" } };
export const Recording: Story = { args: { state: "recording", duration: "0:12" } };
export const Transcribing: Story = {
  args: { state: "transcribing", transcript: "Draft a follow-up email to the renewal contacts…" },
};
