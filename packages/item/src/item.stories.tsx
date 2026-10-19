import { Fragment } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BadgeCheck, ChevronRight, FileText, ShieldAlert } from "lucide-react";
import { Button } from "@nucleux/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "./index";

const meta = {
  title: "Primitives/Item",
  component: Item,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { variant: "outline", size: "default" },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Item {...args} className="w-[28rem]">
      <ItemMedia variant="icon">
        <ShieldAlert />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Security alert</ItemTitle>
        <ItemDescription>New sign-in from Chrome on macOS in Berlin.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="secondary" size="sm">Review</Button>
      </ItemActions>
    </Item>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-[28rem] flex-col gap-4">
      {(["default", "outline", "muted"] as const).map((variant) => (
        <Item key={variant} variant={variant}>
          <ItemContent>
            <ItemTitle>{variant} item</ItemTitle>
            <ItemDescription>Transparent, bordered or softly filled.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="secondary" size="sm">Open</Button>
          </ItemActions>
        </Item>
      ))}
    </div>
  ),
};

export const AsLink: Story = {
  render: () => (
    <Item asChild variant="outline" size="sm" className="w-[28rem]">
      <a href="#profile">
        <ItemMedia>
          <BadgeCheck className="size-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Your profile has been verified.</ItemTitle>
        </ItemContent>
        <ItemActions>
          <ChevronRight className="size-4" />
        </ItemActions>
      </a>
    </Item>
  ),
};

export const Group: Story = {
  render: () => (
    <ItemGroup className="w-[28rem] rounded-md border border-border">
      {["Q3 planning notes", "Model eval results", "Onboarding checklist"].map((name, i) => (
        <Fragment key={name}>
          {i > 0 && <ItemSeparator />}
          <Item size="sm">
            <ItemMedia variant="icon">
              <FileText />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{name}</ItemTitle>
              <ItemDescription>Edited {i + 2} hours ago</ItemDescription>
            </ItemContent>
            <ItemFooter className="basis-auto">
              <Button variant="ghost" size="sm">Open</Button>
            </ItemFooter>
          </Item>
        </Fragment>
      ))}
    </ItemGroup>
  ),
};
