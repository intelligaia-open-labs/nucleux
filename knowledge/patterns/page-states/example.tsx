import type { ReactNode } from "react";
import { AlertTriangle, FolderOpen, RefreshCw } from "lucide-react";
import { Button, Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, Skeleton } from "@nucleux/react";

export type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

/** Placeholder that mirrors the shape of a list while it loads. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton circle className="size-8" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Renders the right state for async data: a skeleton while loading, a
 * recoverable error with Retry, an empty state with a primary action, or the
 * content itself.
 */
export function AsyncContent<T>({
  state,
  isEmpty,
  onRetry,
  empty,
  children,
}: {
  state: LoadState<T>;
  isEmpty: (data: T) => boolean;
  onRetry: () => void;
  empty: { title: string; description: string; action?: ReactNode };
  children: (data: T) => ReactNode;
}) {
  if (state.status === "loading") return <ListSkeleton />;
  if (state.status === "error") {
    return (
      <Empty role="alert" className="border border-border">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
            <AlertTriangle />
          </EmptyMedia>
          <EmptyTitle>Couldn&apos;t load this page</EmptyTitle>
          <EmptyDescription>{state.message}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="secondary" leftIcon={<RefreshCw className="size-4" />} onClick={onRetry}>
            Retry
          </Button>
        </EmptyContent>
      </Empty>
    );
  }
  if (isEmpty(state.data)) {
    return (
      <Empty className="border border-border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpen />
          </EmptyMedia>
          <EmptyTitle>{empty.title}</EmptyTitle>
          <EmptyDescription>{empty.description}</EmptyDescription>
        </EmptyHeader>
        {empty.action && <EmptyContent>{empty.action}</EmptyContent>}
      </Empty>
    );
  }
  return <>{children(state.data)}</>;
}

export default function PageStatesExample() {
  const retry = () => undefined;
  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-6 md:grid-cols-3">
      <AsyncContent state={{ status: "loading" }} isEmpty={() => false} onRetry={retry} empty={{ title: "", description: "" }}>
        {() => null}
      </AsyncContent>
      <AsyncContent
        state={{ status: "error", message: "The server didn't respond. Your filters are kept." }}
        isEmpty={() => false}
        onRetry={retry}
        empty={{ title: "", description: "" }}
      >
        {() => null}
      </AsyncContent>
      <AsyncContent
        state={{ status: "ready", data: [] as string[] }}
        isEmpty={(d) => d.length === 0}
        onRetry={retry}
        empty={{
          title: "No projects yet",
          description: "Create a project to start tracking tasks.",
          action: <Button variant="cta">New project</Button>,
        }}
      >
        {(items) => <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>}
      </AsyncContent>
    </div>
  );
}
