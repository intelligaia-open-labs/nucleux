import type { Meta, StoryObj } from "@storybook/react";
import { Command } from "lucide-react";
import { Kbd, KbdGroup } from "./index";

const meta = {
  title: "Primitives/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Esc" },
};

export const Shortcut: Story = {
  render: () => (
    <p className="text-sm text-muted-foreground">
      Open the command palette with{" "}
      <KbdGroup>
        <Kbd>
          <Command />
        </Kbd>
        <span>+</span>
        <Kbd>K</Kbd>
      </KbdGroup>
      , or press <Kbd>/</Kbd> to search.
    </p>
  ),
};
