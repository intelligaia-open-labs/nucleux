import type { Meta, StoryObj } from "@storybook/react";
import { MeetingDashboardBody } from "./meeting-dashboard";

/**
 * The "Meeting dashboard" centered content (no app chrome), assembled entirely
 * from Nucleux primitives — a faithful implementation of the source Figma
 * design (AI-UX-Pattern › Body).
 */
const meta = {
  title: "Examples/Meeting Dashboard",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-background">
      <MeetingDashboardBody />
    </div>
  ),
};
