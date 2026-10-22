import * as React from "react";
import { Check, ChevronDown, Info, RefreshCw, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@nucleux/utils";
import {
  modeSupportingText,
  modesLabels,
  modesSettingsItem,
  useModes,
  useModesDismiss,
  useModesRoving,
  type ModeOption,
  type ModesChipProps,
  type ModesListProps,
  type ModesNoteProps,
  type ModesNotice,
  type ModesPickerProps,
  type ModesProps,
  type ModesSegmentedProps,
  type ModesSubmitDetails,
  type ModesTrigger,
  type ModesVariant,
} from "@nucleux/modes";
import { Md3RequestSettings, mergeRequestSettingsItems } from "@nucleux/md3-open-input";
import { Md3AgentComposer } from "@nucleux/md3-agent-composer";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Chip } from "@nucleux/md3-chip";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3Menu } from "@nucleux/md3-menu";
import { Md3SegmentedButton, Md3SegmentedButtonItem } from "@nucleux/md3-segmented-button";

export type Md3ModeOption = ModeOption;
export type Md3ModesNotice = ModesNotice;
export type Md3ModesVariant = ModesVariant;
export type Md3ModesTrigger = ModesTrigger;
export type Md3ModesSubmitDetails = ModesSubmitDetails;
export type Md3ModesProps = ModesProps;
export type Md3ModesSegmentedProps = ModesSegmentedProps;
export type Md3ModesListProps = ModesListProps;
export type Md3ModesChipProps = ModesChipProps;
export type Md3ModesPickerProps = ModesPickerProps;
export type Md3ModesNoteProps = ModesNoteProps;

const stateLayer =
  "before:pointer-events-none before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12] motion-reduce:before:transition-none";

/**
 * Material 3 segmented control for Modes: an outlined track of segments, the
 * active one in secondary-container with a check. Same radio group and keyboard
 * model as the shadcn `ModesSegmented` (Arrow keys move, Space/Enter choose).
 */
export const Md3ModesSegmented = React.forwardRef<HTMLDivElement, Md3ModesSegmentedProps>(
  ({ modes, value, onSelect, label = "Mode", className, ...props }, ref) => {
    const roving = useModesRoving(modes, value);
    return (
      <Md3SegmentedButton
        ref={ref}
        role="radiogroup"
        aria-label={label}
        value={value ?? ""}
        className={cn("divide-md-outline-variant border-md-outline-variant", className)}
        {...props}
      >
        {modes.map((m, i) => (
          <Md3SegmentedButtonItem
            key={m.id}
            value={m.id}
            icon={m.icon}
            role="radio"
            aria-checked={m.id === value}
            aria-pressed={undefined}
            aria-disabled={m.unavailable ? true : undefined}
            title={m.unavailable}
            {...roving.getItemProps(i)}
            onClick={() => onSelect(m.id)}
            className={cn("min-w-[5.5rem] motion-reduce:transition-none", m.unavailable && "cursor-not-allowed opacity-[0.38]")}
          >
            {m.shortName ?? m.name}
          </Md3SegmentedButtonItem>
        ))}
      </Md3SegmentedButton>
    );
  },
);
Md3ModesSegmented.displayName = "Md3ModesSegmented";

/**
 * Material 3 mode rows: a 40dp icon tile, the name and one line on what
 * changes; the active row in secondary-container with a primary tile and a
 * trailing check; an unavailable row dimmed with its reason. Same radio group
 * and keyboard model as the shadcn `ModesList`.
 */
export const Md3ModesList = React.forwardRef<HTMLDivElement, Md3ModesListProps>(
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
          "flex flex-col gap-0.5",
          framed && "rounded-md-lg border border-md-outline-variant bg-md-surface p-2",
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
                "relative flex min-h-14 w-full items-center gap-3 overflow-hidden rounded-md-md px-3 py-2.5 text-left transition-colors motion-reduce:transition-none",
                stateLayer,
                "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-md-primary",
                on ? "bg-md-secondary-container text-md-on-secondary-container" : "text-md-on-surface",
                m.unavailable && "cursor-not-allowed",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "relative grid size-10 shrink-0 place-items-center rounded-md-md text-base [&_svg]:size-[22px]",
                  on ? "bg-md-primary text-md-on-primary" : "bg-md-surface-container-high text-md-on-surface-variant",
                  m.unavailable && "opacity-[0.55]",
                )}
              >
                {m.icon}
              </span>
              <span className="relative flex min-w-0 flex-1 flex-col gap-0.5">
                <span id={`${descId}-n`} className={cn("text-sm font-medium leading-5", m.unavailable && "opacity-[0.55]")}>
                  {m.name}
                </span>
                {(support || m.unavailable) && (
                  <span id={descId} className="flex flex-col gap-0.5 text-xs leading-[18px]">
                    {support && (
                      <span className={cn(on ? "text-current" : "text-md-on-surface-variant", m.unavailable && "opacity-[0.55]")}>
                        {support}
                      </span>
                    )}
                    {m.unavailable && (
                      <span className="inline-flex items-center gap-1 text-md-on-surface">
                        <Info aria-hidden="true" className="size-3.5 shrink-0" />
                        {m.unavailable}
                      </span>
                    )}
                  </span>
                )}
              </span>
              {on && <Check aria-hidden="true" className="relative size-[22px] shrink-0 text-md-on-secondary-container" />}
            </button>
          );
        })}
      </div>
    );
  },
);
Md3ModesList.displayName = "Md3ModesList";

/**
 * The Material 3 Mode chip in the composer's settings row. Unset it is an
 * outlined assist chip ("Mode ▾"); set it becomes a tonal chip reading
 * "Mode **Plan**" with the mode's icon, a chevron that turns when open, and a
 * × that clears it. Same accessible names as the shadcn `ModesChip`.
 */
export const Md3ModesChip = React.forwardRef<HTMLButtonElement, Md3ModesChipProps>(
  ({ mode, label = "Mode", open = false, onRemove, className, ...props }, ref) => {
    const chevron = (
      <ChevronDown
        aria-hidden="true"
        className={cn("relative -mr-1 size-[18px] transition-transform motion-reduce:transition-none", open && "rotate-180")}
      />
    );
    if (!mode) {
      return (
        <Md3Chip
          ref={ref}
          variant="assist"
          icon={<SlidersHorizontal aria-hidden="true" />}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={modesLabels.chip(label, null)}
          className={cn("shrink-0 border-md-outline-variant font-normal [&_svg]:size-4", open && "border-md-primary", className)}
          {...props}
        >
          <span className="inline-flex items-center gap-1.5">
            {label}
            {chevron}
          </span>
        </Md3Chip>
      );
    }
    return (
      <span
        className={cn(
          "inline-flex h-8 shrink-0 items-center rounded-md-sm bg-md-secondary-container text-md-on-secondary-container animate-nx-fade-in motion-reduce:animate-none",
          className,
        )}
      >
        <Md3Chip
          ref={ref}
          variant="assist"
          selected
          icon={mode.icon}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={modesLabels.chip(label, mode)}
          className={cn("bg-transparent pl-2 font-normal [&_svg]:size-4", onRemove ? "rounded-r-none pr-1.5" : "pr-2.5")}
          {...props}
        >
          <span className="inline-flex items-center gap-1.5">
            <span>{label}</span>
            <span className="max-w-[18ch] truncate font-semibold">{mode.shortName ?? mode.name}</span>
            {chevron}
          </span>
        </Md3Chip>
        {onRemove && (
          <Md3IconButton
            aria-label={modesLabels.remove(label, mode)}
            onClick={onRemove}
            className="h-8 w-7 rounded-none rounded-r-md-sm pr-1 text-current focus-visible:ring-offset-0 [&_svg]:size-3.5"
          >
            <X aria-hidden="true" />
          </Md3IconButton>
        )}
      </span>
    );
  },
);
Md3ModesChip.displayName = "Md3ModesChip";

/**
 * The Material 3 Mode picker: a menu surface with "Mode" and one line on what
 * a mode is, the mode rows, an error-container alert when an unavailable mode
 * was chosen, and a "No mode" text button. A dialog; Escape closes it.
 */
export const Md3ModesPicker = React.forwardRef<HTMLDivElement, Md3ModesPickerProps>(
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
    return (
      <Md3Menu
        ref={ref}
        role="dialog"
        aria-label={modesLabels.picker(label)}
        className={cn(
          "min-w-[18rem] rounded-md-lg border border-md-outline-variant bg-md-surface p-2 shadow-md-2 animate-nx-fade-in motion-reduce:animate-none",
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
        <div className={cn("relative flex flex-col gap-0.5 px-3 pb-2 pt-2.5", showClose && "pr-12")}>
          <p className="text-base font-medium leading-6 text-md-on-surface">{label}</p>
          {description != null && <p className="text-xs leading-[18px] text-md-on-surface-variant">{description}</p>}
          {showClose && (
            <Md3IconButton aria-label={modesLabels.close} onClick={onClose} className="absolute right-0 top-0">
              <X aria-hidden="true" />
            </Md3IconButton>
          )}
        </div>
        <Md3ModesList
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
            className="mx-2 mb-1 mt-2 flex items-center gap-2 rounded-md-md bg-md-error-container px-3 py-2 text-[13px] leading-5 text-md-on-error-container"
          >
            <Info aria-hidden="true" className="size-[18px] shrink-0" />
            {modesLabels.unavailable(rejected)}
          </p>
        )}
        {onClear && value != null && (
          <div className="mx-1 mt-1.5">
            <Md3Button variant="text" onClick={onClear}>
              {modesLabels.clear}
            </Md3Button>
          </div>
        )}
      </Md3Menu>
    );
  },
);
Md3ModesPicker.displayName = "Md3ModesPicker";

/** The one quiet line after a change, with a primary sync icon and an Undo text button. */
export const Md3ModesNote = React.forwardRef<HTMLDivElement, Md3ModesNoteProps>(
  ({ onUndo, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 px-2 text-[13px] leading-5 text-md-on-surface-variant animate-nx-fade-in motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <RefreshCw aria-hidden="true" className="size-[18px] shrink-0 text-md-primary" />
      <span className="min-w-0 flex-1">{children}</span>
      {onUndo && (
        <Md3Button variant="text" onClick={onUndo} className="h-8 px-2">
          {modesLabels.undo}
        </Md3Button>
      )}
    </div>
  ),
);
Md3ModesNote.displayName = "Md3ModesNote";

/**
 * Material 3 Modes: choose how the agent approaches a request — Brainstorm,
 * Draft, Review, Plan — separate from which model answers. A Mode chip in the
 * composer's settings row opens a short list where each mode says what changes
 * and an unavailable one says why; the chip then reads "Mode Plan" with a way
 * to change or clear it, and a change adds one quiet line with Undo. Same API,
 * states, keyboard model and accessible names as `Modes` from
 * `@nucleux/modes`; choosing a mode never touches the text, and nothing is
 * sent until the person sends.
 */
export const Md3Modes = React.forwardRef<HTMLDivElement, Md3ModesProps>(
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
      sendLabel: _sendLabel,
      trigger = "chip",
      settingsItems,
      onSettingsSelect,
      onAdd,
      addLabel,
      add,
      model,
      onVoice,
      voiceLabel,
      className,
      ...props
    },
    ref,
  ) => {
    void _sendLabel; // Md3AgentComposer names its send button "Send".
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
    const chipBoxRef = React.useRef<HTMLDivElement>(null);
    const pickerRef = React.useRef<HTMLDivElement>(null);
    const [userOpened, setUserOpened] = React.useState(false);
    useModesDismiss([chipBoxRef, pickerRef], s.open, () => s.setOpen(false));

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
    const notice = s.notice;
    const rejected = notice?.type === "unavailable" ? (modes.find((m) => m.id === notice.id) ?? null) : null;
    const changedTo = notice?.type === "changed" ? s.mode : null;

    const note = changedTo ? <Md3ModesNote onUndo={undoChange}>{modesLabels.changed(changedTo)}</Md3ModesNote> : null;
    const inlineAlert =
      rejected && !s.open ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-md-md bg-md-error-container px-3 py-2 text-[13px] leading-5 text-md-on-error-container"
        >
          <Info aria-hidden="true" className="size-[18px] shrink-0" />
          {modesLabels.unavailable(rejected)}
        </p>
      ) : null;

    const chip = (
      <div ref={chipBoxRef} className="inline-flex">
        <Md3ModesChip
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
      </div>
    );
    const settings = (
      <div ref={chipBoxRef} className="inline-flex">
        <Md3RequestSettings
          ref={chipRef}
          items={mergeRequestSettingsItems(modesSettingsItem(label, s.mode, <SlidersHorizontal />), settingsItems)}
          onSelect={(id) => {
            if (id !== "mode") return onSettingsSelect?.(id);
            setUserOpened(true);
            s.setOpen(true);
          }}
          onOpenChange={(o) => {
            if (o && s.open) s.setOpen(false);
          }}
          className={variant === "composer" ? "static [&>[role=menu]]:left-10" : undefined}
        />
      </div>
    );
    const control = trigger === "settings" ? settings : chip;

    const picker = s.open ? (
      <Md3ModesPicker
        ref={pickerRef}
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
        showClose={trigger === "settings"}
        className={cn(
          "absolute z-50",
          variant === "chip" ? "bottom-full left-0 mb-2 w-[22rem]" : "inset-x-0 bottom-full mb-2",
        )}
      />
    ) : null;

    const live = (
      <span role="status" aria-live="polite" className="sr-only">
        {s.announcement}
      </span>
    );

    if (variant === "segmented" || variant === "list") {
      return (
        <div ref={ref} className={cn("flex flex-col gap-2", variant === "segmented" && "items-start", className)} {...props}>
          {variant === "segmented" ? (
            <Md3ModesSegmented modes={modes} value={s.value} onSelect={s.select} label={label} />
          ) : (
            <Md3ModesList
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
        <div ref={ref} className={cn("relative inline-flex flex-col items-start gap-2", className)} {...props}>
          {control}
          {picker}
          {note}
          {live}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("relative flex w-full max-w-[38rem] flex-col gap-2", className)} {...props}>
        {picker}
        {note}
        <Md3AgentComposer
          value={draft}
          onValueChange={setDraft}
          onSubmit={(text) => {
            onSubmit?.(text, { mode: s.mode });
            s.dismissNotice();
            if (draftProp === undefined) setInternalDraft("");
          }}
          placeholder={placeholder}
          leftActions={
            trigger === "settings" ? (
              <>
                {composerLeading}
                {settings}
              </>
            ) : (
              composerLeading
            )
          }
          rightActions={
            <>
              {trigger === "chip" && chip}
              {composerActions}
            </>
          }
          onAdd={onAdd}
          addLabel={addLabel}
          add={add}
          model={model}
          onVoice={onVoice}
          voiceLabel={voiceLabel}
          className="relative"
        />
        {live}
      </div>
    );
  },
);
Md3Modes.displayName = "Md3Modes";
