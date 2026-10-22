import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Consent, Md3ConsentDialog, Md3ConsentToggle } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const meta = {
  title: "Material 3 Agent/Md3Consent",
  component: Md3Consent,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    title: "Allow workspace access?",
    description: "Choose what the assistant can read or change during onboarding.",
    secondaryLabel: "Always Allow",
    allowLabel: "Allow selected",
    policyHref: "#privacy",
    permissions: [
      { id: "read", label: "Read selected files", description: "Use only files attached to this setup." },
      { id: "draft", label: "Draft edits", description: "Create suggestions without applying them." },
      { id: "actions", label: "Run external actions", description: "Ask before connecting tools or sending data." },
    ],
  },
} satisfies Meta<typeof Md3Consent>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** Embedded in the flow at the moment access is needed; each permission granted separately. */
export const InlineCard: Story = {};

/** A single just-in-time ask: no checklist, two equal answers. */
export const InlineJustInTime: Story = {
  args: {
    title: "Use my recent uploads to personalise replies?",
    description: "Files stay private to your workspace.",
    permissions: [],
    secondaryLabel: undefined,
    allowLabel: "Allow",
    denyLabel: "Skip",
  },
};

function BlockingModalDemo() {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <Md3Button variant="outlined" onClick={() => setOpen(true)}>
        Send first message
      </Md3Button>
      <Md3ConsentDialog
        open={open}
        onOpenChange={setOpen}
        title="Allow data to improve Aria?"
        description="Inputs never leave your tenant. You can change this anytime in Settings."
        policyHref="#privacy"
        onAllow={() => {}}
        onDeny={() => {}}
      />
    </>
  );
}

/** A centred dialog the person must answer before data first leaves the device. */
export const BlockingModal: Story = {
  render: () => <BlockingModalDemo />,
};

/** The standing control in privacy settings, once consent is no longer novel. */
export const SettingsToggle: Story = {
  render: () => (
    <div className="w-80">
      <Md3ConsentToggle
        title="Help improve Aria with my data"
        description="Anonymised. Opt out anytime."
        defaultChecked
      />
    </div>
  ),
};
