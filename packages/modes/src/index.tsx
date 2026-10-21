import * as React from "react";
import { Check, ChevronDown, Info, RefreshCw, Send, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button } from "@nucleux/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@nucleux/input-group";
import { RequestSettings, mergeRequestSettingsItems, type RequestSettingsItem } from "@nucleux/open-input";

/* ────────────────────────────────────────────────────────────
   Data + shared, non-visual logic (also used by @nucleux/md3-modes)
   ──────────────────────────────────────────────────────────── */

/** One mode the product supports: how the agent will approach the request. */
export interface ModeOption {
  /** Stable id passed to `onValueChange` and `onSubmit`. */
  id: string;
  /** Full name, a verb or label people already use ("Plan", "Deep research"). */
  name: string;
  /** Shorter label for the segmented control and the composer chip. Defaults to `name`. */
  shortName?: string;
  /** One line on what changes in this mode. */
  description?: string;
  /** Expected cost or latency shown before the description ("~3 seconds"). */
  meta?: string;
  /** Leading icon or emoji. */
  icon?: React.ReactNode;
  /** When set, the mode is listed but can't be applied here; this says why. */
  unavailable?: string;
}

/** Transient feedback after a choice: the mode changed (with Undo) or the chosen mode is unavailable. */
export type ModesNotice = { type: "changed"; from: string } | { type: "unavailable"; id: string } | null;

/**
 * How the control is presented.
 * "composer" (default): the site's live preview for the family — the mode set
 * beside the composer, with the active mode as a chip in the composer toolbar.
 * "segmented": three or four labelled segments. "list": rich rows with what
 * each mode is for and its expected speed. "chip": only the chip and its picker.
 */
export type ModesVariant = "composer" | "segmented" | "list" | "chip";

/**
 * Where the mode is set from in the composer. "chip" (default): the Mode chip
 * up front. "settings": no chip; a Request settings control (the tune icon,
 * right after the leading actions) lists Mode with its value, and its row
 * opens the mode picker.
 */
export type ModesTrigger = "chip" | "settings";

export interface UseModesOptions {
  modes: ModeOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null, mode: ModeOption | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultNotice?: ModesNotice;
  onUnavailable?: (mode: ModeOption) => void;
}

/** The state and actions behind every Modes view, in both families. */
export interface ModesState {
  value: string | null;
  mode: ModeOption | null;
  open: boolean;
  notice: ModesNotice;
  /** Polite screen-reader announcement for the last change. */
  announcement: string;
  setOpen: (open: boolean) => void;
  select: (id: string) => void;
  clear: () => void;
  undo: () => void;
  dismissNotice: () => void;
}

/**
 * Controlled/uncontrolled value and picker state for Modes, shared by the
 * shadcn and Material 3 families so both behave identically: choosing an
 * unavailable mode is refused with a reason; changing modes records the
 * previous one for Undo; nothing here ever touches the prompt text.
 */
export function useModes({
  modes,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  defaultNotice = null,
  onUnavailable,
}: UseModesOptions): ModesState {
  const [internalValue, setInternalValue] = React.useState<string | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : internalValue;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const [notice, setNotice] = React.useState<ModesNotice>(defaultNotice);
  const [announcement, setAnnouncement] = React.useState("");

  const find = (id: string | null) => (id == null ? null : (modes.find((m) => m.id === id) ?? null));

  const setValue = (next: string | null) => {
    if (valueProp === undefined) setInternalValue(next);
    onValueChange?.(next, find(next));
  };
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInternalOpen(next);
    // A refusal belongs to one visit of the picker.
    setNotice((n) => (n?.type === "unavailable" ? null : n));
    onOpenChange?.(next);
  };

  const select = (id: string) => {
    const m = find(id);
    if (!m) return;
    if (m.unavailable) {
      setNotice({ type: "unavailable", id });
      setAnnouncement(`${m.name} isn’t available here. Choose another mode.`);
      onUnavailable?.(m);
      return;
    }
    if (id === value) {
      setNotice(null);
      if (open) setOpen(false);
      return;
    }
    setNotice(value != null ? { type: "changed", from: value } : null);
    setValue(id);
    if (open) setOpen(false);
    setAnnouncement(
      value != null
        ? `Mode changed to ${m.name}. Your text is unchanged.`
        : `Mode: ${m.name}. Your text is unchanged.`,
    );
  };

  const clear = () => {
    setNotice(null);
    setValue(null);
    if (open) setOpen(false);
    setAnnouncement("Mode cleared. Your text is unchanged.");
  };

  const undo = () => {
    if (notice?.type !== "changed") return;
    const prev = find(notice.from);
    setNotice(null);
    setValue(notice.from);
    if (prev) setAnnouncement(`Mode back to ${prev.name}.`);
  };

  return {
    value,
    mode: find(value),
    open,
    notice,
    announcement,
    setOpen,
    select,
    clear,
    undo,
    dismissNotice: () => setNotice(null),
  };
}

/**
 * Roving focus for a group of mode radios: Arrow keys, Home and End move focus
 * (unavailable modes stay focusable so their reason can be read); Space or
 * Enter chooses. One tab stop, on the active mode or the first one.
 */
export function useModesRoving(modes: ModeOption[], value: string | null) {
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const checked = modes.findIndex((m) => m.id === value);
  const stop = checked >= 0 ? checked : 0;
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = modes.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    refs.current[next]?.focus();
  };
  return {
    getItemProps: (i: number) => ({
      ref: (el: HTMLButtonElement | null) => {
        refs.current[i] = el;
      },
      tabIndex: i === stop ? 0 : -1,
      onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => onKeyDown(e, i),
    }),
    focusActive: () => refs.current[stop]?.focus(),
  };
}

/** Closes a popup on a pointer press outside all of `refs` (its trigger and the popup). */
export function useModesDismiss(
  refs: Array<React.RefObject<HTMLElement>>,
  open: boolean,
  onDismiss: () => void,
) {
  const latest = React.useRef({ refs, onDismiss });
  latest.current = { refs, onDismiss };
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const inside = latest.current.refs.some((r) => r.current?.contains(e.target as Node));
      if (!inside) latest.current.onDismiss();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
}

/** Accessible names shared by both families. */
export const modesLabels = {
  chip: (label: string, mode: ModeOption | null) =>
    mode ? `${label} ${mode.name} — change` : label,
  remove: (label: string, mode: ModeOption) => `Remove ${label.toLowerCase()} ${mode.name}`,
  picker: (label: string) => `Choose a ${label.toLowerCase()}`,
  unavailable: (mode: ModeOption) => `${mode.name} isn’t available here. Choose another mode.`,
  changed: (mode: ModeOption) => `Mode changed to ${mode.name}. Your text is unchanged.`,
  clear: "No mode",
  undo: "Undo",
  close: "Close",
  /** The value on the Mode row of the Request settings menu when no mode is set. */
  none: "None",
};

/** The Mode row of the Request settings menu, in both families. */
export const modesSettingsItem = (label: string, mode: ModeOption | null, icon?: React.ReactNode): RequestSettingsItem => ({
  id: "mode",
  label,
  icon,
  value: mode ? mode.name : modesLabels.none,
  set: !!mode,
});

/** Joins `meta` and `description` into the one supporting line ("~3 seconds · most tasks"). */
export const modeSupportingText = (m: ModeOption, showDescriptions = true) =>
  [m.meta, showDescriptions ? m.description : undefined].filter(Boolean).join(" · ");

/* ────────────────────────────────────────────────────────────
   Views
   ──────────────────────────────────────────────────────────── */

interface ModesGroupBase {
  /** The modes to offer, in order. */
  modes: ModeOption[];
  /** Id of the active mode, or null for none. */
  value: string | null;
  /** Called when a mode is chosen (also for unavailable modes, which the owner refuses). */
  onSelect: (id: string) => void;
  /** Accessible name of the group. Defaults to "Mode". */
  label?: string;
}

export interface ModesSegmentedProps
  extends ModesGroupBase,
    Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "defaultValue"> {}

/**
 * The segmented control: three or four labelled segments in a bordered track,
 * the active one filled with the primary colour. A radio group with roving
 * focus (Arrow keys move, Space/Enter choose).
 */
export const ModesSegmented = React.forwardRef<HTMLDivElement, ModesSegmentedProps>(
  ({ modes, value, onSelect, label = "Mode", className, ...props }, ref) => {
    const roving = useModesRoving(modes, value);
    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        className={cn(
          "inline-flex gap-px rounded-[10px] border border-border bg-background p-[3px]",
          className,
        )}
        {...props}
      >
        {modes.map((m, i) => {
          const on = m.id === value;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-disabled={m.unavailable ? true : undefined}
              title={m.unavailable}
              {...roving.getItemProps(i)}
              onClick={() => onSelect(m.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs transition-colors motion-reduce:transition-none",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                on
                  ? "bg-primary font-medium text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:bg-accent hover:text-foreground",
                m.unavailable && "cursor-not-allowed opacity-50",
              )}
            >
              {m.icon != null && <span aria-hidden="true">{m.icon}</span>}
              {m.shortName ?? m.name}
            </button>
          );
        })}
      </div>
    );
  },
);
ModesSegmented.displayName = "ModesSegmented";

export interface ModesListProps
  extends ModesGroupBase,
    Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "defaultValue"> {
  /** Show each mode's description (meta such as latency always shows). Defaults to true. */
  showDescriptions?: boolean;
  /** Draw the rows as a bordered card with dividers (default) or as bare menu rows. */
  framed?: boolean;
}

/**
 * The mode picker list: rich rows with an icon tile, the name ("Fast · active"
 * on the current one), and expected speed plus what it's for. Unavailable modes
 * stay listed with their reason. A radio group with roving focus.
 */
export const ModesList = React.forwardRef<HTMLDivElement, ModesListProps>(
  (
    { modes, value, onSelect, label = "Mode", showDescriptions = true, framed = true, className, ...props },
    ref,
  ) => {
    const roving = useModesRoving(modes, value);
    const baseId = React.useId();
    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        className={cn(
          framed
            ? "divide-y divide-border overflow-hidden rounded-xl border border-border bg-background"
            : "flex flex-col gap-0.5",
          className,
        )}
        {...props}
      >
        {modes.map((m, i) => {
          const on = m.id === value;
          const support = modeSupportingText(m, showDescriptions);
          const descId = `${baseId}-${i}`;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-disabled={m.unavailable ? true : undefined}
              aria-labelledby={`${descId}-n`}
              aria-describedby={support || m.unavailable ? descId : undefined}
              {...roving.getItemProps(i)}
              onClick={() => onSelect(m.id)}
              className={cn(
                "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors motion-reduce:transition-none",
                "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                !framed && "rounded-lg",
                on ? "bg-brand/[0.06]" : "hover:bg-muted/50",
                m.unavailable && "cursor-not-allowed",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-[7px] text-[13px] [&_svg]:size-4",
                  on ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground",
                  m.unavailable && "opacity-50",
                )}
              >
                {m.icon}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  id={`${descId}-n`}
                  className={cn(
                    "text-[13px] leading-5",
                    on ? "font-semibold text-foreground" : "text-foreground/70",
                    m.unavailable && "opacity-60",
                  )}
                >
                  {m.name}
                  {on && <span aria-hidden="true"> · active</span>}
                </span>
                {(support || m.unavailable) && (
                  <span id={descId} className="flex flex-col text-[11px] leading-4 text-muted-foreground">
                    {support && <span className={cn(m.unavailable && "opacity-60")}>{support}</span>}
                    {m.unavailable && (
                      <span className="mt-0.5 inline-flex items-center gap-1 text-foreground">
                        <Info aria-hidden="true" className="size-3 shrink-0" />
                        {m.unavailable}
                      </span>
                    )}
                  </span>
                )}
              </span>
              {on && !framed && <Check aria-hidden="true" className="size-4 shrink-0 text-foreground" />}
            </button>
          );
        })}
      </div>
    );
  },
);
ModesList.displayName = "ModesList";

export interface ModesChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** The active mode, or null (the chip then reads just the label). */
  mode: ModeOption | null;
  /** The setting's name. Defaults to "Mode". */
  label?: string;
  /** Whether the picker it controls is open (sets `aria-expanded`). */
  open?: boolean;
  /** Shows a remove button that clears the mode. */
  onRemove?: () => void;
}

/**
 * The composer chip that shows the active mode ("⚡ Fast ▾") and opens the
 * picker; with `onRemove`, a small × clears it. Unset, it reads "Mode ▾".
 * The trigger is a button with `aria-haspopup="dialog"`.
 */
export const ModesChip = React.forwardRef<HTMLButtonElement, ModesChipProps>(
  ({ mode, label = "Mode", open = false, onRemove, className, type = "button", ...props }, ref) => (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center rounded-md border border-border bg-muted/40 text-xs text-foreground transition-colors",
        open && "border-ring",
        className,
      )}
    >
      <button
        ref={ref}
        type={type}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={modesLabels.chip(label, mode)}
        className={cn(
          "inline-flex h-full items-center gap-1 whitespace-nowrap rounded-md px-2 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
          onRemove && mode && "rounded-r-none pr-1",
          !mode && "text-muted-foreground",
        )}
        {...props}
      >
        {mode?.icon != null && <span aria-hidden="true">{mode.icon}</span>}
        <span className={cn(mode && "font-medium")}>{mode ? (mode.shortName ?? mode.name) : label}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn("size-3 transition-transform motion-reduce:transition-none", open && "rotate-180")}
        />
      </button>
      {onRemove && mode && (
        <button
          type="button"
          aria-label={modesLabels.remove(label, mode)}
          onClick={onRemove}
          className="inline-flex h-full items-center rounded-r-md px-1 text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X aria-hidden="true" className="size-3" />
        </button>
      )}
    </span>
  ),
);
ModesChip.displayName = "ModesChip";

export interface ModesPickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "defaultValue" | "title"> {
  modes: ModeOption[];
  value: string | null;
  onSelect: (id: string) => void;
  /** Shows "No mode" while a mode is active. */
  onClear?: () => void;
  /** Called on Escape. */
  onClose?: () => void;
  /** The setting's name, used for the heading and accessible names. Defaults to "Mode". */
  label?: string;
  /** One line under the heading. */
  description?: React.ReactNode;
  /** The unavailable mode the person just tried, if any; its reason shows as an alert. */
  rejected?: ModeOption | null;
  showDescriptions?: boolean;
  /** Move focus to the active (or first) mode when it mounts. */
  autoFocus?: boolean;
  /** Show a close × ("Close") in the header, for a picker opened from Request settings with no chip beside it. Calls `onClose`. */
  showClose?: boolean;
}

/**
 * The picker surface the chip opens: a heading, one line on what a mode is,
 * the modes as rows, an alert when an unavailable mode was chosen, and "No
 * mode" to clear. A dialog; Escape closes it.
 */
export const ModesPicker = React.forwardRef<HTMLDivElement, ModesPickerProps>(
  (
    {
      modes,
      value,
      onSelect,
      onClear,
      onClose,
      label = "Mode",
      description = "How the agent approaches this request. Model and effort stay as they are.",
      rejected,
      showDescriptions = true,
      autoFocus = false,
      showClose = false,
      className,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const listRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      if (!autoFocus) return;
      const el =
        listRef.current?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]') ??
        listRef.current?.querySelector<HTMLElement>('[role="radio"]');
      el?.focus();
    }, [autoFocus]);
    const titleId = React.useId();
    return (
      <div
        ref={ref}
        role="dialog"
        aria-label={modesLabels.picker(label)}
        className={cn(
          "w-72 cursor-default select-text rounded-xl border border-border bg-background p-1.5 text-left font-normal text-foreground shadow-md animate-nx-fade-in motion-reduce:animate-none",
          className,
        )}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            onClose?.();
          }
        }}
        {...props}
      >
        <div className={cn("relative flex flex-col gap-0.5 px-2.5 pb-2 pt-1.5", showClose && "pr-10")}>
          <p id={titleId} className="text-sm font-semibold">
            {label}
          </p>
          {description != null && <p className="text-xs text-muted-foreground">{description}</p>}
          {showClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={modesLabels.close}
              onClick={onClose}
              className="absolute right-0 top-0 text-muted-foreground"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          )}
        </div>
        <ModesList
          ref={listRef}
          modes={modes}
          value={value}
          onSelect={onSelect}
          label={label}
          framed={false}
          showDescriptions={showDescriptions}
        />
        {rejected && (
          <p
            role="alert"
            className="mx-1 mt-1.5 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-foreground"
          >
            <Info aria-hidden="true" className="size-3.5 shrink-0 text-destructive" />
            {modesLabels.unavailable(rejected)}
          </p>
        )}
        {onClear && value != null && (
          <div className="px-1 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              {modesLabels.clear}
            </Button>
          </div>
        )}
      </div>
    );
  },
);
ModesPicker.displayName = "ModesPicker";

export interface ModesNoteProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shows an Undo button that restores the previous mode. */
  onUndo?: () => void;
}

/** The one quiet line after a change: "Mode changed to Balanced. Your text is unchanged." with Undo. */
export const ModesNote = React.forwardRef<HTMLDivElement, ModesNoteProps>(
  ({ onUndo, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 px-1 text-xs text-muted-foreground", className)}
      {...props}
    >
      <RefreshCw aria-hidden="true" className="size-3.5 shrink-0 text-brand" />
      <span className="min-w-0 flex-1">{children}</span>
      {onUndo && (
        <Button type="button" variant="link" size="sm" className="h-auto px-0 text-xs" onClick={onUndo}>
          {modesLabels.undo}
        </Button>
      )}
    </div>
  ),
);
ModesNote.displayName = "ModesNote";

/* ────────────────────────────────────────────────────────────
   Modes
   ──────────────────────────────────────────────────────────── */

export interface ModesSubmitDetails {
  /** The mode the request is sent with, or null for none. */
  mode: ModeOption | null;
}

export interface ModesProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onSubmit" | "onChange"> {
  /** The modes the product supports, in order. */
  modes: ModeOption[];
  /** Active mode id (controlled); null for none. */
  value?: string | null;
  /** Initial mode id when uncontrolled. Defaults to none. */
  defaultValue?: string | null;
  /** Called with the new mode id (null when cleared). */
  onValueChange?: (id: string | null, mode: ModeOption | null) => void;
  /** Presentation. Defaults to "composer" (the site's live preview). */
  variant?: ModesVariant;
  /** Whether the chip's picker is open (controlled). */
  open?: boolean;
  /** Initial picker state when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Allow clearing the mode (chip ×, "No mode"). Defaults to true. */
  clearable?: boolean;
  /** Show each mode's one-line description. Defaults to true. */
  showDescriptions?: boolean;
  /** The setting's name. Defaults to "Mode". */
  label?: string;
  /** Line under the picker heading. */
  pickerDescription?: string;
  /** Initial notice, e.g. to show a just-changed or refused state. */
  defaultNotice?: ModesNotice;
  /** Called when someone chooses a mode that can't be applied here. */
  onUnavailable?: (mode: ModeOption) => void;
  /** Composer text (controlled). The mode never changes it. */
  draft?: string;
  /** Initial composer text when uncontrolled. */
  defaultDraft?: string;
  onDraftChange?: (text: string) => void;
  /** Called when the person sends from the composer, with the active mode. Modes never sends on its own. */
  onSubmit?: (text: string, details: ModesSubmitDetails) => void;
  /** Composer placeholder. */
  placeholder?: string;
  /** Composer controls before the field (attach…). */
  composerLeading?: React.ReactNode;
  /** Composer controls after the mode chip (model chip, voice…). */
  composerActions?: React.ReactNode;
  /** Accessible name of the send button. Defaults to "Send". */
  sendLabel?: string;
  /**
   * "chip" (default): the Mode chip sits in the composer. "settings": no chip;
   * a Request settings control right after `composerLeading` lists Mode (with
   * its value) and opens the mode picker from that row.
   */
  trigger?: ModesTrigger;
  /** With `trigger="settings"`: the app's other request settings for the same menu (Tone, Style, Improve prompt…), merged in the site's order. */
  settingsItems?: RequestSettingsItem[];
  /** With `trigger="settings"`: called when one of `settingsItems` is chosen. */
  onSettingsSelect?: (id: string) => void;
}

/**
 * Modes lets someone choose how the agent works on a request — Fast,
 * Balanced, Deep research; or Brainstorm, Draft, Review, Plan — without
 * describing it every time. Each mode says what changes (and its expected
 * speed); the active one shows in the composer as a chip that can be changed
 * or cleared before sending; unavailable modes stay listed with the reason;
 * and a change adds one quiet line with Undo. Choosing a mode never touches
 * the prompt text, and nothing is sent until the person sends — `onSubmit`
 * receives the text with the mode.
 */
export const Modes = React.forwardRef<HTMLDivElement, ModesProps>(
  (
    {
      modes,
      value,
      defaultValue,
      onValueChange,
      variant = "composer",
      open,
      defaultOpen,
      onOpenChange,
      clearable = true,
      showDescriptions = true,
      label = "Mode",
      pickerDescription,
      defaultNotice,
      onUnavailable,
      draft: draftProp,
      defaultDraft = "",
      onDraftChange,
      onSubmit,
      placeholder = "Ask Aria…",
      composerLeading,
      composerActions,
      sendLabel = "Send",
      trigger = "chip",
      settingsItems,
      onSettingsSelect,
      className,
      ...props
    },
    ref,
  ) => {
    const s = useModes({
      modes,
      value,
      defaultValue,
      onValueChange,
      open,
      defaultOpen,
      onOpenChange,
      defaultNotice,
      onUnavailable,
    });
    const [internalDraft, setInternalDraft] = React.useState(defaultDraft);
    const draft = draftProp ?? internalDraft;
    const setDraft = (t: string) => {
      if (draftProp === undefined) setInternalDraft(t);
      onDraftChange?.(t);
    };

    const chipRef = React.useRef<HTMLButtonElement>(null);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const [userOpened, setUserOpened] = React.useState(false);
    useModesDismiss([anchorRef], s.open, () => s.setOpen(false));

    // Return focus to the chip after it re-renders (its element can change when a mode is set or cleared).
    const [refocus, setRefocus] = React.useState(0);
    React.useEffect(() => {
      if (refocus) chipRef.current?.focus();
    }, [refocus]);
    const choose = (id: string) => {
      const m = modes.find((x) => x.id === id);
      const wasOpen = s.open;
      s.select(id);
      if (wasOpen && m && !m.unavailable) setRefocus((n) => n + 1);
    };
    const clearMode = () => {
      s.clear();
      setRefocus((n) => n + 1);
    };
    const undoChange = () => {
      s.undo();
      setRefocus((n) => n + 1);
    };
    const closePicker = () => {
      s.setOpen(false);
      setRefocus((n) => n + 1);
    };
    const rejected =
      s.notice?.type === "unavailable" ? (modes.find((m) => m.id === (s.notice as { id: string }).id) ?? null) : null;
    const changedTo = s.notice?.type === "changed" ? s.mode : null;

    const note = changedTo ? (
      <ModesNote onUndo={undoChange}>{modesLabels.changed(changedTo)}</ModesNote>
    ) : null;
    const inlineAlert =
      rejected && !s.open ? (
        <p role="alert" className="flex items-center gap-2 px-1 text-xs text-foreground">
          <Info aria-hidden="true" className="size-3.5 shrink-0 text-destructive" />
          {modesLabels.unavailable(rejected)}
        </p>
      ) : null;

    const chip = (
      <div ref={trigger === "settings" ? undefined : anchorRef} className="relative">
        <ModesChip
          ref={chipRef}
          mode={s.mode}
          label={label}
          open={s.open}
          onClick={() => {
            setUserOpened(!s.open);
            s.setOpen(!s.open);
          }}
          onRemove={clearable ? clearMode : undefined}
        />
        {s.open && (
          <ModesPicker
            modes={modes}
            value={s.value}
            onSelect={choose}
            onClear={clearable ? clearMode : undefined}
            onClose={closePicker}
            label={label}
            description={pickerDescription}
            rejected={rejected}
            showDescriptions={showDescriptions}
            autoFocus={userOpened}
            className={cn("absolute bottom-full z-50 mb-2", variant === "chip" ? "left-0" : "right-0")}
          />
        )}
      </div>
    );

    const settings = (
      <div ref={trigger === "settings" ? anchorRef : undefined} className="relative">
        <RequestSettings
          ref={chipRef}
          items={mergeRequestSettingsItems(
            modesSettingsItem(label, s.mode, <SlidersHorizontal />),
            settingsItems,
          )}
          onSelect={(id) => {
            if (id !== "mode") return onSettingsSelect?.(id);
            setUserOpened(true);
            s.setOpen(true);
          }}
          onOpenChange={(o) => {
            if (o && s.open) s.setOpen(false);
          }}
        />
        {s.open && (
          <ModesPicker
            modes={modes}
            value={s.value}
            onSelect={choose}
            onClear={clearable ? clearMode : undefined}
            onClose={closePicker}
            label={label}
            description={pickerDescription}
            rejected={rejected}
            showDescriptions={showDescriptions}
            autoFocus={userOpened}
            showClose
            className="absolute bottom-full left-0 z-50 mb-2"
          />
        )}
      </div>
    );
    const control = trigger === "settings" ? settings : chip;

    const live = (
      <span role="status" aria-live="polite" className="sr-only">
        {s.announcement}
      </span>
    );

    const submit = () => {
      const text = draft.trim();
      if (!text) return;
      onSubmit?.(text, { mode: s.mode });
      s.dismissNotice();
      if (draftProp === undefined) setInternalDraft("");
    };

    if (variant === "segmented" || variant === "list") {
      return (
        <div ref={ref} className={cn("flex flex-col gap-2", variant === "segmented" && "items-start", className)} {...props}>
          {variant === "segmented" ? (
            <ModesSegmented modes={modes} value={s.value} onSelect={s.select} label={label} />
          ) : (
            <ModesList
              modes={modes}
              value={s.value}
              onSelect={s.select}
              label={label}
              showDescriptions={showDescriptions}
              className="w-full max-w-[30rem]"
            />
          )}
          {inlineAlert}
          {note}
          {live}
        </div>
      );
    }

    if (variant === "chip") {
      return (
        <div ref={ref} className={cn("inline-flex flex-col gap-2", className)} {...props}>
          {control}
          {note}
          {live}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("flex w-full max-w-[30rem] flex-col gap-3", className)} {...props}>
        <ModesSegmented modes={modes} value={s.value} onSelect={s.select} label={label} className="self-center" />
        <ModesList modes={modes} value={s.value} onSelect={s.select} label={label} showDescriptions={showDescriptions} />
        {inlineAlert}
        {note}
        <InputGroup className="h-10 rounded-[10px] bg-background pl-0.5 pr-1 shadow-sm">
          {(composerLeading != null || trigger === "settings") && (
            <InputGroupAddon align="inline-start" className="gap-1">
              {composerLeading}
              {trigger === "settings" && settings}
            </InputGroupAddon>
          )}
          <InputGroupInput
            value={draft}
            placeholder={placeholder}
            aria-label={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            className="h-full px-2 text-[13px]"
          />
          <InputGroupAddon align="inline-end" className="gap-1 text-muted-foreground">
            {trigger === "chip" && chip}
            {composerActions}
            <InputGroupButton
              size="icon-sm"
              aria-label={sendLabel}
              aria-keyshortcuts="Enter"
              disabled={!draft.trim()}
              onClick={submit}
              className="text-muted-foreground"
            >
              <Send className="size-3.5" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {live}
      </div>
    );
  },
);
Modes.displayName = "Modes";
