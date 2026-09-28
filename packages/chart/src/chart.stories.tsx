import type { Meta, StoryObj } from "@storybook/react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "./index";

const meta = {
  title: "Data/Chart",
  component: ChartContainer,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ChartContainer>;

export default meta;
// Loose story type: ChartContainer requires a React element child that can't be
// expressed as serializable `args`, so this story is render-only.
type Story = StoryObj;

const data = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 173, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
];

const config: ChartConfig = {
  desktop: { label: "Desktop", color: "hsl(var(--nx-info))" },
  mobile: { label: "Mobile", color: "hsl(var(--nx-brand))" },
};

export const Bars: Story = {
  render: () => (
    <div className="w-96">
      <ChartContainer config={config}>
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent config={config} />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
          <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  ),
};
