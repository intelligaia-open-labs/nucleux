import type { Meta, StoryObj } from "@storybook/react";
import { Md3CircularProgress, Md3LinearProgress } from "./index";

const meta = {
  title: "Material 3/Progress",
  component: Md3LinearProgress,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3LinearProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Indicators: Story = {
  render: () => (
    <div className="w-72 space-y-6 bg-md-surface p-6">
      <Md3LinearProgress value={65} aria-label="Upload" />
      <Md3LinearProgress aria-label="Loading" />
      <div className="flex gap-6">
        <Md3CircularProgress value={70} aria-label="Sync" />
        <Md3CircularProgress aria-label="Loading" />
      </div>
    </div>
  ),
};
