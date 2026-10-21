import type { Meta, StoryObj } from "@storybook/react";
import { NativeSelect } from "./index";

const meta = {
  title: "Primitives/NativeSelect",
  component: NativeSelect,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <NativeSelect defaultValue="instant" aria-label="Summary speed">
      <option value="instant">Instant</option>
      <option value="balanced">Balanced</option>
      <option value="thorough">Thorough</option>
    </NativeSelect>
  ),
};
