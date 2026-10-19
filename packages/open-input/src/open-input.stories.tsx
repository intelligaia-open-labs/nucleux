import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OpenInput } from "./index";

const meta = {
  title: "Chat/OpenInput",
  component: OpenInput,
  parameters: { layout: "centered" },
} satisfies Meta<typeof OpenInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: "", onValueChange: () => {}, onSubmit: () => {} },
  render: () => {
    const [value, setValue] = useState("");
    const [log, setLog] = useState<string[]>([]);
    return (
      <div className="w-[28rem] space-y-3">
        <OpenInput
          value={value}
          onValueChange={setValue}
          onSubmit={(v) => {
            setLog((l) => [...l, v]);
            setValue("");
          }}
        />
        <ul className="space-y-1 text-sm text-muted-foreground">
          {log.map((m, i) => (
            <li key={i}>→ {m}</li>
          ))}
        </ul>
      </div>
    );
  },
};

export const Loading: Story = {
  args: { value: "", onValueChange: () => {}, onSubmit: () => {} },
  render: () => {
    const [value, setValue] = useState("Generating a response…");
    return (
      <div className="w-[28rem]">
        <OpenInput value={value} onValueChange={setValue} onSubmit={() => {}} loading onStop={() => {}} />
      </div>
    );
  },
};
