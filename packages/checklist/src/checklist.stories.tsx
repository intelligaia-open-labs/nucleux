import type { Meta, StoryObj } from "@storybook/react";
import { Checklist, ChecklistItem } from "./index";
import { Button } from "@nucleux/button";

const meta = {
  title: "Patterns/Checklist",
  component: Checklist,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Checklist>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstWinPlan: Story = {
  render: () => (
    <Checklist className="w-[24rem] rounded-xl border border-border">
      <ChecklistItem
        done
        title="Capture your first meeting"
        description="Upload or record — your first AI summary in under a minute."
      />
      <ChecklistItem
        title="Connect Google Calendar"
        description="Let AI discover, join, and summarize meetings."
        action={
          <Button variant="cta" size="sm">
            Connect
          </Button>
        }
      />
      <ChecklistItem
        title="Invite a teammate"
        description="Keep everyone aligned on decisions and next steps."
        action={
          <Button variant="secondary" size="sm">
            Invite
          </Button>
        }
      />
    </Checklist>
  ),
};
