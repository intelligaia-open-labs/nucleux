import type { Meta, StoryObj } from "@storybook/react";
import { Attachment, AttachmentGroup } from "./index";

const meta = {
  title: "Agent/Attachment",
  component: Attachment,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { name: "attachment.pdf" },
} satisfies Meta<typeof Attachment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tray: Story = {
  render: () => (
    <AttachmentGroup>
      <Attachment name="Renewal playbook.pdf" meta="PDF · 240 KB" onRemove={() => {}} />
      <Attachment name="MSA template.docx" meta="DOCX · 88 KB" onRemove={() => {}} />
      <Attachment
        name="Screenshot.png"
        thumbnail="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%2394a3b8'/%3E%3C/svg%3E"
        onRemove={() => {}}
      />
    </AttachmentGroup>
  ),
};
