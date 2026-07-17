import * as React from "react";
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@nucleux/utils";

export type ToastVariant = "default" | "success" | "warning" | "destructive" | "info";

const iconFor: Record<Exclude<ToastVariant, "default">, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  warning: TriangleAlert,
  destructive: CircleAlert,
  info: Info,
};

const iconColor: Record<ToastVariant, string> = {
  default: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-info",
};

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: ToastVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Renders a close button that calls this handler. */
  onClose?: () => void;
}

/** A single toast notification surface. Usually rendered by {@link ToastProvider}. */
export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ variant = "default", title, description, onClose, className, children, ...props }, ref) => {
    const Icon = variant === "default" ? null : iconFor[variant];
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border bg-background p-4 shadow-lg animate-nx-fade-in",
          className,
        )}
        {...props}
      >
        {Icon && <Icon className={cn("mt-0.5 size-4 shrink-0", iconColor[variant])} />}
        <div className="min-w-0 flex-1 space-y-1">
          {title && <p className="text-sm font-medium text-foreground">{title}</p>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          {children}
        </div>
        {onClose && (
          <button
            type="button"
            aria-label="Dismiss"
            onClick={onClose}
            className="-mr-1 -mt-1 shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    );
  },
);
Toast.displayName = "Toast";

// ---- Provider + hook -------------------------------------------------------

export interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms (default 5000). Pass 0 to disable. */
  duration?: number;
}

interface ToastEntry extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

/** Access the toast API. Must be used within a {@link ToastProvider}. */
export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Viewport placement. */
  placement?: "top" | "bottom";
}

/** Provides the toast API and renders a stacked viewport for queued toasts. */
export function ToastProvider({ children, placement = "bottom" }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastEntry[]>([]);
  const counter = React.useRef(0);
  const timers = React.useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { ...options, id }]);
      const duration = options.duration ?? 5000;
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  React.useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className={cn(
          "pointer-events-none fixed right-4 z-[100] flex w-full max-w-sm flex-col gap-2",
          placement === "top" ? "top-4" : "bottom-4",
        )}
      >
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            title={t.title}
            description={t.description}
            onClose={() => dismiss(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
