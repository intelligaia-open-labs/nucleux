import type { Meta, StoryObj } from "@storybook/react";
import { MsIcon, msIconNames } from "./index";

const meta = {
  title: "Material 3/Icons",
  component: MsIcon,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { name: "star_shine" },
} satisfies Meta<typeof MsIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One glyph by name. */
export const Default: Story = {
  render: (args) => <MsIcon {...args} className="size-6 text-md-on-surface" />,
};

/** Every Material Symbol the package ships (the set nucleux.in's Material 3 previews draw). */
export const Gallery: Story = {
  render: () => (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2 font-md text-md-on-surface">
      {msIconNames.map((name) => (
        <li key={name} className="flex flex-col items-center gap-2 rounded-md-md bg-md-surface-container-low p-3">
          <MsIcon name={name} />
          <span className="break-all text-center text-xs text-md-on-surface-variant">{name}</span>
        </li>
      ))}
    </ul>
  ),
};
