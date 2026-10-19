import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@nucleux/button";
import { Spinner } from "./index";

const meta = {
  title: "Primitives/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 text-muted-foreground">
      <Spinner className="size-3" />
      <Spinner />
      <Spinner className="size-6" />
      <Spinner className="size-8 text-info" />
    </div>
  ),
};

export const InButton: Story = {
  render: () => (
    <Button disabled leftIcon={<Spinner aria-label="Saving" />}>
      Saving changes
    </Button>
  ),
};
