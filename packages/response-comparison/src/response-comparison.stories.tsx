import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ResponseComparison } from "./index";

const meta = {
  title: "Agent/ResponseComparison",
  component: ResponseComparison,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[40rem]"><Story /></div>],
  args: { options: [] },
} satisfies Meta<typeof ResponseComparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [preferred, setPreferred] = useState<string | null>(null);
    return (
      <ResponseComparison
        value={preferred}
        onPrefer={setPreferred}
        options={[
          { id: "a", content: "Revenue grew 12% QoQ, driven by enterprise renewals and two new logos." },
          { id: "b", content: "We're up 12% this quarter — renewals held strong and we landed two big new accounts." },
        ]}
      />
    );
  },
};
