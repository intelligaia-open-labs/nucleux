import type { Meta, StoryObj } from "@storybook/react";
import { AlertTriangle, FolderOpen, RefreshCw } from "lucide-react";
import { Button } from "@nucleux/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./index";

const meta = {
  title: "Primitives/Empty",
  component: Empty,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Empty className="w-[28rem] border border-border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>Create a project to start tracking tasks.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="cta">New project</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const Error: Story = {
  render: () => (
    <Empty role="alert" className="w-[28rem] border border-border">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
          <AlertTriangle />
        </EmptyMedia>
        <EmptyTitle>Couldn&apos;t load this page</EmptyTitle>
        <EmptyDescription>The server didn&apos;t respond. Your filters are kept.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="secondary" leftIcon={<RefreshCw className="size-4" />}>
          Retry
        </Button>
      </EmptyContent>
    </Empty>
  ),
};
