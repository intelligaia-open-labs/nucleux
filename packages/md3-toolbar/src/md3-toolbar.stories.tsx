import type { Meta, StoryObj } from "@storybook/react";
import { Bold, Bookmark, Download, Highlighter, Italic, Pencil, Share2, Strikethrough, Underline } from "lucide-react";
import { Md3Toolbar, Md3ToolbarIconButton } from "./index";

const meta = {
  title: "Material 3/Toolbar",
  component: Md3Toolbar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Docked: Story = {
  render: () => (
    <div className="w-[412px] bg-md-surface">
      <div className="h-40 p-4 text-md-on-surface">Article content…</div>
      <Md3Toolbar type="docked" aria-label="Article actions">
        <Md3ToolbarIconButton aria-label="Bookmark">
          <Bookmark />
        </Md3ToolbarIconButton>
        <Md3ToolbarIconButton aria-label="Share">
          <Share2 />
        </Md3ToolbarIconButton>
        <Md3ToolbarIconButton aria-label="Download">
          <Download />
        </Md3ToolbarIconButton>
        <Md3ToolbarIconButton aria-label="Edit">
          <Pencil />
        </Md3ToolbarIconButton>
      </Md3Toolbar>
    </div>
  ),
};

export const DockedVibrant: Story = {
  render: () => (
    <div className="w-[412px] bg-md-surface">
      <Md3Toolbar type="docked" color="vibrant" aria-label="Article actions">
        <Md3ToolbarIconButton aria-label="Bookmark" selected>
          <Bookmark />
        </Md3ToolbarIconButton>
        <Md3ToolbarIconButton aria-label="Share">
          <Share2 />
        </Md3ToolbarIconButton>
        <Md3ToolbarIconButton aria-label="Download">
          <Download />
        </Md3ToolbarIconButton>
      </Md3Toolbar>
    </div>
  ),
};

const formatting = (
  <>
    <Md3ToolbarIconButton aria-label="Bold" selected>
      <Bold />
    </Md3ToolbarIconButton>
    <Md3ToolbarIconButton aria-label="Italic">
      <Italic />
    </Md3ToolbarIconButton>
    <Md3ToolbarIconButton aria-label="Underline">
      <Underline />
    </Md3ToolbarIconButton>
    <Md3ToolbarIconButton aria-label="Strikethrough">
      <Strikethrough />
    </Md3ToolbarIconButton>
    <Md3ToolbarIconButton aria-label="Highlight">
      <Highlighter />
    </Md3ToolbarIconButton>
  </>
);

export const Floating: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-6 bg-md-surface p-6">
      <Md3Toolbar type="floating" aria-label="Text formatting">
        {formatting}
      </Md3Toolbar>
      <Md3Toolbar type="floating" color="vibrant" aria-label="Text formatting (vibrant)">
        {formatting}
      </Md3Toolbar>
    </div>
  ),
};

export const FloatingVertical: Story = {
  render: () => (
    <div className="flex gap-6 bg-md-surface p-6">
      <Md3Toolbar type="floating" orientation="vertical" aria-label="Text formatting">
        {formatting}
      </Md3Toolbar>
      <Md3Toolbar type="floating" orientation="vertical" color="vibrant" aria-label="Text formatting (vibrant)">
        {formatting}
      </Md3Toolbar>
    </div>
  ),
};
