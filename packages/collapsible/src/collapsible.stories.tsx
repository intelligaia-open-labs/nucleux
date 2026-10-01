import type { Meta, StoryObj } from "@storybook/react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./index";

const meta = {
  title: "Primitives/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Collapsible className="w-72 rounded-md border border-border p-3">
      <CollapsibleTrigger>What can this assistant do?</CollapsibleTrigger>
      <CollapsibleContent>
        It can read your files, draft messages, and take actions with your approval.
      </CollapsibleContent>
    </Collapsible>
  ),
};
