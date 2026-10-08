import type { Meta, StoryObj } from "@storybook/react";
import { Md3SegmentedButton, Md3SegmentedButtonItem } from "./index";

const meta = {
  title: "Material 3/SegmentedButton",
  component: Md3SegmentedButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3SegmentedButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleSelect: Story = {
  render: () => (
    <div className="bg-md-surface p-6">
      <Md3SegmentedButton type="single" defaultValue="week">
        <Md3SegmentedButtonItem value="day">Day</Md3SegmentedButtonItem>
        <Md3SegmentedButtonItem value="week">Week</Md3SegmentedButtonItem>
        <Md3SegmentedButtonItem value="month">Month</Md3SegmentedButtonItem>
      </Md3SegmentedButton>
    </div>
  ),
};
