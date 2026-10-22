import type { Meta, StoryObj } from "@storybook/react";
import { SitePreview as SitePreviewDemo } from "./site-preview";
import { AgentName } from "./index";

const meta = {
  title: "Agent/AgentName",
  component: AgentName,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { name: "Aria", descriptor: "Intelligaia agent" },
} satisfies Meta<typeof AgentName>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** Just the name, in product type — for headers and brand contexts. */
export const Wordmark: Story = {
  args: { variant: "wordmark" },
};

/** The name with what the agent is doing right now — announced politely. */
export const NameStatus: Story = {
  args: { variant: "name-status", status: "drafting" },
};

/** The formal lockup of mark and name — attribution rows, message headers, signatures. */
export const NameAvatarLockup: Story = {
  args: { variant: "name-avatar-lockup" },
};

/** After a rename, the new name everywhere with "formerly" for a while. */
export const Renamed: Story = {
  args: { variant: "name-avatar-lockup", name: "Atlas", formerName: "Aria", descriptor: "Meeting Intelligence Agent" },
};
