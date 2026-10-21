import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import {
  Button,
  DatePicker,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  NativeSelect,
  Textarea,
  ToastProvider,
  useToast,
} from "@nucleux/react";

export interface TaskDraft {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  due?: Date;
}

const EMPTY: TaskDraft = { title: "", description: "", priority: "medium" };

/**
 * Create/edit form in a Dialog: labelled fields, validation on submit with
 * inline messages, a footer with Cancel + one primary action, and a toast to
 * confirm the save. Pass `initial` to reuse the same dialog for editing.
 */
export function TaskFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: TaskDraft;
  onSave: (task: TaskDraft) => void;
}) {
  const [draft, setDraft] = useState<TaskDraft>(initial ?? EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const titleError = submitted && !draft.title.trim() ? "Give the task a title." : undefined;
  const set = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!draft.title.trim()) return;
    onSave(draft);
    setDraft(EMPTY);
    setSubmitted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-lg">
      <form noValidate onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>Tasks are visible to everyone on the project.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title" required>Title</Label>
            <Input
              id="task-title"
              value={draft.title}
              invalid={!!titleError}
              aria-describedby={titleError ? "task-title-error" : undefined}
              onChange={(e) => set("title", e.target.value)}
            />
            {titleError && <p id="task-title-error" className="text-xs text-destructive">{titleError}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              rows={3}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <NativeSelect
                id="task-priority"
                value={draft.priority}
                onChange={(e) => set("priority", e.target.value as TaskDraft["priority"])}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <DatePicker aria-label="Due date" className="w-full" value={draft.due} onValueChange={(d) => set("due", d)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="cta">
            {initial ? "Save changes" : "Create task"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function Page() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  return (
    <div className="p-6">
      <Button variant="cta" leftIcon={<Plus className="size-4" />} onClick={() => setOpen(true)}>
        New task
      </Button>
      <TaskFormDialog
        open={open}
        onOpenChange={setOpen}
        onSave={(t) => toast({ variant: "success", title: "Task created", description: t.title })}
      />
    </div>
  );
}

/** ToastProvider belongs once at the app root; it is here so the example runs alone. */
export default function FormDialogExample() {
  return (
    <ToastProvider>
      <Page />
    </ToastProvider>
  );
}
