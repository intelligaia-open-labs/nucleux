import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Calendar } from "./index";

const meta = {
  title: "Data/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>(new Date(2026, 8, 28));
    return (
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        className="rounded-md border border-border"
      />
    );
  },
};
