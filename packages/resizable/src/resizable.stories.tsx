import type { Meta, StoryObj } from "@storybook/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./index";

const meta = {
  title: "Primitives/Resizable",
  component: ResizablePanelGroup,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <ResizablePanelGroup className="h-48 w-96 rounded-md border border-border">
      <ResizablePanel className="grid place-items-center bg-muted/40 text-sm text-foreground">
        Sidebar
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={2} className="grid place-items-center text-sm text-foreground">
        Content
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
