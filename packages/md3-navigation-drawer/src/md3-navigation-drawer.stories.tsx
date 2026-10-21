import type { Meta, StoryObj } from "@storybook/react";
import { Inbox, Send, Star, Trash2 } from "lucide-react";
import { Md3NavigationDrawer, Md3NavigationDrawerItem, Md3NavigationDrawerSection } from "./index";

const meta = {
  title: "Material 3/NavigationDrawer",
  component: Md3NavigationDrawer,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3NavigationDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="bg-md-surface p-6">
      <Md3NavigationDrawer defaultValue="inbox">
        <Md3NavigationDrawerSection>Mail</Md3NavigationDrawerSection>
        <Md3NavigationDrawerItem value="inbox" icon={<Inbox />} trailing="24">
          Inbox
        </Md3NavigationDrawerItem>
        <Md3NavigationDrawerItem value="starred" icon={<Star />}>
          Starred
        </Md3NavigationDrawerItem>
        <Md3NavigationDrawerItem value="sent" icon={<Send />}>
          Sent
        </Md3NavigationDrawerItem>
        <Md3NavigationDrawerItem value="trash" icon={<Trash2 />}>
          Trash
        </Md3NavigationDrawerItem>
      </Md3NavigationDrawer>
    </div>
  ),
};
