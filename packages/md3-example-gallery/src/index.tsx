import * as React from "react";
import { cn } from "@nucleux/utils";
import type {
  ExampleGalleryExample,
  ExampleGalleryItemProps,
  ExampleGalleryProps,
  ExampleGallerySelectBehavior,
  ExampleGalleryVariant,
} from "@nucleux/example-gallery";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Dialog } from "@nucleux/md3-dialog";
import { Md3Tab, Md3TabPanel, Md3Tabs, Md3TabsList } from "@nucleux/md3-tabs";

/** Props of {@link Md3ExampleGallery} — identical to `ExampleGalleryProps`. */
export type Md3ExampleGalleryProps = ExampleGalleryProps;
/** Props of {@link Md3ExampleGalleryItem} — identical to `ExampleGalleryItemProps`. */
export type Md3ExampleGalleryItemProps = ExampleGalleryItemProps;
/** "card-grid", "horizontal-strip" or "categorized-tabs". */
export type Md3ExampleGalleryVariant = ExampleGalleryVariant;
/** "fill" or "preview". */
export type Md3ExampleGallerySelectBehavior = ExampleGallerySelectBehavior;
export type { ExampleGalleryExample };

const GalleryContext = React.createContext<{ variant: ExampleGalleryVariant }>({ variant: "card-grid" });

// Tonal containers rotated across tiles so neighbouring examples read as different outputs.
const tints = [
  "bg-md-primary-container text-md-on-primary-container",
  "bg-md-secondary-container text-md-on-secondary-container",
  "bg-md-tertiary-container text-md-on-tertiary-container",
  "bg-md-surface-container-high text-md-primary",
];

/**
 * One Material 3 example card — the same API as `ExampleGalleryItem`. An
 * outlined, actionable M3 card (large corner, outline-variant hairline) with
 * an on-surface state layer: hover lifts it to level 2, press settles it. The
 * tile is a thumbnail of the output or a tonal container with the icon, above
 * the task name, a line on what came back and what it needs. The whole card
 * is one button; a chosen example takes the secondary container.
 */
export const Md3ExampleGalleryItem = React.forwardRef<HTMLButtonElement, Md3ExampleGalleryItemProps>(
  ({ title, description, needs, icon, preview, tint = 0, selected, type = "button", className, ...props }, ref) => {
    const { variant } = React.useContext(GalleryContext);
    const strip = variant === "horizontal-strip";
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={selected === undefined ? undefined : selected}
        className={cn(
          "group relative flex h-full w-full flex-col gap-3 overflow-hidden rounded-md-lg border p-2 text-left",
          "transition-[box-shadow,transform,background-color] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:-translate-y-0.5 hover:shadow-md-2 active:translate-y-0 active:scale-[0.995]",
          "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
          "before:absolute before:inset-0 before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.10] active:before:opacity-[0.10]",
          "outline-none focus-visible:ring-2 focus-visible:ring-md-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface",
          selected
            ? "border-transparent bg-md-secondary-container text-md-on-secondary-container"
            : "border-md-outline-variant bg-md-surface text-md-on-surface",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "relative grid w-full place-items-center overflow-hidden rounded-md-md [&_svg]:size-6",
            strip ? "h-16" : "aspect-[4/3]",
            !preview && tints[tint % tints.length],
          )}
        >
          {preview ?? icon}
        </span>
        <span className="relative flex min-w-0 flex-col gap-1 px-2 pb-2">
          <span className="text-sm font-medium leading-5 tracking-[0.1px]">{title}</span>
          {description && !strip && (
            <span
              className={cn(
                "border-t border-dashed pt-1.5 text-xs leading-4 tracking-[0.4px]",
                selected ? "border-md-on-secondary-container/30 opacity-80" : "border-md-outline-variant text-md-on-surface-variant",
              )}
            >
              {description}
            </span>
          )}
          {needs && !strip && (
            <span className={cn("text-[11px] font-medium leading-4 tracking-[0.5px]", selected ? "opacity-80" : "text-md-primary")}>
              {needs}
            </span>
          )}
        </span>
      </button>
    );
  },
);
Md3ExampleGalleryItem.displayName = "Md3ExampleGalleryItem";

const exampleId = (e: ExampleGalleryExample) => e.id ?? e.title;

/**
 * The Material 3 example gallery — the same API and behaviour as
 * `ExampleGallery`. A quiet wall of outlined example cards that shows what
 * the agent does before anyone types; choosing one hands its prompt to
 * `onSelect` (or, with `selectBehavior="preview"`, opens the prompt and the
 * result in an `Md3Dialog` with "Use this prompt"). Nothing is ever sent.
 * Lay it out as a card grid, a scrolling strip, or `Md3Tabs` by category
 * (arrow keys move between tabs); `collapsed` folds it into a single text
 * button once work has started.
 */
export const Md3ExampleGallery = React.forwardRef<HTMLElement, Md3ExampleGalleryProps>(
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

    const categories =
      categoriesProp ??
      shown.reduce<string[]>((acc, e) => {
        const c = e.category ?? "Other";
        return acc.includes(c) ? acc : [...acc, c];
      }, []);
    const [category, setCategory] = React.useState(defaultCategory ?? categories[0] ?? "");

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

    // Roving focus across the category tabs (Md3Tabs has no keyboard model of its own).
    const onTabsKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
      const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
      const idx = tabs.indexOf(document.activeElement as HTMLButtonElement);
      if (idx === -1) return;
      e.preventDefault();
      let next = idx;
      if (e.key === "ArrowRight") next = (idx + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      tabs[next]?.focus();
      tabs[next]?.click();
    };

    const renderList = (list: ExampleGalleryExample[]) => (
      <ul
        role="list"
        className={cn(
          "m-0 list-none p-0",
          variant === "horizontal-strip"
            ? "flex snap-x gap-3 overflow-x-auto pb-2"
            : "grid grid-cols-2 gap-3 sm:grid-cols-3",
        )}
      >
        {list.map((example) => (
          <li key={exampleId(example)} className={cn(variant === "horizontal-strip" && "w-40 shrink-0 snap-start")}>
            <Md3ExampleGalleryItem
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
          <Md3Button variant="text" onClick={onExpand}>
            {expandLabel}
          </Md3Button>
        </section>
      );
    }

    let body: React.ReactNode;
    if (variant === "categorized-tabs") {
      body = (
        <Md3Tabs value={category} onValueChange={setCategory} className="flex flex-col gap-3">
          <Md3TabsList aria-label="Example categories" onKeyDown={onTabsKeyDown} className="overflow-x-auto bg-transparent">
            {categories.map((c) => (
              <Md3Tab key={c} value={c} tabIndex={c === category ? 0 : -1} className="flex-none px-4">
                {c}
              </Md3Tab>
            ))}
          </Md3TabsList>
          {categories.map((c) => (
            <Md3TabPanel key={c} value={c} tabIndex={0} className="rounded-md-md p-0 outline-none focus-visible:ring-2 focus-visible:ring-md-secondary">
              {renderList(shown.filter((e) => (e.category ?? "Other") === c))}
            </Md3TabPanel>
          ))}
        </Md3Tabs>
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
          className={cn("flex flex-col gap-3 text-md-on-surface", className)}
          {...props}
        >
          {label != null && (
            <h2 id={headingId} className="text-sm font-medium tracking-[0.1px] text-md-on-surface-variant">
              {label}
            </h2>
          )}
          {body}
        </section>
        <Md3Dialog
          open={open != null}
          onOpenChange={(o) => !o && closeDialog()}
          headline={open?.title}
          className="max-w-lg"
          actions={
            open && (
              <>
                <Md3Button variant="text" onClick={closeDialog}>
                  Close
                </Md3Button>
                <Md3Button
                  onClick={() => {
                    onSelect?.(open.prompt, open);
                    closeDialog();
                  }}
                >
                  {useLabel}
                </Md3Button>
              </>
            )
          }
        >
          {open && (
            <div className="flex flex-col gap-4">
              <p>{open.description ?? "An example of what the agent can do."}</p>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium tracking-[0.5px] text-md-on-surface-variant">Prompt</span>
                <p className="rounded-md-md bg-md-surface-container px-3.5 py-3 text-md-on-surface">{open.prompt}</p>
              </div>
              {open.output != null && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium tracking-[0.5px] text-md-on-surface-variant">Result</span>
                  <div className="rounded-md-md border border-md-outline-variant px-3.5 py-3 text-md-on-surface">{open.output}</div>
                </div>
              )}
              {open.needs && <p className="text-xs text-md-on-surface-variant">{open.needs}</p>}
            </div>
          )}
        </Md3Dialog>
      </GalleryContext.Provider>
    );
  },
);
Md3ExampleGallery.displayName = "Md3ExampleGallery";
