import type { Meta, StoryObj } from "@storybook/react";
import { Toast, ToastProvider, useToast } from "./toast";
import { Button } from "./button";

const meta = {
  title: "Overlays/Toast",
  component: Toast,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-3">
      <Toast title="Saved" description="Your summary is ready." variant="success" onClose={() => {}} />
      <Toast title="Heads up" description="Billing will be affected." variant="warning" onClose={() => {}} />
      <Toast title="Failed" description="Could not reach the server." variant="destructive" onClose={() => {}} />
    </div>
  ),
};

function Demo() {
  const { toast } = useToast();
  return (
    <Button
      onClick={() =>
        toast({ title: "Summary ready", description: "Zuora · CPQ Q3 scope review", variant: "success" })
      }
    >
      Show toast
    </Button>
  );
}

export const WithProvider: Story = {
  render: () => (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  ),
};
