import type { ReactNode } from "react";
import { CheckCircle2, Clock, FolderKanban, TrendingUp } from "lucide-react";
import {
  Badge,
  CardContainer,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nucleux/react";

export interface Metric {
  label: string;
  value: string;
  change: string;
  icon: ReactNode;
}

/** A single KPI tile. Keep the value short; put context in `change`. */
export function MetricCard({ label, value, change, icon }: Metric) {
  return (
    <CardContainer>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{change}</p>
        </div>
        <span aria-hidden className="text-muted-foreground [&_svg]:size-5">
          {icon}
        </span>
      </CardContent>
    </CardContainer>
  );
}

const METRICS: Metric[] = [
  { label: "Active projects", value: "12", change: "+2 this month", icon: <FolderKanban /> },
  { label: "Tasks completed", value: "248", change: "+18% vs last month", icon: <CheckCircle2 /> },
  { label: "Overdue tasks", value: "7", change: "3 due today", icon: <Clock /> },
  { label: "On-time delivery", value: "92%", change: "Up from 88%", icon: <TrendingUp /> },
];

const PROGRESS = [
  { name: "Website redesign", done: 72 },
  { name: "Mobile onboarding", done: 38 },
  { name: "Billing migration", done: 55 },
];

const ACTIVITY = [
  { who: "Dana Kim", what: "completed “Homepage hero”", when: "10 min ago", tag: "Done" },
  { who: "Luis Ortega", what: "flagged “Push permissions” as blocked", when: "1 h ago", tag: "Blocked" },
  { who: "Priya Shah", what: "opened “Invoice export”", when: "3 h ago", tag: "New" },
];

/**
 * Overview dashboard: a responsive KPI row, a progress panel and a recent
 * activity table. Each region is a card so it can be rearranged or removed.
 */
export default function DashboardOverviewExample() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Where your projects stand this week.</p>
        </div>
      </header>

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <CardContainer className="lg:col-span-1">
          <CardHeader>
            <CardTitle aria-level={2}>Project progress</CardTitle>
            <CardDescription>Share of tasks completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {PROGRESS.map((p) => (
              <div key={p.name} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{p.name}</span>
                  <span className="tabular-nums text-muted-foreground">{p.done}%</span>
                </div>
                <Progress value={p.done} size="sm" aria-label={`${p.name} progress`} />
              </div>
            ))}
          </CardContent>
        </CardContainer>

        <CardContainer className="lg:col-span-2">
          <CardHeader>
            <CardTitle aria-level={2}>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="hidden sm:table-cell">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ACTIVITY.map((a) => (
                  <TableRow key={a.what}>
                    <TableCell className="font-medium">{a.who}</TableCell>
                    <TableCell>
                      <span className="mr-2">{a.what}</span>
                      <Badge variant={a.tag === "Blocked" ? "destructive" : "secondary"}>{a.tag}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{a.when}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </CardContainer>
      </div>
    </div>
  );
}
