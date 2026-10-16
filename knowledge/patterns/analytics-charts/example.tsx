import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  CardContainer,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  PageHeader,
  Select,
  type ChartConfig,
} from "@nucleux/react";

const WEEKS = ["Aug 24", "Aug 31", "Sep 7", "Sep 14", "Sep 21", "Sep 28", "Oct 5", "Oct 12"];
const throughput = WEEKS.map((week, i) => ({ week, created: [9, 7, 11, 8, 12, 10, 9, 8][i], completed: [6, 8, 9, 10, 9, 13, 12, 10][i] }));
const workload = [
  { member: "Dana", open: 4 },
  { member: "Luis", open: 3 },
  { member: "Mei", open: 5 },
  { member: "Priya", open: 2 },
];

// Series colors are Nucleux tokens; ChartContainer exposes each as var(--color-<key>).
const throughputConfig: ChartConfig = {
  created: { label: "Created", color: "hsl(var(--nx-info))" },
  completed: { label: "Completed", color: "hsl(var(--nx-success))" },
};
const workloadConfig: ChartConfig = {
  open: { label: "Open tasks", color: "hsl(var(--nx-brand))" },
};

/** One chart per card: title says what it measures, description gives the unit/range. */
function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <CardContainer>
      <CardHeader className="flex-col items-start gap-1">
        <CardTitle aria-level={2}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </CardContainer>
  );
}

/**
 * Analytics page: a range filter, then a responsive grid of chart cards.
 * Charts use ChartContainer (Recharts underneath) with token colors, a shared
 * tooltip and legend, and a text summary for screen readers.
 */
export default function AnalyticsChartsExample() {
  const [range, setRange] = useState("8");
  const rows = throughput.slice(-Number(range));
  const done = rows.reduce((s, r) => s + r.completed, 0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Analytics"
        description="Throughput and workload across all projects."
        actions={
          <Select aria-label="Time range" value={range} onChange={(e) => setRange(e.target.value)} containerClassName="w-40">
            <option value="4">Last 4 weeks</option>
            <option value="8">Last 8 weeks</option>
          </Select>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Weekly throughput" description={`Tasks created vs completed, last ${range} weeks`}>
          <p className="sr-only">
            {done} tasks completed in the last {range} weeks; most in week of{" "}
            {rows.reduce((a, b) => (b.completed > a.completed ? b : a)).week}.
          </p>
          <ChartContainer config={throughputConfig} className="aspect-[16/9] w-full" aria-hidden>
            <LineChart data={rows} margin={{ left: 0, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent config={throughputConfig} />} />
              <ChartLegend content={<ChartLegendContent config={throughputConfig} />} />
              <Line dataKey="created" stroke="var(--color-created)" strokeWidth={2} dot={false} />
              <Line dataKey="completed" stroke="var(--color-completed)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Team workload" description="Open tasks per member">
          <p className="sr-only">
            {workload.map((w) => `${w.member}: ${w.open}`).join(", ")} open tasks.
          </p>
          <ChartContainer config={workloadConfig} className="aspect-[16/9] w-full" aria-hidden>
            <BarChart data={workload}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="member" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent config={workloadConfig} />} />
              <Bar dataKey="open" fill="var(--color-open)" radius={4} />
            </BarChart>
          </ChartContainer>
        </ChartCard>
      </div>
    </div>
  );
}
