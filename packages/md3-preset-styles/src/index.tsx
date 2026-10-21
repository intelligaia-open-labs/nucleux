import * as React from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  ImageIcon,
  Palette,
  PenLine,
  Plus,
  RotateCcw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@nucleux/utils";
import {
  presetStylesCopy,
  usePresetStyles,
  type PresetStyle,
  type PresetStyleDraft,
  type PresetStyleReference,
  type PresetStyleRequest,
  type PresetStyleSource,
  type PresetStyleSwatch,
  type PresetStylesNotice,
  type PresetStylesProps,
  type PresetStylesState,
  type PresetStylesTrigger,
  type PresetStylesVariant,
  type PresetStylesView,
} from "@nucleux/preset-styles";
import { Md3AgentComposer } from "@nucleux/md3-agent-composer";
import { Md3RequestSettings } from "@nucleux/md3-open-input";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Card } from "@nucleux/md3-card";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3LinearProgress } from "@nucleux/md3-progress";
import { Md3SegmentedButton, Md3SegmentedButtonItem } from "@nucleux/md3-segmented-button";
import { Md3TextField } from "@nucleux/md3-text-field";

/** Props of {@link Md3PresetStyles} — identical to `PresetStylesProps` from `@nucleux/preset-styles`. */
export type Md3PresetStylesProps = PresetStylesProps;
/** "grid", "list" or "menu". */
export type Md3PresetStylesVariant = PresetStylesVariant;
/** "chip" or "settings". */
export type Md3PresetStylesTrigger = PresetStylesTrigger;
/** "closed", "menu", "create" or "review". */
export type Md3PresetStylesView = PresetStylesView;
/** "applied" or "reset". */
export type Md3PresetStylesNotice = PresetStylesNotice;
/** One preset style. */
export type Md3PresetStyle = PresetStyle;
/** Swatch tone, mapped onto M3 container roles. */
export type Md3PresetStyleSwatch = PresetStyleSwatch;
/** The attached reference image. */
export type Md3PresetStyleReference = PresetStyleReference;
/** What `onGenerateStyle` receives. */
export type Md3PresetStyleRequest = PresetStyleRequest;
/** What `onGenerateStyle` returns. */
export type Md3PresetStyleDraft = PresetStyleDraft;
/** "example" or "description". */
export type Md3PresetStyleSource = PresetStyleSource;

// The shadcn tones on M3 container roles (Material has no yellow; secondary stands in).
const tile: Record<PresetStyleSwatch, string> = {
  destructive: "from-md-error-container to-md-error/25",
  info: "from-md-primary-container to-md-primary/25",
  success: "from-md-tertiary-container to-md-tertiary/25",
  warning: "from-md-secondary-container to-md-secondary/30",
  brand: "from-md-primary-container to-md-inverse-primary",
  neutral: "from-md-surface-container to-md-surface-container-high",
};
const dot: Record<PresetStyleSwatch, string> = {
  destructive: "bg-md-error",
  info: "bg-md-primary",
  success: "bg-md-tertiary",
  warning: "bg-md-secondary",
  brand: "bg-md-primary",
  neutral: "bg-md-inverse-surface",
};

const stateLayer =
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] active:before:opacity-[0.12] motion-reduce:before:transition-none";
const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface";
const overline = "text-[11.5px] font-semibold uppercase leading-4 tracking-[0.06em] text-md-on-surface-variant";
const link = cn(
  "relative inline-flex min-h-8 items-center gap-1 rounded-full px-2.5 text-[13px] font-medium text-md-primary [&_svg]:size-[18px]",
  stateLayer,
  "outline-none focus-visible:ring-2 focus-visible:ring-md-primary",
);

function Swatch({ style, on }: { style: PresetStyle; on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block aspect-square w-full overflow-hidden rounded-md-md bg-gradient-to-br transition-[border-color,border-width] motion-reduce:transition-none",
        tile[style.swatch ?? "neutral"],
        on ? "border-[3px] border-md-primary" : "border border-md-outline-variant",
      )}
    >
      {style.image && <img src={style.image} alt="" className="size-full object-cover" />}
    </span>
  );
}

function ReferenceZone({ s }: { s: PresetStylesState }) {
  const ref = s.reference;
  return (
    <div
      {...s.referenceDropProps}
      className={cn(
        "flex items-center gap-3 rounded-md-md border border-dashed border-md-outline p-3 transition-colors",
        s.dragging && "border-md-primary bg-md-secondary-container/40",
      )}
    >
      <input {...s.referenceInputProps} aria-label="Reference image" />
      <button
        type="button"
        onClick={s.openReferencePicker}
        className={cn("relative flex min-w-0 flex-1 items-center gap-3 rounded-md-sm text-left", focusRing)}
      >
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md-sm bg-md-surface-container-high text-md-on-surface-variant"
        >
          {ref?.src ? <img src={ref.src} alt="" className="size-full object-cover" /> : <ImageIcon className="size-5" />}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-medium text-md-on-surface">
            {ref ? presetStylesCopy.matchAttached : presetStylesCopy.matchTitle}
          </span>
          <span className="truncate text-xs text-md-on-surface-variant">
            {ref ? `${ref.name} · drop to replace` : presetStylesCopy.matchSub}
          </span>
        </span>
      </button>
      {ref && (
        <Md3IconButton aria-label={`Remove ${ref.name}`} onClick={() => s.attachReference(null)} className="shrink-0">
          <X />
        </Md3IconButton>
      )}
    </div>
  );
}

function LockLine({ s, scope }: { s: PresetStylesState; scope: string }) {
  const name = <strong className="font-medium text-md-on-surface">{s.currentStyle?.name}</strong>;
  return (
    <div className="flex items-center gap-2 rounded-md-md bg-md-surface-container-low px-3 py-1.5 text-[13px] text-md-on-surface-variant">
      <Palette aria-hidden="true" className="size-[18px] shrink-0 text-md-primary" />
      <span className="min-w-0 flex-1" aria-live="polite">
        {s.locked ? (
          <>
            Style locked to {name} for {scope}
          </>
        ) : (
          <>{name} applies to the next generation only</>
        )}
      </span>
      <button type="button" onClick={() => s.setLocked(!s.locked)} className={cn(link, "shrink-0")}>
        {s.locked ? "Unlock" : `Lock for ${scope}`}
      </button>
    </div>
  );
}

function Preview({ style, prompt, id, fill }: {
  style?: { name: string; sample?: string; description?: string };
  prompt?: string;
  id?: string;
  fill?: boolean;
}) {
  return (
    <div
      id={id}
      aria-live={id ? "polite" : undefined}
      className={cn("flex flex-col gap-2.5 rounded-md-lg bg-md-on-surface/[0.04] px-4 py-3.5", fill && "self-stretch")}
    >
      <p className={overline}>Preview · {style?.name}</p>
      {prompt && (
        <p className="max-w-[90%] self-end rounded-[14px_14px_4px_14px] bg-md-secondary-container px-3 py-1.5 text-[12.5px] leading-[18px] text-md-on-secondary-container">
          {prompt}
        </p>
      )}
      <p className="text-[13.5px] leading-[21px] text-md-on-surface">{style?.sample ?? style?.description}</p>
    </div>
  );
}

function Trigger({ s }: { s: PresetStylesState }) {
  const chev = (
    <ChevronDown
      aria-hidden="true"
      className={cn("relative -mr-0.5 transition-transform motion-reduce:transition-none", s.open && "rotate-180")}
    />
  );
  if (!s.isSet) {
    return (
      <button
        ref={s.triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={s.open}
        onClick={s.toggleMenu}
        className={cn(
          "relative inline-flex h-8 shrink-0 items-center gap-1.5 overflow-hidden rounded-md-sm border pl-2 pr-2.5 text-[13px] font-medium text-md-on-surface-variant [&_svg]:size-[18px]",
          s.open ? "border-md-primary" : "border-md-outline-variant",
          stateLayer,
          focusRing,
        )}
      >
        <PenLine aria-hidden="true" className="relative" />
        <span className="relative">Style</span>
        {chev}
      </button>
    );
  }
  const name = s.currentStyle?.name ?? "";
  return (
    <span className="inline-flex h-8 shrink-0 items-center rounded-md-sm bg-md-secondary-container text-md-on-secondary-container animate-nx-fade-in motion-reduce:animate-none">
      <button
        ref={s.triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={s.open}
        aria-label={`Style ${name} — change`}
        onClick={s.toggleMenu}
        className={cn(
          "relative inline-flex h-full items-center gap-1.5 rounded-l-md-sm pl-2 pr-1.5 text-[13px] [&_svg]:size-[18px]",
          stateLayer,
          focusRing,
        )}
      >
        <PenLine aria-hidden="true" className="relative" />
        <span className="relative">Style</span>
        <span className="relative max-w-[18ch] truncate font-semibold">{name}</span>
        {chev}
      </button>
      <button
        type="button"
        aria-label={`Remove style ${name}`}
        onClick={s.reset}
        className={cn("relative inline-flex h-full w-7 items-center justify-center rounded-r-md-sm pr-1", stateLayer, focusRing)}
      >
        <X aria-hidden="true" className="relative size-4" />
      </button>
    </span>
  );
}

function Menu({ s, label, description, showPreview, previewPrompt, showClose }: {
  s: PresetStylesState;
  label: string;
  description: string;
  showPreview: boolean;
  previewPrompt?: string;
  /** A close × in the header, when the menu opened from Request settings. */
  showClose?: boolean;
}) {
  const titleId = `${s.ids}-menu-title`;
  const descId = `${s.ids}-menu-desc`;
  const prevId = `${s.ids}-preview`;
  const row = (st: PresetStyle) => {
    const on = st.id === s.current;
    const peek = st.id === s.peek && !on;
    return (
      <button
        key={st.id}
        type="button"
        role="radio"
        aria-checked={on}
        data-style-id={st.id}
        tabIndex={on ? 0 : -1}
        aria-describedby={showPreview ? prevId : undefined}
        onMouseEnter={() => s.setPeek(st.id)}
        onFocus={() => s.setPeek(st.id)}
        onClick={() => s.select(st.id)}
        className={cn(
          "relative flex min-h-[52px] w-full items-center gap-3 rounded-md-lg px-3 py-2 text-left",
          "outline-none focus-visible:ring-2 focus-visible:ring-md-primary",
          on
            ? "bg-md-secondary-container text-md-on-secondary-container"
            : cn("text-md-on-surface", peek && "bg-md-on-surface/[0.06]", stateLayer),
        )}
      >
        <span className="relative flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-1.5 text-[14.5px] font-medium leading-5">
            {st.name}
            {st.custom && (
              <span className="inline-flex items-center gap-1 rounded-md-sm bg-md-surface-container-high px-2 py-0.5 text-[11.5px] font-medium text-md-on-surface-variant">
                <Sparkles aria-hidden="true" className="size-3.5" />
                {presetStylesCopy.fromWriting}
              </span>
            )}
          </span>
          {st.description && (
            <span className={cn("text-[12.5px] leading-[18px]", on ? "text-current" : "text-md-on-surface-variant")}>
              {st.description}
            </span>
          )}
        </span>
        {on && <Check aria-hidden="true" className="relative size-[22px] shrink-0" />}
      </button>
    );
  };
  return (
    <div
      ref={s.menuRef}
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="absolute bottom-full left-0 z-50 mb-2 flex w-full min-w-[min(36rem,calc(100vw-2rem))] flex-col rounded-md-lg border border-md-outline-variant bg-md-surface p-2 text-md-on-surface shadow-md-2 animate-nx-fade-in motion-reduce:animate-none"
    >
      <div className={cn("relative flex flex-col gap-0.5 px-3 pb-2 pt-2.5", showClose && "pr-12")}>
        {showClose && (
          <Md3IconButton aria-label="Close" onClick={() => s.closeMenu()} className="absolute right-0 top-0">
            <X aria-hidden="true" />
          </Md3IconButton>
        )}
        <p id={titleId} className="text-base font-medium leading-6 text-md-on-surface">
          {label}
        </p>
        <p id={descId} className="text-[12.5px] leading-[18px] text-md-on-surface-variant">
          {description}
        </p>
      </div>
      <div className={cn("grid gap-2.5 px-1", showPreview && "sm:grid-cols-2")}>
        <div
          ref={s.listRef}
          role="radiogroup"
          aria-label="Style"
          onKeyDown={s.onMenuKeyDown}
          className="flex flex-col gap-0.5"
        >
          {s.presets.map(row)}
          {s.mine.length > 0 && (
            <>
              <p className={cn(overline, "px-3 pb-1 pt-3")}>{presetStylesCopy.yourStyles}</p>
              {s.mine.map(row)}
            </>
          )}
        </div>
        {showPreview && <Preview id={prevId} style={s.previewStyle} prompt={previewPrompt} fill />}
      </div>
      {s.canCreate && (
        <div className="mx-2 mt-2 border-t border-md-outline-variant pt-1.5">
          <button type="button" onClick={s.startCreate} className={link}>
            <Plus aria-hidden="true" className="relative" />
            <span className="relative">{presetStylesCopy.create}</span>
          </button>
        </div>
      )}
    </div>
  );
}

const cardBase =
  "flex flex-col gap-3.5 rounded-md-lg px-5 py-[18px] outline-none animate-nx-fade-in motion-reduce:animate-none";
const areaClass =
  "w-full resize-y rounded-t-md-xs border-0 border-b-2 border-md-on-surface-variant bg-md-surface-container-high px-4 py-3 text-sm leading-[22px] text-md-on-surface outline-none transition-colors focus:border-md-primary";
const areaLabel = "text-xs font-medium text-md-on-surface-variant";

function CreateCard({ s }: { s: PresetStylesState }) {
  const titleId = `${s.ids}-create`;
  const fieldId = `${s.ids}-source`;
  const busy = s.status === "busy";
  return (
    <Md3Card
      ref={s.cardRef as React.Ref<HTMLDivElement>}
      variant="outlined"
      tabIndex={-1}
      role="region"
      aria-labelledby={titleId}
      className={cardBase}
    >
      <div className="flex flex-col gap-1">
        <p id={titleId} className="text-base font-medium leading-6 text-md-on-surface">
          {presetStylesCopy.createTitle}
        </p>
        <p className="text-[13px] leading-5 text-md-on-surface-variant">{presetStylesCopy.createSub(s.agentName)}</p>
      </div>
      <Md3SegmentedButton
        aria-label="Start from"
        value={s.source}
        onValueChange={(v) => {
          if (v === "example" || v === "description") s.setSource(v);
        }}
        className="self-start"
      >
        <Md3SegmentedButtonItem value="example" icon={<FileText />}>
          An example
        </Md3SegmentedButtonItem>
        <Md3SegmentedButtonItem value="description" icon={<PenLine />}>
          A description
        </Md3SegmentedButtonItem>
      </Md3SegmentedButton>
      {s.source === "example" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={fieldId} className={areaLabel}>
            Paste writing you like
          </label>
          <textarea
            id={fieldId}
            rows={4}
            value={s.example}
            onChange={(e) => s.setExample(e.target.value)}
            className={areaClass}
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={s.exampleFileRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,text/plain"
              tabIndex={-1}
              aria-hidden="true"
              aria-label="Example file"
              className="sr-only"
              onChange={(e) => {
                s.setExampleFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            <button type="button" onClick={() => s.exampleFileRef.current?.click()} className={link}>
              <Upload aria-hidden="true" className="relative" />
              <span className="relative">{s.exampleFile ? `Use “${s.exampleFile.name}”` : "Upload a file"}</span>
            </button>
            <span className="text-xs text-md-on-surface-variant">PDF, DOC or TXT. Used only to make this style.</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={fieldId} className={areaLabel}>
            Describe the style
          </label>
          <textarea
            id={fieldId}
            rows={3}
            value={s.describe}
            onChange={(e) => s.setDescribe(e.target.value)}
            className={areaClass}
          />
        </div>
      )}
      {busy && (
        <div role="status" className="flex flex-col gap-1.5">
          <Md3LinearProgress aria-label="Generating a style" />
          <span className="text-xs text-md-on-surface-variant">Generating a style…</span>
        </div>
      )}
      {s.status === "error" && (
        <p role="alert" className="rounded-md-md bg-md-error-container px-3 py-2 text-sm text-md-on-error-container">
          {presetStylesCopy.generateError}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Md3Button variant="text" onClick={s.openMenu}>
          Back
        </Md3Button>
        <Md3Button
          variant="filled"
          onClick={s.generate}
          disabled={!s.canGenerate}
          aria-busy={busy || undefined}
          icon={s.status === "error" ? <RotateCcw /> : <Sparkles />}
          className="ml-auto"
        >
          {busy ? "Generating…" : s.status === "error" ? "Try again" : "Generate style"}
        </Md3Button>
      </div>
    </Md3Card>
  );
}

function ReviewCard({ s, previewPrompt }: { s: PresetStylesState; previewPrompt?: string }) {
  const d = s.draft;
  if (!d) return null;
  const titleId = `${s.ids}-review`;
  const instId = `${s.ids}-inst`;
  const set = (patch: Partial<typeof d>) => s.setDraft({ ...d, ...patch });
  return (
    <Md3Card
      ref={s.cardRef as React.Ref<HTMLDivElement>}
      variant="outlined"
      tabIndex={-1}
      role="region"
      aria-labelledby={titleId}
      className={cardBase}
    >
      <p id={titleId} className={cn(overline, "flex items-center gap-1.5")}>
        <Sparkles aria-hidden="true" className="size-4 text-md-primary" />
        {presetStylesCopy.generated(s.agentName)}
      </p>
      <Md3TextField
        id={`${s.ids}-name`}
        label="Style name"
        value={d.name}
        onChange={(e) => set({ name: e.target.value })}
        error={!d.name.trim()}
      />
      <Md3TextField
        id={`${s.ids}-what`}
        label="What it changes"
        value={d.description}
        onChange={(e) => set({ description: e.target.value })}
      />
      <div className="flex flex-col gap-2">
        <button
          type="button"
          aria-expanded={s.instructionsOpen}
          aria-controls={instId}
          onClick={() => s.setInstructionsOpen(!s.instructionsOpen)}
          className={cn(link, "self-start")}
        >
          {s.instructionsOpen ? (
            <ChevronDown aria-hidden="true" className="relative" />
          ) : (
            <ChevronRight aria-hidden="true" className="relative" />
          )}
          <span className="relative">Instructions behind it</span>
        </button>
        {s.instructionsOpen && (
          <div id={instId} className="flex flex-col gap-1.5">
            <label htmlFor={`${instId}-t`} className={areaLabel}>
              Instructions
            </label>
            <textarea
              id={`${instId}-t`}
              rows={4}
              value={d.instructions}
              onChange={(e) => set({ instructions: e.target.value })}
              className={areaClass}
            />
          </div>
        )}
      </div>
      <Preview style={{ name: d.name, sample: d.sample, description: d.description }} prompt={previewPrompt} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Md3Button variant="text" onClick={s.backToCreate}>
          Back
        </Md3Button>
        <span className="ml-auto flex flex-wrap gap-2">
          <Md3Button variant="outlined" onClick={() => s.save(false)} disabled={!d.name.trim()}>
            Save
          </Md3Button>
          <Md3Button variant="filled" onClick={() => s.save(true)} disabled={!d.name.trim()}>
            Save and use
          </Md3Button>
        </span>
      </div>
    </Md3Card>
  );
}

/**
 * The Material 3 twin of `PresetStyles` — same props, states, keyboard model
 * and accessible names (they share `usePresetStyles`). In `variant="menu"` the
 * Style control sits in `Md3AgentComposer`'s toolbar and opens "Use style": a
 * menu surface with the styles on the left (secondary-container for the chosen
 * one, a state layer for the one being previewed) and a sample reply on the
 * right that follows pointer and focus; Create & edit styles opens an outlined
 * card with a segmented "Start from", a linear progress while the app
 * generates, then a review card with filled text fields and Save / Save and
 * use. `"grid"` and `"list"` draw the swatches on M3 container roles with a
 * primary outline for the chosen one. Motion is reduced under
 * `prefers-reduced-motion`.
 */
export const Md3PresetStyles = React.forwardRef<HTMLDivElement, Md3PresetStylesProps>((props, ref) => {
  const {
    styles: _styles,
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    variant = "grid",
    label: labelProp,
    description: descriptionProp,
    baseStyle: _baseStyle,
    agentName: _agentName,
    lockable = false,
    locked: _locked,
    defaultLocked: _defaultLocked,
    onLockedChange: _onLockedChange,
    lockScope = presetStylesCopy.lockScope,
    allowReference = false,
    reference: _reference,
    defaultReference: _defaultReference,
    onReferenceChange: _onReferenceChange,
    defaultView: _defaultView,
    onViewChange: _onViewChange,
    showPreview = true,
    defaultPreview: _defaultPreview,
    previewPrompt,
    scope: _scope,
    earlierReplies: _earlierReplies,
    defaultNotice: _defaultNotice,
    onGenerateStyle: _onGenerateStyle,
    onSaveStyle: _onSaveStyle,
    defaultGenerated: _defaultGenerated,
    withComposer = true,
    message: _message,
    defaultMessage: _defaultMessage,
    onMessageChange: _onMessageChange,
    onSubmit: _onSubmit,
    placeholder = presetStylesCopy.placeholder,
    composerLeading,
    composerActions,
    trigger: triggerMode = "chip",
    settingsItems: _settingsItems,
    onSettingsSelect: _onSettingsSelect,
    className,
    ...rest
  } = props;
  const s = usePresetStyles(props);
  const label = labelProp ?? (variant === "menu" ? presetStylesCopy.menuLabel : presetStylesCopy.gridLabel);
  const labelId = `${s.ids}-label`;

  if (variant === "menu") {
    const description = descriptionProp ?? presetStylesCopy.menuDescription(s.agentName);
    const settingsControl = triggerMode === "settings";
    const trigger = settingsControl ? (
      <Md3RequestSettings
        ref={s.triggerRef}
        items={s.settingsItems(<PenLine />)}
        onSelect={s.onSettingsSelect}
        onOpenChange={s.onSettingsOpenChange}
        className={withComposer ? "static [&>[role=menu]]:left-10" : undefined}
      />
    ) : (
      <Trigger s={s} />
    );
    return (
      <div
        ref={ref}
        className={cn("relative flex flex-col gap-2", withComposer ? "w-full" : "inline-flex", className)}
        {...rest}
      >
        {s.open && (
          <Menu
            s={s}
            label={label}
            description={description}
            showPreview={showPreview}
            previewPrompt={previewPrompt}
            showClose={triggerMode === "settings"}
          />
        )}
        {s.view === "create" && <CreateCard s={s} />}
        {s.view === "review" && <ReviewCard s={s} previewPrompt={previewPrompt} />}
        <div
          role="status"
          className={
            s.noticeText
              ? "flex flex-wrap items-center gap-2 px-1.5 text-[13px] leading-5 text-md-on-surface-variant animate-nx-fade-in motion-reduce:animate-none"
              : "sr-only"
          }
        >
          {s.noticeText && (
            <>
              {s.notice?.kind === "reset" ? (
                <Check aria-hidden="true" className="size-[18px] shrink-0 text-md-primary" />
              ) : (
                <PenLine aria-hidden="true" className="size-[18px] shrink-0 text-md-primary" />
              )}
              <span className="min-w-0 flex-1">{s.noticeText}</span>
              {s.canUndo && (
                <button type="button" onClick={s.undo} className={link}>
                  <span className="relative">Undo</span>
                </button>
              )}
            </>
          )}
        </div>
        {withComposer ? (
          <Md3AgentComposer
            placeholder={placeholder}
            value={s.message}
            onValueChange={s.setMessage}
            onSubmit={s.submit}
            leftActions={
              composerLeading != null || settingsControl ? (
                <>
                  {composerLeading}
                  {settingsControl && trigger}
                </>
              ) : undefined
            }
            rightActions={
              <>
                {!settingsControl && trigger}
                {composerActions}
              </>
            }
            className={settingsControl ? "relative" : undefined}
          />
        ) : (
          trigger
        )}
      </div>
    );
  }

  return (
    <Md3Card
      ref={ref}
      variant="outlined"
      className={cn("flex w-full max-w-[30rem] flex-col gap-3.5 rounded-md-lg p-4", className)}
      {...rest}
    >
      <p id={labelId} className={overline}>
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={s.onGroupKeyDown}
        className={variant === "grid" ? "grid grid-cols-4 gap-2" : "flex flex-col gap-1"}
      >
        {s.all.map((st, i) => {
          const on = st.id === s.current;
          const focusable = on || (!s.currentStyle && i === 0);
          const common = {
            type: "button" as const,
            role: "radio",
            "aria-checked": on,
            "data-style-id": st.id,
            tabIndex: focusable ? 0 : -1,
            onClick: () => s.select(st.id),
          };
          if (variant === "grid") {
            return (
              <button key={st.id} {...common} className={cn("flex min-w-0 flex-col items-center gap-1.5 rounded-md-md", focusRing)}>
                <Swatch style={st} on={on} />
                <span
                  className={cn(
                    "max-w-full truncate text-xs",
                    on ? "font-medium text-md-on-surface" : "text-md-on-surface-variant",
                  )}
                >
                  {st.name}
                </span>
                {st.description && <span className="sr-only">{st.description}</span>}
              </button>
            );
          }
          return (
            <button
              key={st.id}
              {...common}
              className={cn(
                "relative flex min-h-12 items-center gap-3 rounded-md-lg px-3 py-2 text-left",
                on ? "bg-md-secondary-container text-md-on-secondary-container" : cn("text-md-on-surface", stateLayer),
                "outline-none focus-visible:ring-2 focus-visible:ring-md-primary",
              )}
            >
              {st.image ? (
                <img src={st.image} alt="" className="relative size-5 shrink-0 rounded-full object-cover" />
              ) : (
                <span aria-hidden="true" className={cn("relative size-5 shrink-0 rounded-full", dot[st.swatch ?? "neutral"])} />
              )}
              <span className="relative flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium">{st.name}</span>
                {st.description && (
                  <span className={cn("text-xs", on ? "text-current" : "text-md-on-surface-variant")}>{st.description}</span>
                )}
              </span>
              {on && <Check aria-hidden="true" className="relative size-5 shrink-0" />}
            </button>
          );
        })}
      </div>
      {allowReference && <ReferenceZone s={s} />}
      {lockable && s.currentStyle && <LockLine s={s} scope={lockScope} />}
    </Md3Card>
  );
});
Md3PresetStyles.displayName = "Md3PresetStyles";
