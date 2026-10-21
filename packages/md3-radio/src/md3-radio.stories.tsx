import type { Meta, StoryObj } from "@storybook/react";
import { Md3Radio, Md3RadioGroup } from "./index";

const meta = {
  title: "Material 3/Radio",
  component: Md3RadioGroup,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Md3RadioGroup defaultValue="comfortable" label="Density" className="bg-md-surface p-6">
      {["compact", "comfortable", "spacious"].map((v) => (
        <label key={v} className="flex items-center gap-2 text-sm capitalize text-md-on-surface">
          <Md3Radio value={v} aria-label={v} />
          {v}
        </label>
      ))}
    </Md3RadioGroup>
  ),
};
