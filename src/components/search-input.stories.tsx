import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "./search-input";

const meta = {
  title: "Primitives/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithShortcut: Story = {
  args: {
    trailing: (
      <kbd className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
        ⌘K
      </kbd>
    ),
  },
};
