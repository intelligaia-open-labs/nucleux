import * as React from "react";
import { cn } from "@nucleux/utils";
import { Info } from "lucide-react";
import { Button } from "@nucleux/button";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@nucleux/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nucleux/tabs";

/**
 * Layout of the gallery, from the spec's variants. "tiles" is a compact
 * two-column grid of tinted tiles that name the task (nucleux.in's shadcn
 * preview); "grouped-list" lists the examples under their category, one row
 * each with the icon, the task, a line on what it does and what it needs
 * (nucleux.in's Material 3 preview).
 */
export type ExampleGalleryVariant = "card-grid" | "horizontal-strip" | "categorized-tabs" | "tiles" | "grouped-list";

/** What choosing an example does: place its prompt straight away, or open the prompt and output first. */
export type ExampleGallerySelectBehavior = "fill" | "preview";

/** One curated example: the ask, a line on what came back, and the prompt that produced it. */
export interface ExampleGalleryExample {
  /** Stable id. Defaults to `title`. */
  id?: string;
  /** The task, in the product's words ("Summarise renewal risks"). */
  title: string;
  /** One line on what it does or what came back. */
  description?: string;
  /** The exact prompt placed in the composer. */
  prompt: string;
  /** The finished output, shown when the example is opened (`selectBehavior="preview"`). */
  output?: React.ReactNode;
  /** What it needs ("Needs a meeting with a transcript"). */
  needs?: string;
  /** Category used by the categorised tabs. */
  category?: string;
  /** Small icon shown on the card. */
  icon?: React.ReactNode;
  /** A thumbnail of the output; replaces the default tinted tile. */
  preview?: React.ReactNode;
}

const GalleryContext = React.createContext<{ variant: ExampleGalleryVariant }>({ variant: "card-grid" });

// Token tints rotated across tiles so neighbouring examples read as different outputs.
const tints = [
  "from-brand-muted to-brand/10",
  "from-info/15 to-info/5",
  "from-success/15 to-success/5",
  "from-warning/20 to-warning/5",
];

// Compact tiles: four distinct hues, so each tile reads as a different task at a glance.
const tileTints = [
  "from-destructive/10 to-destructive/15 text-destructive",
  "from-info/15 to-info/25 text-info",
  "from-success/15 to-success/25 text-success",
  "from-warning/25 to-warning/45 text-warning-foreground",
];

export interface ExampleGalleryItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  /** The task name. */
  title: React.ReactNode;
  /** One supporting line. */
  description?: React.ReactNode;
  /** What the example needs. */
  needs?: React.ReactNode;
  /** Small icon on the tile. */
  icon?: React.ReactNode;
  /** Thumbnail of the output; replaces the tinted tile. */
  preview?: React.ReactNode;
  /** Index used to rotate the tile tint. */
  tint?: number;
  /** Marks the chosen example. */
  selected?: boolean;
}

/**
 * One example card: a 4:3 tile (a thumbnail of the output, or a tinted tile
 * with an icon) above the task name, a supporting line and what it needs.
 * It is a button, so the whole card is one keyboard stop.
 */
export const ExampleGalleryItem = React.forwardRef<HTMLButtonElement, ExampleGalleryItemProps>(
  ({ title, description, needs, icon, preview, tint = 0, selected, type = "button", className, ...props }, ref) => {
    const { variant } = React.useContext(GalleryContext);
    const strip = variant === "horizontal-strip";
    if (variant === "tiles") {
      return (
        <button
          ref={ref}
          type={type}
          aria-pressed={selected === undefined ? undefined : selected}
          className={cn(
            "grid h-11 w-full place-items-center rounded-md bg-gradient-to-br px-3 text-center text-xs font-semibold transition-[filter,box-shadow] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            !preview && tileTints[tint % tileTints.length],
            selected && "ring-2 ring-brand",
            className,
          )}
          {...props}
        >
          {preview ?? title}
          {preview && <span className="sr-only">{title}</span>}
        </button>
      );
    }
    if (variant === "grouped-list") {
      return (
        <button
          ref={ref}
          type={type}
          aria-pressed={selected === undefined ? undefined : selected}
          className={cn(
            "flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            selected && "bg-brand-muted",
            className,
          )}
          {...props}
        >
          {icon && (
            <span aria-hidden="true" className="shrink-0 text-muted-foreground [&_svg]:size-5">
              {icon}
            </span>
          )}
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{title}</span>
            {description && <span className="text-sm text-muted-foreground">{description}</span>}
            {needs && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info aria-hidden="true" className="size-3.5 shrink-0" />
                {needs}
              </span>
            )}
          </span>
        </button>
      );
    }
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={selected === undefined ? undefined : selected}
        className={cn(
          "group flex h-full w-full flex-col gap-2 rounded-lg border border-border bg-background p-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          selected && "border-brand/50 bg-brand-muted",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "grid w-full place-items-center overflow-hidden rounded-md bg-gradient-to-br text-brand [&_svg]:size-5",
            strip ? "h-16" : "aspect-[4/3]",
            !preview && tints[tint % tints.length],
          )}
        >
          {preview ?? icon}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5 px-1 pb-1">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {description && !strip && <span className="text-xs text-muted-foreground">{description}</span>}
          {needs && !strip && <span className="text-xs text-muted-foreground/80">{needs}</span>}
        </span>
      </button>
    );
  },
);
ExampleGalleryItem.displayName = "ExampleGalleryItem";

export interface ExampleGalleryProps extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> {
  /** The curated examples (6–12 is the sweet spot). */
  examples: ExampleGalleryExample[];
  /** "card-grid" (default), "horizontal-strip", "categorized-tabs", "tiles" or "grouped-list". */
  variant?: ExampleGalleryVariant;
  /** Called with the example's prompt and the example. Place it in the composer — never send it. */
  onSelect?: (prompt: string, example: ExampleGalleryExample) => void;
  /** Heading above the gallery. Defaults to "Try one". */
  label?: React.ReactNode;
  /** Most examples shown. Defaults to 12. */
  max?: number;
  /** "fill" (default) calls `onSelect` straight away; "preview" opens the prompt and output in a dialog first. */
  selectBehavior?: ExampleGallerySelectBehavior;
  /** Label of the dialog's confirm button. Defaults to "Use this prompt". */
  useLabel?: string;
  /** Collapse the gallery to a single "Show examples" button (once work has started). */
  collapsed?: boolean;
  /** Called by the "Show examples" button while collapsed. */
  onExpand?: () => void;
  /** Label of the expand button. Defaults to "Show examples". */
  expandLabel?: string;
  /** Category order for the tabs. Defaults to the order categories first appear in `examples`. */
  categories?: string[];
  /** Initial category for the tabs. */
  defaultCategory?: string;
  /** Marks this example id as chosen. */
  selectedId?: string | null;
}

const exampleId = (e: ExampleGalleryExample) => e.id ?? e.title;

/**
 * A curated wall of finished outputs that shows what the agent can do before
 * anyone types. Each card names a real task, says what came back, and
 * choosing it hands its prompt to `onSelect` (or, with
 * `selectBehavior="preview"`, opens the prompt and output in a dialog with a
 * "Use this prompt" button). Nothing is ever sent. Lay it out as a card grid,
 * a horizontally scrolling strip, or tabs by category; set `collapsed` once
 * work starts to fold it into a "Show examples" button.
 */
export const ExampleGallery = React.forwardRef<HTMLElement, ExampleGalleryProps>(
  (
    {
      examples,
      variant = "card-grid",
      onSelect,
      label = "Try one",
      max = 12,
      selectBehavior = "fill",
      useLabel = "Use this prompt",
      collapsed = false,
      onExpand,
      expandLabel = "Show examples",
      categories: categoriesProp,
      defaultCategory,
      selectedId,
      className,
      ...props
    },
    ref,
  ) => {
    const headingId = React.useId();
    const [open, setOpen] = React.useState<ExampleGalleryExample | null>(null);
    const returnFocus = React.useRef<HTMLButtonElement | null>(null);
    const shown = examples.slice(0, Math.max(0, max));

    const choose = (example: ExampleGalleryExample, trigger: HTMLButtonElement) => {
      if (selectBehavior === "preview") {
        returnFocus.current = trigger;
        setOpen(example);
      } else {
        onSelect?.(example.prompt, example);
      }
    };

    const closeDialog = () => {
      setOpen(null);
      const el = returnFocus.current;
      // Return focus to the card unless the host already moved it (e.g. to the composer).
      if (el)
        requestAnimationFrame(() => {
          const active = document.activeElement;
          if (!active || active === document.body) el.focus();
        });
    };

    const renderList = (list: ExampleGalleryExample[], listLabel?: string, labelledBy?: string) => (
      <ul
        role="list"
        aria-label={listLabel}
        aria-labelledby={labelledBy}
        className={cn(
          "m-0 list-none p-0",
          variant === "horizontal-strip"
            ? "flex snap-x gap-2 overflow-x-auto pb-2"
            : variant === "tiles"
              ? "grid grid-cols-2 gap-2"
              : variant === "grouped-list"
                ? "overflow-hidden rounded-xl border border-border bg-background py-1"
                : "grid grid-cols-2 gap-2 sm:grid-cols-3",
        )}
      >
        {list.map((example) => (
          <li
            key={exampleId(example)}
            className={cn(variant === "horizontal-strip" && "w-36 shrink-0 snap-start")}
          >
            <ExampleGalleryItem
              title={example.title}
              description={example.description}
              needs={example.needs}
              icon={example.icon}
              preview={example.preview}
              tint={shown.indexOf(example)}
              selected={selectedId === undefined ? undefined : selectedId === exampleId(example)}
              aria-haspopup={selectBehavior === "preview" ? "dialog" : undefined}
              onClick={(e) => choose(example, e.currentTarget)}
            />
          </li>
        ))}
      </ul>
    );

    if (collapsed) {
      return (
        <section ref={ref} aria-label="Examples" className={cn("flex", className)} {...props}>
          <Button variant="ghost" size="sm" onClick={onExpand}>
            {expandLabel}
          </Button>
        </section>
      );
    }

    let body: React.ReactNode;
    if (variant === "grouped-list") {
      const groups = shown.reduce<string[]>((acc, e) => {
        const c = e.category ?? "Other";
        return acc.includes(c) ? acc : [...acc, c];
      }, []);
      const order = categoriesProp ? [...categoriesProp.filter((c) => groups.includes(c)), ...groups.filter((c) => !categoriesProp.includes(c))] : groups;
      body = order.map((c, i) => (
        <div key={c} className="flex flex-col gap-1.5">
          <h3 id={`${headingId}-g${i}`} className="text-xs font-medium text-muted-foreground">
            {c}
          </h3>
          {renderList(shown.filter((e) => (e.category ?? "Other") === c), undefined, `${headingId}-g${i}`)}
        </div>
      ));
    } else if (variant === "categorized-tabs") {
      const categories =
        categoriesProp ??
        shown.reduce<string[]>((acc, e) => {
          const c = e.category ?? "Other";
          return acc.includes(c) ? acc : [...acc, c];
        }, []);
      body = (
        <Tabs defaultValue={defaultCategory ?? categories[0] ?? ""}>
          <TabsList aria-label="Example categories" className="self-start">
            {categories.map((c) => (
              <TabsTrigger key={c} value={c}>
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((c) => (
            <TabsContent key={c} value={c}>
              {renderList(shown.filter((e) => (e.category ?? "Other") === c))}
            </TabsContent>
          ))}
        </Tabs>
      );
    } else {
      body = renderList(shown);
    }

    return (
      <GalleryContext.Provider value={{ variant }}>
        <section
          ref={ref}
          aria-labelledby={label != null ? headingId : undefined}
          aria-label={label != null ? undefined : "Examples"}
          className={cn("flex flex-col", variant === "grouped-list" ? "gap-3" : "gap-2.5", className)}
          {...props}
        >
          {label != null && (
            <h2
              id={headingId}
              className={cn(
                variant === "grouped-list" ? "text-lg font-semibold text-foreground" : "text-xs font-semibold text-muted-foreground",
              )}
            >
              {label}
            </h2>
          )}
          {body}
        </section>
        <Dialog open={open != null} onOpenChange={(o) => !o && closeDialog()} className="max-w-lg">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.title}</DialogTitle>
                <DialogDescription>{open.description ?? "An example of what the agent can do."}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">Prompt</span>
                  <p className="rounded-md bg-muted px-3 py-2 text-foreground">{open.prompt}</p>
                </div>
                {open.output != null && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-muted-foreground">Result</span>
                    <div className="rounded-md border border-border px-3 py-2 text-foreground">{open.output}</div>
                  </div>
                )}
                {open.needs && <p className="text-xs text-muted-foreground">{open.needs}</p>}
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={closeDialog}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    onSelect?.(open.prompt, open);
                    closeDialog();
                  }}
                >
                  {useLabel}
                </Button>
              </DialogFooter>
            </>
          )}
        </Dialog>
      </GalleryContext.Provider>
    );
  },
);
ExampleGallery.displayName = "ExampleGallery";
