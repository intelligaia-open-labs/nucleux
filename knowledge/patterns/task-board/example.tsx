import { useState } from "react";
import { Calendar, MoreHorizontal, Plus } from "lucide-react";
import {
  Avatar,
  Badge,
  CardContainer,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nucleux/react";

export type Status = "todo" | "doing" | "review" | "done";

export interface Task {
  id: string;
  title: string;
  project: string;
  priority: "low" | "medium" | "high";
  due: string;
  overdue?: boolean;
  assignee: { name: string; initials: string };
  status: Status;
}

const COLUMNS: Array<{ id: Status; title: string }> = [
  { id: "todo", title: "To do" },
  { id: "doing", title: "In progress" },
  { id: "review", title: "In review" },
  { id: "done", title: "Done" },
];

const PRIORITY_BADGE = { low: "outline", medium: "secondary", high: "default" } as const;

const INITIAL: Task[] = [
  { id: "t1", title: "Homepage hero section", project: "Website redesign", priority: "high", due: "Oct 18", assignee: { name: "Mei Tanaka", initials: "MT" }, status: "doing" },
  { id: "t2", title: "Push notification permissions", project: "Mobile onboarding", priority: "high", due: "Oct 14", overdue: true, assignee: { name: "Luis Ortega", initials: "LO" }, status: "todo" },
  { id: "t3", title: "Invoice export", project: "Billing migration", priority: "medium", due: "Oct 25", assignee: { name: "Priya Shah", initials: "PS" }, status: "review" },
  { id: "t4", title: "Retention cohort queries", project: "Q3 analytics", priority: "low", due: "Sep 10", assignee: { name: "Sam Lee", initials: "SL" }, status: "done" },
];

/**
 * Row/card actions as a menu button. Nucleux has no dedicated menu-button
 * component: PopoverTrigger is the button (style it like a ghost IconButton
 * and give it an aria-label), PopoverContent holds a Menu. Control `open` so
 * choosing an item closes the menu.
 */
export function ActionsMenu({ label, onMove, onDelete }: {
  label: string;
  onMove: (to: Status) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const pick = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={label}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MoreHorizontal className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
        <Menu className="border-0 p-0 shadow-none">
          <MenuLabel>Move to</MenuLabel>
          {COLUMNS.map((c) => (
            <MenuItem key={c.id} onClick={pick(() => onMove(c.id))}>
              {c.title}
            </MenuItem>
          ))}
          <MenuSeparator />
          <MenuItem destructive onClick={pick(onDelete)}>
            Delete
          </MenuItem>
        </Menu>
      </PopoverContent>
    </Popover>
  );
}

/** One task. Everything a card shows is also reachable as text (no color-only status). */
export function TaskCard({ task, onMove, onDelete }: { task: Task; onMove: (to: Status) => void; onDelete: () => void }) {
  return (
    <CardContainer>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-foreground">{task.title}</h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{task.project}</p>
          </div>
          <ActionsMenu label={`Actions for ${task.title}`} onMove={onMove} onDelete={onDelete} />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={PRIORITY_BADGE[task.priority]}>{task.priority[0].toUpperCase() + task.priority.slice(1)}</Badge>
          <span className={`inline-flex items-center gap-1 whitespace-nowrap text-xs ${task.overdue ? "text-destructive" : "text-muted-foreground"}`}>
            <Calendar aria-hidden className="size-3.5" />
            {task.overdue ? `Overdue · ${task.due}` : task.due}
          </span>
          <span className="ml-auto">
            <Avatar role="user" name={task.assignee.name} initials={task.assignee.initials} />
          </span>
        </div>
      </CardContent>
    </CardContainer>
  );
}

/**
 * Kanban board: status columns of task cards in a grid that stacks on phones,
 * pairs from md and shows all four columns from 2xl. No overflow container:
 * Popover is not portaled, so a scroll container would clip the card menus.
 * Moving a task is a menu action, so the board works by keyboard without drag
 * and drop.
 */
export default function TaskBoardExample() {
  const [tasks, setTasks] = useState(INITIAL);
  const move = (id: string, to: Status) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: to } : t)));
  const remove = (id: string) => setTasks((ts) => ts.filter((t) => t.id !== id));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="sr-only">Task board</h1>
      <div className="grid items-start gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.id);
          return (
            <section
              key={col.id}
              aria-labelledby={`col-${col.id}`}
              className="flex min-w-0 flex-col gap-3 rounded-xl bg-muted/50 p-3"
            >
              <div className="flex items-center justify-between px-1">
                <h2 id={`col-${col.id}`} className="text-sm font-semibold text-foreground">
                  {col.title} <span className="font-normal text-muted-foreground">{items.length}</span>
                </h2>
                <IconButton size="sm" aria-label={`Add task to ${col.title}`}>
                  <Plus className="size-4" />
                </IconButton>
              </div>
              {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No tasks
                </p>
              ) : (
                items.map((t) => (
                  <TaskCard key={t.id} task={t} onMove={(to) => move(t.id, to)} onDelete={() => remove(t.id)} />
                ))
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
