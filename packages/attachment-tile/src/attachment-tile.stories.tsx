import type { Meta, StoryObj } from "@storybook/react";
import { AttachmentTile, AttachmentTray } from "./index";

const meta = {
  title: "Agent/AttachmentTile",
  component: AttachmentTile,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { name: "attachment.pdf" },
} satisfies Meta<typeof AttachmentTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tray: Story = {
  render: () => (
    <AttachmentTray>
      <AttachmentTile name="Renewal playbook.pdf" meta="PDF · 240 KB" onRemove={() => {}} />
      <AttachmentTile name="MSA template.docx" meta="DOCX · 88 KB" onRemove={() => {}} />
      <AttachmentTile
        name="Screenshot.png"
        thumbnail="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%2394a3b8'/%3E%3C/svg%3E"
        onRemove={() => {}}
      />
    </AttachmentTray>
  ),
};
