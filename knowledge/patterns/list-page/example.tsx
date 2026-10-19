import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Badge, Button, DataTable, Input, NativeSelect, type DataTableProps } from "@nucleux/react";

export type ProjectStatus = "active" | "at-risk" | "done";

export interface Project {
  id: string;
  name: string;
  owner: string;
  status: ProjectStatus;
  due: string;
}

const STATUS_BADGE: Record<ProjectStatus, { label: string; variant: "success" | "destructive" | "secondary" }> = {
  active: { label: "Active", variant: "success" },
  "at-risk": { label: "At risk", variant: "destructive" },
  done: { label: "Done", variant: "secondary" },
};

// Typed from DataTableProps so the page needs no direct @tanstack/react-table import.
const columns: DataTableProps<Project, unknown>["columns"] = [
  { accessorKey: "name", header: "Project" },
  { accessorKey: "owner", header: "Owner" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = STATUS_BADGE[row.original.status];
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
  { accessorKey: "due", header: "Due" },
];

export const SAMPLE_PROJECTS: Project[] = [
  { id: "p1", name: "Website redesign", owner: "Dana Kim", status: "active", due: "2026-11-02" },
  { id: "p2", name: "Mobile onboarding", owner: "Luis Ortega", status: "at-risk", due: "2026-10-28" },
  { id: "p3", name: "Billing migration", owner: "Priya Shah", status: "active", due: "2026-12-15" },
  { id: "p4", name: "Q3 analytics report", owner: "Sam Lee", status: "done", due: "2026-09-30" },
];

/**
 * Collection page: header with the primary action, a search + filter toolbar,
 * and a sortable, paginated table. Filtering happens before the table so the
 * table's own pagination always reflects the filtered rows.
 */
export function ProjectListPage({ projects, onCreate }: { projects: Project[]; onCreate: () => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (status === "all" || p.status === status) &&
        (!q || p.name.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q)),
    );
  }, [projects, query, status]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
<header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground">Track every project, its owner, and its delivery status.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="cta" leftIcon={<Plus className="size-4" />} onClick={onCreate}>
            New project
          </Button>
        </div>
      </header>

      <div role="search" className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          aria-label="Search projects"
          placeholder="Search by project or owner"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-sm sm:flex-1"
        />
        <NativeSelect
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | ProjectStatus)}
          containerClassName="sm:w-44"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="at-risk">At risk</option>
          <option value="done">Done</option>
        </NativeSelect>
      </div>

      <div className="overflow-x-auto">
        <DataTable columns={columns} data={rows} pageSize={10} emptyMessage="No projects match these filters." />
      </div>
    </div>
  );
}

export default function ListPageExample() {
  return <ProjectListPage projects={SAMPLE_PROJECTS} onCreate={() => undefined} />;
}
