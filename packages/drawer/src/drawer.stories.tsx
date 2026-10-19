import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@nucleux/button";
import { Input } from "@nucleux/input";
import { Label } from "@nucleux/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./index";

const meta = {
  title: "Primitives/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { direction: "bottom" },
  argTypes: { direction: { control: "inline-radio", options: ["bottom", "top", "left", "right"] } },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button variant="secondary">Open drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Agent budget</DrawerTitle>
            <DrawerDescription>Set how many tool calls the agent may make per run.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-2 p-4">
            <Label htmlFor="budget">Tool calls</Label>
            <Input id="budget" type="number" defaultValue={25} />
          </div>
          <DrawerFooter>
            <Button>Save</Button>
            <DrawerClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  ),
};

export const Right: Story = {
  args: { direction: "right" },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <Drawer {...args} open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="secondary">Show sources</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Sources</DrawerTitle>
            <DrawerDescription>Documents the agent cited in this answer.</DrawerDescription>
          </DrawerHeader>
          <ul className="flex flex-col gap-2 px-4 text-sm">
            <li>Q3 planning notes.pdf</li>
            <li>Roadmap 2026.md</li>
            <li>Support tickets export.csv</li>
          </ul>
          <DrawerFooter>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  },
};
