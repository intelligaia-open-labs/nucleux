import type { Meta, StoryObj } from "@storybook/react";
import { Mail, FileText, Database, CheckCircle2 } from "lucide-react";
import { ActivityLog, ActivityLogItem } from "./index";

const meta = {
  title: "Agent/ActivityLog",
  component: ActivityLog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-96"><Story /></div>],
} satisfies Meta<typeof ActivityLog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ActivityLog heading="Agent footprints">
      <ActivityLogItem icon={<Mail />} time="2m ago">
        Sent email to <span className="font-medium">Sam Rivera</span>
      </ActivityLogItem>
      <ActivityLogItem icon={<Database />} time="3m ago">
        Read 3 CRM records
      </ActivityLogItem>
      <ActivityLogItem icon={<FileText />} time="4m ago">
        Created Linear issue ENG-412
      </ActivityLogItem>
      <ActivityLogItem icon={<CheckCircle2 />} time="4m ago">
        Marked task complete
      </ActivityLogItem>
    </ActivityLog>
  ),
};
