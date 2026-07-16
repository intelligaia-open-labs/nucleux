import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Radio, RadioGroup } from "./radio-group";

const meta = {
  title: "Primitives/RadioGroup",
  component: RadioGroup,
  parameters: { layout: "centered" },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: "instant", label: "Instant" },
  { value: "balanced", label: "Balanced" },
  { value: "thorough", label: "Thorough" },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("balanced");
    return (
      <RadioGroup value={value} onValueChange={setValue} label="Summary speed">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2 text-sm text-foreground">
            <Radio value={o.value} />
            {o.label}
          </label>
        ))}
      </RadioGroup>
    );
  },
};
