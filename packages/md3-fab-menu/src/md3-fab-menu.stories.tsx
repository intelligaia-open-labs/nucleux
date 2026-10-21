import type { Meta, StoryObj } from "@storybook/react";
import { FileText, ImagePlus, Mail, MessageSquarePlus, Pencil, Plus, Users } from "lucide-react";
import { Md3FabMenu, Md3FabMenuItem } from "./index";

const meta = {
  title: "Material 3/FabMenu",
  component: Md3FabMenu,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { icon: null, label: "Create" },
} satisfies Meta<typeof Md3FabMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex h-[26rem] w-80 items-end justify-end bg-md-surface p-6">
      <Md3FabMenu label="Create" icon={<Plus />}>
        <Md3FabMenuItem icon={<MessageSquarePlus />}>New chat</Md3FabMenuItem>
        <Md3FabMenuItem icon={<FileText />}>New document</Md3FabMenuItem>
        <Md3FabMenuItem icon={<ImagePlus />}>Upload image</Md3FabMenuItem>
        <Md3FabMenuItem icon={<Users />}>Invite people</Md3FabMenuItem>
      </Md3FabMenu>
    </div>
  ),
};

export const Open: Story = {
  render: () => (
    <div className="flex h-[22rem] w-80 items-end justify-end bg-md-surface p-6">
      <Md3FabMenu label="Compose" icon={<Pencil />} defaultOpen>
        <Md3FabMenuItem icon={<Mail />}>Email</Md3FabMenuItem>
        <Md3FabMenuItem icon={<MessageSquarePlus />}>Message</Md3FabMenuItem>
        <Md3FabMenuItem icon={<FileText />}>Note</Md3FabMenuItem>
      </Md3FabMenu>
    </div>
  ),
};

export const ColorSets: Story = {
  render: () => (
    <div className="flex h-[20rem] items-end gap-6 bg-md-surface p-6">
      {(["primary", "secondary", "tertiary"] as const).map((color) => (
        <Md3FabMenu key={color} color={color} label={`Create (${color})`} icon={<Plus />} defaultOpen>
          <Md3FabMenuItem icon={<FileText />}>Document</Md3FabMenuItem>
          <Md3FabMenuItem icon={<ImagePlus />}>Image</Md3FabMenuItem>
        </Md3FabMenu>
      ))}
    </div>
  ),
};

export const FabSizesAndStartAlign: Story = {
  render: () => (
    <div className="flex h-[22rem] w-[36rem] items-end justify-between bg-md-surface p-6">
      <Md3FabMenu label="Create" icon={<Plus />} fabSize="small" align="start">
        <Md3FabMenuItem icon={<FileText />}>Document</Md3FabMenuItem>
        <Md3FabMenuItem icon={<ImagePlus />}>Image</Md3FabMenuItem>
      </Md3FabMenu>
      <Md3FabMenu label="Create" icon={<Plus />} fabSize="large" color="tertiary">
        <Md3FabMenuItem icon={<FileText />}>Document</Md3FabMenuItem>
        <Md3FabMenuItem icon={<ImagePlus />}>Image</Md3FabMenuItem>
      </Md3FabMenu>
    </div>
  ),
};
