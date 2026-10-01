import type { Meta, StoryObj } from "@storybook/react";
import { Lightbulb, Zap, TriangleAlert } from "lucide-react";
import { CapabilityOverview } from "./index";

const meta = {
  title: "Agent/CapabilityOverview",
  component: CapabilityOverview,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[44rem]"><Story /></div>],
  // `sections` holds ReactNode icons/items — kept out of `args` (Storybook
  // serializes args and would strip the elements to `{}`, crashing the render)
  // and supplied via `render`; hide the docgen-inferred control.
  argTypes: { sections: { control: false } },
  // Serializable placeholder for the required `sections` prop; each story's
  // `render` supplies the real node-bearing sections.
  args: { sections: [] },
} satisfies Meta<typeof CapabilityOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <CapabilityOverview
      {...args}
      heading="Meet your assistant"
      footnote="Knowledge cutoff: January 2026. May not know recent events."
      sections={[
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
      ]}
    />
  ),
};
