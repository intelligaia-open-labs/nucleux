import type { Meta, StoryObj } from "@storybook/react";
import { Lightbulb, Zap, TriangleAlert } from "lucide-react";
import { CapabilityOverview } from "./index";

const meta = {
  title: "Agent/CapabilityOverview",
  component: CapabilityOverview,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[44rem]"><Story /></div>],
  args: { sections: [] },
} satisfies Meta<typeof CapabilityOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    heading: "Meet your assistant",
    footnote: "Knowledge cutoff: January 2026. May not know recent events.",
    sections: [
      {
        title: "Examples",
        icon: <Lightbulb />,
        items: ['"Summarize this contract"', '"Draft a renewal email"', '"Compare these two vendors"'],
      },
      {
        title: "Capabilities",
        icon: <Zap />,
        items: ["Reads your attached files", "Remembers context in a chat", "Cites the sources it uses"],
      },
      {
        title: "Limits",
        icon: <TriangleAlert />,
        items: ["May occasionally be wrong", "Can't access the live web by default", "Won't act without approval"],
      },
    ],
  },
};
