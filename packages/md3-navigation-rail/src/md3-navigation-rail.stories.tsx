import type { Meta, StoryObj } from "@storybook/react";
import { Home, Search, Bell, User } from "lucide-react";
import { Md3NavigationRail, Md3NavigationRailItem } from "./index";

const meta = {
  title: "Material 3/NavigationRail",
  component: Md3NavigationRail,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Md3NavigationRail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="h-96">
      <Md3NavigationRail defaultValue="home" className="h-full">
        <Md3NavigationRailItem value="home" icon={<Home />} label="Home" />
        <Md3NavigationRailItem value="search" icon={<Search />} label="Search" />
        <Md3NavigationRailItem value="alerts" icon={<Bell />} label="Alerts" />
        <Md3NavigationRailItem value="profile" icon={<User />} label="Profile" />
      </Md3NavigationRail>
    </div>
  ),
};
