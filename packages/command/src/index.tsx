import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@nucleux/utils";

interface CommandContextValue {
  search: string;
  setSearch: (v: string) => void;
  activeValue: string | null;
  setActiveValue: (v: string | null) => void;
  listRef: React.RefObject<HTMLDivElement>;
  reportEmpty: (empty: boolean) => void;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);
const useCommand = (component: string) => {
  const ctx = React.useContext(CommandContext);
  if (!ctx) throw new Error(`${component} must be used within a Command`);
  return ctx;
};

const matches = (text: string, search: string) =>
  text.toLowerCase().includes(search.trim().toLowerCase());

export type CommandProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * A composable command palette: a filterable, keyboard-navigable list of
 * actions. Compose with CommandInput, CommandList, CommandGroup, CommandItem,
 * and CommandEmpty.
 */
export const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, children, ...props }, ref) => {
    const [search, setSearch] = React.useState("");
    const [activeValue, setActiveValue] = React.useState<string | null>(null);
    const [, setEmpty] = React.useState(false);
    const listRef = React.useRef<HTMLDivElement>(null);

    const reportEmpty = React.useCallback((e: boolean) => setEmpty(e), []);

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-md",
          className,
        )}
        {...props}
      >
        <CommandContext.Provider
          value={{ search, setSearch, activeValue, setActiveValue, listRef, reportEmpty }}
        >
          {children}
        </CommandContext.Provider>
      </div>
    );
  },
);
Command.displayName = "Command";

export type CommandInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
>;

/** The search field that filters the command list. */
export const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, placeholder = "Type a command or search…", ...props }, ref) => {
    const { search, setSearch, listRef, activeValue, setActiveValue } = useCommand("CommandInput");

    const visibleItems = () =>
      Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-command-item]") ?? []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const items = visibleItems();
      if (items.length === 0) return;
      const values = items.map((el) => el.dataset.value ?? "");
      const idx = values.indexOf(activeValue ?? "");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveValue(values[(idx + 1) % values.length] ?? null);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveValue(values[(idx - 1 + values.length) % values.length] ?? null);
      } else if (e.key === "Home") {
        e.preventDefault();
        setActiveValue(values[0] ?? null);
      } else if (e.key === "End") {
        e.preventDefault();
        setActiveValue(values[values.length - 1] ?? null);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const el = items.find((i) => i.dataset.value === activeValue) ?? items[0];
        el?.click();
      }
    };

    return (
      <div className="flex items-center gap-2 border-b border-border px-3">
        <Search aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={ref}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-list"
          value={search}
          placeholder={placeholder}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveValue(null);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
CommandInput.displayName = "CommandInput";

export type CommandListProps = React.HTMLAttributes<HTMLDivElement>;

/** Scrollable container for command groups and items. */
export const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, children, ...props }, ref) => {
    const { listRef, search, reportEmpty, activeValue, setActiveValue } = useCommand("CommandList");
    const setRefs = (node: HTMLDivElement | null) => {
      (listRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    // After each search change, recount visible items and keep an active item.
    React.useEffect(() => {
      const items = Array.from(
        listRef.current?.querySelectorAll<HTMLElement>("[data-command-item]") ?? [],
      );
      reportEmpty(items.length === 0);
      const values = items.map((el) => el.dataset.value ?? "");
      if (values.length && !values.includes(activeValue ?? "")) setActiveValue(values[0] ?? null);
    }, [search, listRef, reportEmpty, activeValue, setActiveValue]);

    return (
      <div
        ref={setRefs}
        id="command-list"
        role="listbox"
        className={cn("max-h-72 overflow-y-auto overflow-x-hidden p-1", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CommandList.displayName = "CommandList";

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode;
}

/** A labelled group of {@link CommandItem}s. */
export const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ className, heading, children, ...props }, ref) => (
    <div ref={ref} role="group" className={cn("overflow-hidden py-1", className)} {...props}>
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{heading}</div>
      )}
      {children}
    </div>
  ),
);
CommandGroup.displayName = "CommandGroup";

export interface CommandItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** The value used for filtering + selection. Defaults to the text content. */
  value: string;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}

/** A selectable command. Hidden automatically when it doesn't match the search. */
export const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ className, value, disabled = false, onSelect, onClick, children, ...props }, ref) => {
    const { search, activeValue, setActiveValue } = useCommand("CommandItem");
    if (search && !matches(value, search)) return null;
    const active = activeValue === value;

    return (
      <div
        ref={ref}
        data-command-item=""
        data-value={value}
        role="option"
        aria-selected={active}
        aria-disabled={disabled || undefined}
        onMouseMove={() => !disabled && setActiveValue(value)}
        onClick={(e) => {
          onClick?.(e);
          if (!disabled && !e.defaultPrevented) onSelect?.(value);
        }}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
          active && "bg-accent text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CommandItem.displayName = "CommandItem";

export type CommandEmptyProps = React.HTMLAttributes<HTMLDivElement>;

/** Shown when no items match the current search. */
export const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ className, children = "No results found.", ...props }, ref) => {
    const { listRef, search } = useCommand("CommandEmpty");
    const [empty, setEmpty] = React.useState(false);

    React.useEffect(() => {
      const count =
        listRef.current?.querySelectorAll("[data-command-item]").length ?? 0;
      setEmpty(count === 0);
    }, [search, listRef]);

    if (!empty) return null;
    return (
      <div
        ref={ref}
        role="presentation"
        className={cn("py-6 text-center text-sm text-muted-foreground", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
CommandEmpty.displayName = "CommandEmpty";
