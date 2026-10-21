import type { Meta, StoryObj } from "@storybook/react";
import { Md3LoadingIndicator } from "./index";

const meta = {
  title: "Material 3/LoadingIndicator",
  component: Md3LoadingIndicator,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { "aria-label": "Loading messages" },
  render: (args) => (
    <div className="bg-md-surface p-6">
      <Md3LoadingIndicator {...args} />
    </div>
  ),
};

export const Contained: Story = {
  args: { variant: "contained", "aria-label": "Loading messages" },
  render: (args) => (
    <div className="bg-md-surface p-6">
      <Md3LoadingIndicator {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6 bg-md-surface p-6">
      <Md3LoadingIndicator size={24} aria-label="Loading (small)" />
      <Md3LoadingIndicator aria-label="Loading (default)" />
      <Md3LoadingIndicator size={96} aria-label="Loading (large)" />
      <Md3LoadingIndicator size={24} variant="contained" aria-label="Loading (small, contained)" />
      <Md3LoadingIndicator variant="contained" aria-label="Loading (contained)" />
      <Md3LoadingIndicator size={96} variant="contained" aria-label="Loading (large, contained)" />
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="flex w-80 flex-col items-center gap-3 rounded-md-lg bg-md-surface-container-low p-8 text-md-on-surface">
      <Md3LoadingIndicator variant="contained" aria-label="Generating a reply" />
      <p className="text-sm text-md-on-surface-variant">Generating a reply…</p>
    </div>
  ),
};
