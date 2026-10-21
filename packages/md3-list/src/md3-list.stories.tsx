import type { Meta, StoryObj } from "@storybook/react";
import { Inbox, Star } from "lucide-react";
import { Md3List, Md3ListItem } from "./index";

const meta = {
  title: "Material 3/List",
  component: Md3List,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-80 overflow-hidden rounded-md-md">
      <Md3List>
        <Md3ListItem interactive leading={<Inbox />} headline="Primary" supportingText="24 new messages" />
        <Md3ListItem interactive leading={<Star />} headline="Starred" supportingText="3 conversations" trailing="3" />
      </Md3List>
    </div>
  ),
};
