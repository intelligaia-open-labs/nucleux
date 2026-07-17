import type { Meta, StoryObj } from "@storybook/react";
import { ModularConsent } from "./index";

const meta = {
  title: "Agent/ModularConsent",
  component: ModularConsent,
  parameters: { layout: "centered" },
  args: {
    title: "Allow workspace access?",
    description: "Choose what the assistant can read or change during onboarding.",
    secondaryLabel: "Always Allow",
    allowLabel: "Allow selected",
    permissions: [
      { id: "read", label: "Read selected files", description: "Use only files attached to this setup.", defaultChecked: true },
      { id: "draft", label: "Draft edits", description: "Create suggestions without applying them.", defaultChecked: true },
      { id: "actions", label: "Run external actions", description: "Ask before connecting tools or sending data." },
    ],
  },
} satisfies Meta<typeof ModularConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
