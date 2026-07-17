import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./index";

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <Tabs defaultValue="summary" className="w-[28rem]">
      <TabsList>
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="transcript">Transcript</TabsTrigger>
        <TabsTrigger value="actions">Action items</TabsTrigger>
      </TabsList>
      <TabsContent value="summary" className="text-sm text-muted-foreground">
        A concise AI summary of the meeting.
      </TabsContent>
      <TabsContent value="transcript" className="text-sm text-muted-foreground">
        The full transcript, speaker by speaker.
      </TabsContent>
      <TabsContent value="actions" className="text-sm text-muted-foreground">
        Extracted action items and owners.
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="summary" orientation="vertical" className="w-[32rem]">
      <TabsList>
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="transcript">Transcript</TabsTrigger>
        <TabsTrigger value="actions">Action items</TabsTrigger>
      </TabsList>
      <TabsContent value="summary" className="text-sm text-muted-foreground">
        A concise AI summary of the meeting.
      </TabsContent>
      <TabsContent value="transcript" className="text-sm text-muted-foreground">
        The full transcript, speaker by speaker.
      </TabsContent>
      <TabsContent value="actions" className="text-sm text-muted-foreground">
        Extracted action items and owners.
      </TabsContent>
    </Tabs>
  ),
};
