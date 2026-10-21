import type { Meta, StoryObj } from "@storybook/react";
import { Archive, Copy, FileDown, Pencil, Send } from "lucide-react";
import { Md3MenuDivider, Md3MenuItem } from "@nucleux/md3-menu";
import { Md3SplitButton } from "./index";

const menu = (
  <>
    <Md3MenuItem icon={<Copy />}>Save a copy</Md3MenuItem>
    <Md3MenuItem icon={<FileDown />}>Export as PDF</Md3MenuItem>
    <Md3MenuDivider />
    <Md3MenuItem icon={<Archive />}>Archive</Md3MenuItem>
  </>
);

const meta = {
  title: "Material 3/SplitButton",
  component: Md3SplitButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  // `menu` is passed in each render: Storybook args must stay serializable (no React elements).
  args: { menu: null, menuLabel: "More save options", children: "Save" },
} satisfies Meta<typeof Md3SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Filled: Story = {
  render: (args) => (
    <div className="h-64 bg-md-surface p-6">
      <Md3SplitButton {...args} menu={menu} icon={<Pencil />} />
    </div>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex h-64 items-start gap-4 bg-md-surface p-6">
      <Md3SplitButton {...args} menu={menu} variant="filled" />
      <Md3SplitButton {...args} menu={menu} variant="tonal" />
      <Md3SplitButton {...args} menu={menu} variant="elevated" />
      <Md3SplitButton {...args} menu={menu} variant="outlined" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex h-80 items-start gap-4 bg-md-surface p-6">
      <Md3SplitButton {...args} menu={menu} size="xs" />
      <Md3SplitButton {...args} menu={menu} size="sm" />
      <Md3SplitButton {...args} menu={menu} size="md" />
      <Md3SplitButton {...args} menu={menu} size="lg" />
    </div>
  ),
};

export const IconOnly: Story = {
  render: (args) => (
    <div className="h-64 bg-md-surface p-6">
      <Md3SplitButton
        {...args}
        variant="tonal"
        icon={<Send />}
        actionLabel="Send"
        menuLabel="Send options"
        menuAlign="start"
        menu={
          <>
            <Md3MenuItem>Schedule send</Md3MenuItem>
            <Md3MenuItem>Send without notification</Md3MenuItem>
          </>
        }
      >
        {null}
      </Md3SplitButton>
    </div>
  ),
};

export const Open: Story = {
  render: (args) => (
    <div className="h-64 bg-md-surface p-6">
      <Md3SplitButton {...args} menu={menu} defaultOpen />
    </div>
  ),
};
