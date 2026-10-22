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
import { Badge } from "@nucleux/badge";
import { Button } from "@nucleux/button";
import { CardContainer } from "@nucleux/card";
import { Input } from "@nucleux/input";
import { Label } from "@nucleux/label";
import { OpenInput, RequestSettings } from "@nucleux/open-input";
import { Spinner } from "@nucleux/spinner";
import { Textarea } from "@nucleux/textarea";
import { ToggleGroup, ToggleGroupItem } from "@nucleux/toggle-group";
import {
  presetStylesCopy,
  usePresetStyles,
  type PresetStyle,
  type PresetStyleSwatch,
  type PresetStylesProps,
  type PresetStylesState,
} from "./use-preset-styles";

export * from "./use-preset-styles";

// Site: pink, blue, green and yellow tiles — the same hues as our status tokens, as soft gradients.
const tile: Record<PresetStyleSwatch, string> = {
  destructive: "from-destructive/10 to-destructive/20",
  info: "from-info/15 to-info/30",
  success: "from-success/15 to-success/30",
  warning: "from-warning/35 to-warning/60",
  brand: "from-brand/15 to-brand/30",
  neutral: "from-muted to-border",
};
const dot: Record<PresetStyleSwatch, string> = {
  destructive: "bg-destructive",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  brand: "bg-brand",
  neutral: "bg-foreground",
};

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const overline = "text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground";

function Swatch({ style, on }: { style: PresetStyle; on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block aspect-square w-full overflow-hidden rounded-[9px] bg-gradient-to-br transition-[border-color,border-width] motion-reduce:transition-none",
        tile[style.swatch ?? "neutral"],
        on ? "border-[2.5px] border-foreground" : "border-[1.5px] border-border group-hover:border-muted-foreground/50",
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
        "flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-dashed border-border p-3 transition-colors",
        s.dragging && "border-ring bg-accent",
      )}
    >
      <input {...s.referenceInputProps} aria-label="Reference image" />
      <button
        type="button"
        onClick={s.openReferencePicker}
        className={cn("flex min-w-0 flex-1 items-center gap-2.5 rounded-md text-left", focusRing)}
      >
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-[7px] bg-gradient-to-br from-muted to-border"
        >
          {ref?.src ? (
            <img src={ref.src} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-4 text-muted-foreground" />
          )}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-xs font-semibold text-foreground">
            {ref ? presetStylesCopy.matchAttached : presetStylesCopy.matchTitle}
          </span>
          <span className="truncate text-[11px] text-muted-foreground">
            {ref ? `${ref.name} · drop to replace` : presetStylesCopy.matchSub}
          </span>
        </span>
      </button>
      {ref && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${ref.name}`}
          onClick={() => s.attachReference(null)}
          className="shrink-0 text-muted-foreground"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

function LockLine({ s, scope }: { s: PresetStylesState; scope: string }) {
  const name = <strong className="font-semibold text-foreground">{s.currentStyle?.name}</strong>;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
      <Palette aria-hidden="true" className="size-3.5 shrink-0 text-brand" />
      <span className="min-w-0 flex-1" aria-live="polite">
        {s.locked ? (
          <>
            Style locked to {name} for {scope}
          </>
        ) : (
          <>{name} applies to the next generation only</>
        )}
      </span>
      <Button
        variant="link"
        size="sm"
        onClick={() => s.setLocked(!s.locked)}
        className="h-auto shrink-0 px-0 text-[11px] font-medium"
      >
        {s.locked ? "Unlock" : `Lock for ${scope}`}
      </Button>
    </div>
  );
}

/** The sample reply: the same request answered in the style. */
function Preview({ style, prompt, id }: { style?: { name: string; sample?: string; description?: string }; prompt?: string; id?: string }) {
  return (
    <div id={id} aria-live={id ? "polite" : undefined} className="flex flex-col gap-2.5 rounded-lg bg-muted/60 px-4 py-3.5">
      <p className={overline}>Preview · {style?.name}</p>
      {prompt && (
        <p className="max-w-[90%] self-end rounded-2xl rounded-br-sm bg-brand/10 px-3 py-1.5 text-xs text-foreground">
          {prompt}
        </p>
      )}
      <p className="text-[13px] leading-[1.6] text-foreground">{style?.sample ?? style?.description}</p>
    </div>
  );
}

function Trigger({ s }: { s: PresetStylesState }) {
  const chev = (
    <ChevronDown
      aria-hidden="true"
      className={cn("size-4 transition-transform motion-reduce:transition-none", s.open && "rotate-180")}
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
          "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background pl-2 pr-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-accent [&_svg]:size-4",
          s.open && "border-ring",
          focusRing,
        )}
      >
        <PenLine aria-hidden="true" />
        <span>Style</span>
        {chev}
      </button>
    );
  }
  const name = s.currentStyle?.name ?? "";
  return (
    <span className="inline-flex h-8 shrink-0 items-center rounded-lg bg-brand-muted text-foreground animate-nx-fade-in motion-reduce:animate-none">
      <button
        ref={s.triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={s.open}
        aria-label={`Style ${name} — change`}
        onClick={s.toggleMenu}
        className={cn(
          "inline-flex h-full items-center gap-1.5 rounded-l-lg pl-2 pr-1.5 text-[13px] transition-colors hover:bg-brand/10 [&_svg]:size-4",
          focusRing,
        )}
      >
        <PenLine aria-hidden="true" />
        <span>Style</span>
        <span className="max-w-[18ch] truncate font-semibold">{name}</span>
        {chev}
      </button>
      <button
        type="button"
        aria-label={`Remove style ${name}`}
        onClick={s.reset}
        className={cn(
          "inline-flex h-full w-7 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-brand/10 hover:text-foreground",
          focusRing,
        )}
      >
        <X aria-hidden="true" className="size-3.5" />
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
          "flex min-h-[52px] w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors motion-reduce:transition-none",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring",
          on ? "bg-brand-muted" : peek ? "bg-muted" : "hover:bg-muted",
        )}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-foreground">
            {st.name}
            {st.custom && (
              <Badge variant="secondary" icon={<Sparkles className="size-3" />} className="px-1.5 py-0 text-[11px] font-medium">
                {presetStylesCopy.fromWriting}
              </Badge>
            )}
          </span>
          {st.description && <span className="text-xs text-muted-foreground">{st.description}</span>}
        </span>
        {on && <Check aria-hidden="true" className="size-5 shrink-0 text-brand" />}
      </button>
    );
  };
  return (
    <div
      ref={s.menuRef}
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="absolute bottom-full left-0 z-50 mb-2 flex w-full min-w-[min(36rem,calc(100vw-2rem))] flex-col rounded-xl border border-border bg-background p-2 text-foreground shadow-md animate-nx-fade-in motion-reduce:animate-none"
    >
      <div className={cn("relative flex flex-col gap-0.5 px-3 pb-2 pt-2.5", showClose && "pr-11")}>
        {showClose && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            onClick={() => s.closeMenu()}
            className="absolute right-1 top-1.5 text-muted-foreground"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        )}
        <p id={titleId} className="text-base font-semibold text-foreground">
          {label}
        </p>
        <p id={descId} className="text-xs text-muted-foreground">
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
        {showPreview && <Preview id={prevId} style={s.previewStyle} prompt={previewPrompt} />}
      </div>
      {s.canCreate && (
        <div className="mx-2 mt-2 border-t border-border pt-1.5">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Plus className="size-4" />}
            onClick={s.startCreate}
            className="font-medium text-brand hover:text-brand"
          >
            {presetStylesCopy.create}
          </Button>
        </div>
      )}
    </div>
  );
}

const cardBase = "flex flex-col gap-3.5 p-4 outline-none animate-nx-fade-in motion-reduce:animate-none";

function CreateCard({ s }: { s: PresetStylesState }) {
  const titleId = `${s.ids}-create`;
  const fieldId = `${s.ids}-source`;
  const busy = s.status === "busy";
  return (
    <CardContainer
      ref={s.cardRef as React.Ref<HTMLDivElement>}
      tabIndex={-1}
      role="region"
      aria-labelledby={titleId}
      className={cardBase}
    >
      <div className="flex flex-col gap-1">
        <p id={titleId} className="text-base font-semibold text-foreground">
          {presetStylesCopy.createTitle}
        </p>
        <p className="text-[13px] text-muted-foreground">{presetStylesCopy.createSub(s.agentName)}</p>
      </div>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        aria-label="Start from"
        value={s.source}
        onValueChange={(v) => {
          if (v === "example" || v === "description") s.setSource(v);
        }}
        className="self-start"
      >
        <ToggleGroupItem value="example" className="gap-1.5 px-2.5">
          <FileText aria-hidden="true" className="size-4" />
          An example
        </ToggleGroupItem>
        <ToggleGroupItem value="description" className="gap-1.5 px-2.5">
          <PenLine aria-hidden="true" className="size-4" />
          A description
        </ToggleGroupItem>
      </ToggleGroup>
      {s.source === "example" ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor={fieldId}>Paste writing you like</Label>
          <Textarea id={fieldId} rows={4} value={s.example} onChange={(e) => s.setExample(e.target.value)} />
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
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Upload className="size-4" />}
              onClick={() => s.exampleFileRef.current?.click()}
              className="text-brand hover:text-brand"
            >
              {s.exampleFile ? `Use “${s.exampleFile.name}”` : "Upload a file"}
            </Button>
            <span className="text-xs text-muted-foreground">PDF, DOC or TXT. Used only to make this style.</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Label htmlFor={fieldId}>Describe the style</Label>
          <Textarea id={fieldId} rows={3} value={s.describe} onChange={(e) => s.setDescribe(e.target.value)} />
        </div>
      )}
      {busy && (
        <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Spinner aria-hidden="true" role={undefined} aria-label={undefined} className="size-3.5 motion-reduce:animate-none" />
          Generating a style…
        </p>
      )}
      {s.status === "error" && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-foreground">
          {presetStylesCopy.generateError}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={s.openMenu}>
          Back
        </Button>
        <Button
          size="sm"
          onClick={s.generate}
          disabled={!s.canGenerate}
          aria-busy={busy || undefined}
          leftIcon={
            busy ? (
              <Spinner aria-hidden="true" role={undefined} aria-label={undefined} className="size-4 motion-reduce:animate-none" />
            ) : s.status === "error" ? (
              <RotateCcw className="size-4" />
            ) : (
              <Sparkles className="size-4" />
            )
          }
        >
          {busy ? "Generating…" : s.status === "error" ? "Try again" : "Generate style"}
        </Button>
      </div>
    </CardContainer>
  );
}

function ReviewCard({ s, previewPrompt }: { s: PresetStylesState; previewPrompt?: string }) {
  const d = s.draft;
  if (!d) return null;
  const titleId = `${s.ids}-review`;
  const nameId = `${s.ids}-name`;
  const descId = `${s.ids}-what`;
  const instId = `${s.ids}-inst`;
  const set = (patch: Partial<typeof d>) => s.setDraft({ ...d, ...patch });
  return (
    <CardContainer
      ref={s.cardRef as React.Ref<HTMLDivElement>}
      tabIndex={-1}
      role="region"
      aria-labelledby={titleId}
      className={cardBase}
    >
      <p id={titleId} className={cn(overline, "flex items-center gap-1.5")}>
        <Sparkles aria-hidden="true" className="size-3.5 text-brand" />
        {presetStylesCopy.generated(s.agentName)}
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor={nameId}>Style name</Label>
        <Input id={nameId} value={d.name} onChange={(e) => set({ name: e.target.value })} invalid={!d.name.trim()} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={descId}>What it changes</Label>
        <Input id={descId} value={d.description} onChange={(e) => set({ description: e.target.value })} />
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={s.instructionsOpen}
          aria-controls={instId}
          onClick={() => s.setInstructionsOpen(!s.instructionsOpen)}
          leftIcon={s.instructionsOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          className="self-start text-brand hover:text-brand"
        >
          Instructions behind it
        </Button>
        {s.instructionsOpen && (
          <div id={instId} className="flex flex-col gap-2">
            <Label htmlFor={`${instId}-t`}>Instructions</Label>
            <Textarea
              id={`${instId}-t`}
              rows={4}
              value={d.instructions}
              onChange={(e) => set({ instructions: e.target.value })}
            />
          </div>
        )}
      </div>
      <Preview style={{ name: d.name, sample: d.sample, description: d.description }} prompt={previewPrompt} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={s.backToCreate}>
          Back
        </Button>
        <span className="ml-auto flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => s.save(false)} disabled={!d.name.trim()}>
            Save
          </Button>
          <Button size="sm" onClick={() => s.save(true)} disabled={!d.name.trim()}>
            Save and use
          </Button>
        </span>
      </div>
    </CardContainer>
  );
}

/**
 * One-tap named styles that set how the agent's output looks or reads, without
 * restating it in every request. `variant="grid"` (default) is a swatch grid
 * picked before generating, with a "Match a style" reference-image drop and a
 * per-project lock; `"list"` is a short list of brand-agreed presets;
 * `"menu"` puts a Style control in the composer that opens "Use style" — each
 * style with one line on what it changes, a sample reply that follows pointer
 * and focus, and "Create & edit styles", which turns writing the person likes
 * (or a description) into their own style through the app's
 * `onGenerateStyle`, reviewed and editable before saving. Choosing applies at
 * once, the chip names the style, × goes back to the base style with Undo, and
 * the request text is never edited. Arrow keys move between styles; Escape
 * closes the menu and returns focus to the control.
 */
export const PresetStyles = React.forwardRef<HTMLDivElement, PresetStylesProps>((props, ref) => {
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
    onAdd,
    addLabel,
    add,
    model,
    onVoice,
    voiceLabel,
    className,
    ...rest
  } = props;
  const s = usePresetStyles(props);
  const label = labelProp ?? (variant === "menu" ? presetStylesCopy.menuLabel : presetStylesCopy.gridLabel);
  const labelId = `${s.ids}-label`;

  if (variant === "menu") {
    const description = descriptionProp ?? presetStylesCopy.menuDescription(s.agentName);
    const trigger =
      triggerMode === "settings" ? (
        <RequestSettings
          ref={s.triggerRef}
          items={s.settingsItems(<PenLine />)}
          onSelect={s.onSettingsSelect}
          onOpenChange={s.onSettingsOpenChange}
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
          className={s.noticeText ? "flex flex-wrap items-center gap-2 px-1 text-[13px] text-muted-foreground" : "sr-only"}
        >
          {s.noticeText && (
            <>
              {s.notice?.kind === "reset" ? (
                <Check aria-hidden="true" className="size-4 shrink-0 text-brand" />
              ) : (
                <PenLine aria-hidden="true" className="size-4 shrink-0 text-brand" />
              )}
              <span className="min-w-0 flex-1">{s.noticeText}</span>
              {s.canUndo && (
                <Button variant="link" size="sm" onClick={s.undo} className="h-auto px-1 text-[13px] font-medium">
                  Undo
                </Button>
              )}
            </>
          )}
        </div>
        {withComposer ? (
          <OpenInput
            aria-label={`Message ${s.agentName}`}
            placeholder={placeholder}
            value={s.message}
            onValueChange={s.setMessage}
            onSubmit={s.submit}
            onAdd={onAdd}
            addLabel={addLabel}
            add={add}
            model={model}
            onVoice={onVoice}
            voiceLabel={voiceLabel}
            actions={
              <>
                {composerLeading}
                {trigger}
                {composerActions}
              </>
            }
          />
        ) : (
          trigger
        )}
      </div>
    );
  }

  const radios = (
    <div
      role="radiogroup"
      aria-labelledby={labelId}
      onKeyDown={s.onGroupKeyDown}
      className={variant === "grid" ? "grid grid-cols-4 gap-2" : "flex flex-col gap-1.5"}
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
            <button key={st.id} {...common} className={cn("group flex min-w-0 flex-col items-center gap-1.5 rounded-[11px]", focusRing)}>
              <Swatch style={st} on={on} />
              <span
                className={cn(
                  "max-w-full truncate text-[11px]",
                  on ? "font-semibold text-foreground" : "text-muted-foreground",
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
              "flex items-center gap-2.5 rounded-md border px-2.5 py-2 text-left transition-colors motion-reduce:transition-none",
              on ? "border-brand bg-brand-muted" : "border-border hover:bg-accent",
              focusRing,
            )}
          >
            {st.image ? (
              <img src={st.image} alt="" className="size-[18px] shrink-0 rounded-full object-cover" />
            ) : (
              <span aria-hidden="true" className={cn("size-[18px] shrink-0 rounded-full", dot[st.swatch ?? "neutral"])} />
            )}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className={cn("text-xs", on ? "font-semibold text-foreground" : "text-muted-foreground")}>{st.name}</span>
              {st.description && <span className="text-[11px] text-muted-foreground">{st.description}</span>}
            </span>
            {on && <Check aria-hidden="true" className="size-4 shrink-0 text-brand" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <CardContainer ref={ref} className={cn("flex w-full max-w-[30rem] flex-col gap-3 p-4", className)} {...rest}>
      <p id={labelId} className={overline}>
        {label}
      </p>
      {radios}
      {allowReference && <ReferenceZone s={s} />}
      {lockable && s.currentStyle && <LockLine s={s} scope={lockScope} />}
    </CardContainer>
  );
});
PresetStyles.displayName = "PresetStyles";

