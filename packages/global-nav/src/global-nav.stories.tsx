import type { Meta, StoryObj } from "@storybook/react";
import { Bell } from "lucide-react";
import { GlobalNav } from "./index";
import { SearchInput } from "@nucleux/search-input";
import { IconButton } from "@nucleux/icon-button";
import { Avatar } from "@nucleux/avatar";

const meta = {
  title: "Navigation/GlobalNav",
  component: GlobalNav,
  parameters: { layout: "fullscreen" },
  // Slots are ReactNodes — kept out of `args` (Storybook serializes args and
  // would strip the elements) and supplied via `render`; hide their controls.
  argTypes: {
    left: { control: false },
    center: { control: false },
    right: { control: false },
  },
} satisfies Meta<typeof GlobalNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <GlobalNav
      left={<span className="text-base text-foreground">Heading</span>}
      center={<SearchInput containerClassName="w-72" />}
      right={
        <>
        <div className="relative">
          <IconButton aria-label="Notifications" size="lg">
            <Bell />
          </IconButton>
          <span className="absolute right-2 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
        </div>
          <Avatar name="Eric" className="size-8" />
        </>
      }
    />
  ),
};
