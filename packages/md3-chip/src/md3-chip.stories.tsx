import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Md3Chip } from "./index";

const meta = {
  title: "Material 3/Chip",
  component: Md3Chip,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Kinds: Story = {
  render: () => {
    const [on, setOn] = useState(true);
    return (
      <div className="flex flex-wrap items-center gap-2 bg-md-surface p-6">
        <Md3Chip variant="assist" icon={<CalendarDays />}>
          Add to calendar
        </Md3Chip>
        <Md3Chip variant="filter" selected={on} onClick={() => setOn((v) => !v)}>
          Available
        </Md3Chip>
        <Md3Chip variant="suggestion">Suggestion</Md3Chip>
        <Md3Chip variant="input" onRemove={() => {}}>
          alex@acme.com
        </Md3Chip>
      </div>
    );
  },
};
