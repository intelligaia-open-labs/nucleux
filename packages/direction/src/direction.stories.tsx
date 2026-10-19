import type { Meta, StoryObj } from "@storybook/react";
import { DirectionProvider, useDirection, type Direction } from "./index";

function DirectionAwareCard({ title, body }: { title: string; body: string }) {
  const dir = useDirection();
  return (
    <div dir={dir} className="w-80 rounded-lg border border-border bg-background p-4 text-foreground">
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>dir=&quot;{dir}&quot;</span>
        <span aria-hidden="true">{dir === "rtl" ? "←" : "→"}</span>
      </div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

const meta = {
  title: "Primitives/Direction",
  component: DirectionProvider,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { dir: "ltr" as Direction },
} satisfies Meta<typeof DirectionProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DirectionProvider {...args}>
      <DirectionAwareCard title="Welcome back" body="Your assistant finished three tasks while you were away." />
    </DirectionProvider>
  ),
};

export const LtrAndRtl: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <DirectionProvider dir="ltr">
        <DirectionAwareCard title="Welcome back" body="Your assistant finished three tasks while you were away." />
      </DirectionProvider>
      <DirectionProvider dir="rtl">
        <DirectionAwareCard
          title="مرحبًا بعودتك"
          body="أنهى مساعدك ثلاث مهام أثناء غيابك."
        />
      </DirectionProvider>
    </div>
  ),
};
