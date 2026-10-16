import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  Avatar,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  CardContainer,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nucleux/react";

const project = {
  name: "Website redesign",
  description: "Refresh the marketing site with the new brand and a faster CMS.",
  status: "Active",
  owner: { name: "Dana Kim", initials: "DK" },
  due: "Nov 2, 2026",
  progress: 72,
  members: [
    { name: "Dana Kim", initials: "DK", role: "Owner" },
    { name: "Mei Tanaka", initials: "MT", role: "Designer" },
    { name: "Luis Ortega", initials: "LO", role: "Engineer" },
  ],
};

/** Label/value pairs as a description list: two columns from sm. */
function Facts({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="mt-1 text-sm text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Detail page for one record: breadcrumb back to the collection, a header with
 * status badges and the record's actions, tabs for its sections, and a
 * confirmation dialog before anything destructive.
 */
export default function DetailPageExample({ onDelete = () => undefined }: { onDelete?: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{project.name}</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>

      <PageHeader
        title={project.name}
        description={project.description}
        badges={<Badge variant="success">{project.status}</Badge>}
        actions={
          <>
            <Button variant="secondary" leftIcon={<Pencil className="size-4" />}>
              Edit
            </Button>
            <Button variant="destructive" leftIcon={<Trash2 className="size-4" />} onClick={() => setConfirmOpen(true)}>
              Delete
            </Button>
          </>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 pt-4 lg:grid-cols-3">
          <CardContainer className="lg:col-span-2">
            <CardHeader>
              <CardTitle aria-level={2}>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Facts
                items={[
                  ["Owner", project.owner.name],
                  ["Due", project.due],
                  ["Status", project.status],
                  ["Members", project.members.length],
                ]}
              />
            </CardContent>
          </CardContainer>
          <CardContainer>
            <CardHeader>
              <CardTitle aria-level={2}>Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-semibold tabular-nums text-foreground">{project.progress}%</p>
              <Progress value={project.progress} aria-label="Project progress" />
            </CardContent>
          </CardContainer>
        </TabsContent>

        <TabsContent value="members" className="pt-4">
          <CardContainer>
            <CardContent>
              <ul className="divide-y divide-border">
                {project.members.map((m) => (
                  <li key={m.name} className="flex items-center gap-3 py-3">
                    <Avatar role="user" name={m.name} initials={m.initials} />
                    <span className="flex-1 text-sm font-medium text-foreground">{m.name}</span>
                    <Badge variant="outline">{m.role}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </CardContainer>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        destructive
        title={`Delete "${project.name}"?`}
        description="Its tasks and history are deleted too. This can't be undone."
        confirmLabel="Delete project"
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete();
        }}
      />
    </div>
  );
}
