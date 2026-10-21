import type { Meta, StoryObj } from "@storybook/react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./index";

const meta = {
  title: "Primitives/NavigationMenu",
  component: NavigationMenu,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="pb-40">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#" active>
                Agent Composer
              </NavigationMenuLink>
              <NavigationMenuLink href="#">Thread</NavigationMenuLink>
              <NavigationMenuLink href="#">Tool Call</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Docs</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Pricing</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  ),
};
