import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { InputOtp } from "./index";

const meta = {
  title: "Primitives/InputOtp",
  component: InputOtp,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof InputOtp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="space-y-3 text-center">
        <InputOtp value={value} onChange={setValue} />
        <p className="text-sm text-muted-foreground">Entered: {value || "—"}</p>
      </div>
    );
  },
};
