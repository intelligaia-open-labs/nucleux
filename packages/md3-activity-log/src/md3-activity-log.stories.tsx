import type { Meta, StoryObj } from "@storybook/react";
import { Md3ActivityLog, Md3ActivityLogItem } from "./index";

const meta = {
  title: "Material 3/ActivityLog",
  component: Md3ActivityLog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3ActivityLog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-80 bg-md-surface p-6">
      <Md3ActivityLog heading="Footprints">
        <Md3ActivityLogItem time="2m ago">Sent email to Sam</Md3ActivityLogItem>
        <Md3ActivityLogItem time="3m ago">Read 3 CRM records</Md3ActivityLogItem>
        <Md3ActivityLogItem time="5m ago">Created a follow-up task</Md3ActivityLogItem>
      </Md3ActivityLog>
    </div>
  ),
};
