import type { Meta, StoryObj } from "@storybook/react";
import { PromptTemplate } from "./index";

const meta = {
  title: "Agent/PromptTemplate",
  component: PromptTemplate,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[34rem]"><Story /></div>],
  args: { segments: [] },
} satisfies Meta<typeof PromptTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MadLib: Story = {
  args: {
    onComplete: () => {},
    segments: [
      "Write a cold email to ",
      { slot: "company", placeholder: "Company" },
      " about their ",
      { slot: "painpoint", placeholder: "pain point" },
      ", signed off from ",
      { slot: "name", placeholder: "your name" },
      ".",
    ],
  },
};
