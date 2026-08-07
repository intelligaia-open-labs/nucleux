import type { Meta, StoryObj } from "@storybook/react";
import { StructuredInput } from "./index";

const meta = {
  title: "Agent/StructuredInput",
  component: StructuredInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[26rem]"><Story /></div>],
  args: { question: "Who is this for?", options: [], onSubmit: () => {}, onSkip: () => {} },
} satisfies Meta<typeof StructuredInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleChoice: Story = {
  args: {
    question: "Which audience is this for?",
    options: [
      { value: "execs", label: "Executives" },
      { value: "eng", label: "Engineers" },
      { value: "customers", label: "Customers" },
    ],
    allowOther: true,
  },
};

export const MultiChoice: Story = {
  args: {
    question: "What should the summary include?",
    multiple: true,
    options: [
      { value: "highlights", label: "Highlights" },
      { value: "actions", label: "Action items" },
      { value: "risks", label: "Risks" },
    ],
  },
};
