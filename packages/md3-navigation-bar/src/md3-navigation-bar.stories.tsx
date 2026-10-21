import type { Meta, StoryObj } from "@storybook/react";
import { Home, Search, Bell, User } from "lucide-react";
import { Md3NavigationBar, Md3NavigationBarItem } from "./index";

const meta = {
  title: "Material 3/NavigationBar",
  component: Md3NavigationBar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Md3NavigationBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Md3NavigationBar defaultValue="home">
        <Md3NavigationBarItem value="home" icon={<Home />} label="Home" />
        <Md3NavigationBarItem value="search" icon={<Search />} label="Search" />
        <Md3NavigationBarItem value="alerts" icon={<Bell />} label="Alerts" />
        <Md3NavigationBarItem value="profile" icon={<User />} label="Profile" />
      </Md3NavigationBar>
    </div>
  ),
};
