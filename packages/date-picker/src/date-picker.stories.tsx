import type { Meta, StoryObj } from "@storybook/react";
import { DatePicker } from "./index";

const meta = {
  title: "Data/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="pb-80">
      <DatePicker aria-label="Deadline" placeholder="Select a deadline" />
    </div>
  ),
};
