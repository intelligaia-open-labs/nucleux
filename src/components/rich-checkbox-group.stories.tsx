import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RichCheckboxGroup, RichCheckboxOption } from "./rich-checkbox-group";

const meta = {
  title: "Primitives/RichCheckboxGroup",
  component: RichCheckboxGroup,
  parameters: { layout: "centered" },
} satisfies Meta<typeof RichCheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<Record<string, boolean>>({ summary: true });
    const set = (key: string) => (v: boolean) =>
      setSelected((prev) => ({ ...prev, [key]: v }));
    return (
      <RichCheckboxGroup label="Include in export" className="w-[22rem]">
        <RichCheckboxOption
          label="Summary"
          description="The AI-generated meeting summary."
          checked={!!selected.summary}
          onCheckedChange={set("summary")}
        />
        <RichCheckboxOption
          label="Transcript"
          description="Full speaker-by-speaker transcript."
          checked={!!selected.transcript}
          onCheckedChange={set("transcript")}
        />
        <RichCheckboxOption
          label="Action items"
          description="Extracted tasks and owners."
          checked={!!selected.actions}
          onCheckedChange={set("actions")}
        />
      </RichCheckboxGroup>
    );
  },
};
