import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Md3AgentComposer } from "./index";

const meta = {
  title: "Material 3/AgentComposer",
  component: Md3AgentComposer,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { value: "", onValueChange: () => {}, onSubmit: () => {} },
} satisfies Meta<typeof Md3AgentComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: "", onValueChange: () => {}, onSubmit: () => {} },
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-[32rem] bg-md-surface p-6">
        <Md3AgentComposer value={value} onValueChange={setValue} onSubmit={() => setValue("")} />
      </div>
    );
  },
};

const LONG_REQUEST =
  "Draft the Q3 renewal note to Acme Corp.\n\nContext:\n- Usage dipped 12% in August while their data team migrated to the new warehouse.\n- SSO shipped on 2 September; they asked for it twice in the spring.\n- Their champion, Priya, moves to the platform team next month.\n\nWhat the note should do:\n1. Thank them for the migration feedback and name the two fixes it led to.\n2. Explain the dip plainly, without spin.\n3. Offer a 30-minute call with Priya's successor before the renewal date.\n4. Keep it under 200 words, warm but direct.\n\nSign it from me, not the team.";

/**
 * A request longer than eight lines: the field stops at 8 lines and scrolls,
 * and an Expand icon button appears top-right. Expanded, the field takes most
 * of the available height; Collapse or sending brings it back.
 */
export const LongRequest: Story = {
  args: { value: LONG_REQUEST, onValueChange: () => {}, onSubmit: () => {}, maxLines: 8, expandable: true },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <div className="w-[32rem] bg-md-surface p-6">
        <Md3AgentComposer
          maxLines={args.maxLines}
          expandable={args.expandable}
          value={value}
          onValueChange={setValue}
          onSubmit={() => setValue("")}
        />
      </div>
    );
  },
};
