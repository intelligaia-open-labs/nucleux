import * as React from "react";
import { Check, ChevronDown, Info, MessagesSquare, RefreshCw, Sparkles, X } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Md3AgentComposer } from "@nucleux/md3-agent-composer";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3RequestSettings } from "@nucleux/md3-open-input";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Card } from "@nucleux/md3-card";
import { Md3Checkbox } from "@nucleux/md3-checkbox";
import { Md3Chip } from "@nucleux/md3-chip";
import { Md3Slider } from "@nucleux/md3-slider";
import { Md3TextField } from "@nucleux/md3-text-field";
import { useVoiceTone } from "@nucleux/voice-tone";
import type { VoiceToneProps, VoiceToneState } from "@nucleux/voice-tone";

export type {
  VoiceToneOption,
  VoiceToneRule,
  VoiceToneSetting,
  VoiceToneVariant,
  VoiceToneLayout,
  VoiceToneNotice,
  VoiceToneState,
  VoiceToneTrigger,
} from "@nucleux/voice-tone";
export { defaultVoiceTones, defaultVoiceToneRules, useVoiceTone, VOICE_TONE_CUSTOM } from "@nucleux/voice-tone";
export type Md3VoiceToneProps = VoiceToneProps;

/* ─────────────────────────────── Material 3 renderers ─────────────────────── */

const stateLayer =
  "relative overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12] motion-reduce:before:transition-none";
const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface";
const overline = "text-[11.5px] font-semibold uppercase leading-4 tracking-[0.06em] text-md-on-surface-variant";

function Recommended() {
  return (
    <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-md-primary">
      <Sparkles className="size-3.5" aria-hidden="true" />
      Recommended
    </span>
  );
}

function ToneChoices({ vt }: { vt: VoiceToneState }) {
  const { tones, layout, inPicker } = vt;
  const group = {
    role: "radiogroup" as const,
    "aria-label": inPicker ? vt.label : undefined,
    "aria-labelledby": inPicker ? undefined : vt.ids.presets,
    onMouseLeave: () => vt.setPeek(null),
  };

  if (layout === "slider") {
    const first = tones[0];
    const last = tones[tones.length - 1];
    return (
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs font-medium text-md-on-surface-variant" aria-hidden="true">
          <span>{first?.name}</span>
          <span>{last?.name}</span>
        </div>
        <Md3Slider
          ref={vt.sliderRef}
          min={0}
          max={Math.max(1, tones.length - 1)}
          step={1}
          value={vt.sliderIndex}
          onValueChange={vt.onSliderChange}
          aria-label={vt.label}
        />
        <p className="text-center text-xs text-md-on-surface-variant" aria-hidden="true">
          {tones[vt.sliderIndex]?.name}
        </p>
      </div>
    );
  }

  if (layout === "segmented") {
    return (
      <div
        {...group}
        className="inline-flex w-fit flex-wrap divide-x divide-md-outline overflow-hidden rounded-full border border-md-outline"
      >
        {tones.slice(0, 4).map((t, i) => {
          const on = t.id === vt.tone;
          return (
            <button
              key={t.id}
              {...vt.radioProps(t, i)}
              className={cn(
                stateLayer,
                "inline-flex h-10 items-center gap-2 px-4 text-sm font-medium transition-colors outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-md-primary [&_svg]:size-[18px]",
                on ? "bg-md-secondary-container text-md-on-secondary-container" : "text-md-on-surface",
              )}
            >
              {on && <Check className="relative" aria-hidden="true" />}
              <span className="relative">{t.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (layout === "list") {
    return (
      <div {...group} className="flex flex-col gap-0.5">
        {tones.map((t, i) => {
          const on = t.id === vt.tone;
          return (
            <button
              key={t.id}
              {...vt.radioProps(t, i)}
              className={cn(
                stateLayer,
                focusRing,
                "flex w-full items-center gap-3 rounded-md-md px-3 py-2.5 text-left transition-colors",
                on ? "bg-md-secondary-container text-md-on-secondary-container" : "text-md-on-surface",
              )}
            >
              <span className="relative flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-2 text-[14.5px] font-medium leading-5">
                  {t.name}
                  {t.recommended && <Recommended />}
                </span>
                {t.description && (
                  <span className={cn("text-[12.5px] leading-[18px]", on ? "text-current" : "text-md-on-surface-variant")}>
                    {t.description}
                  </span>
                )}
                {vt.showSample && t.sample && (
                  <span className="text-[12.5px] italic leading-[18px] text-md-on-surface">“{t.sample}”</span>
                )}
              </span>
              {on && <Check className="relative size-[22px] shrink-0" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div {...group} className="grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-2">
      {tones.map((t, i) => {
        const on = t.id === vt.tone;
        return (
          <button
            key={t.id}
            {...vt.radioProps(t, i)}
            className={cn(
              stateLayer,
              focusRing,
              "flex min-h-[4.75rem] flex-col items-start gap-1 rounded-md-md text-left text-md-on-surface transition-colors",
              on
                ? "border-2 border-md-primary bg-md-primary/[0.06] px-[13px] py-[11px]"
                : "border border-md-outline-variant px-3.5 py-3",
            )}
          >
            <span className="relative flex w-full items-center gap-1.5 text-sm font-semibold leading-5">
              {t.name}
              {on && <Check className="ml-auto size-[18px] shrink-0 text-md-primary" aria-hidden="true" />}
            </span>
            {t.description && (
              <span className="relative text-[12.5px] leading-[18px] text-md-on-surface-variant">{t.description}</span>
            )}
            {t.recommended && (
              <span className="relative">
                <Recommended />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function CustomRow({ vt, onContainer }: { vt: VoiceToneState; onContainer?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2">
        <Md3TextField
          id={vt.ids.custom}
          variant="outlined"
          label={`Or describe a ${vt.label.toLowerCase()}`}
          value={vt.customDraft}
          onChange={(e) => vt.setCustomDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              vt.applyCustom();
            }
          }}
          className={cn("flex-1", onContainer && "[&_label]:bg-md-surface-container")}
        />
        <Md3Button variant="tonal" onClick={vt.applyCustom} disabled={!vt.customDraft.trim()} className="mt-2">
          Use
        </Md3Button>
      </div>
      <p className="px-1 text-xs text-md-on-surface-variant">
        Best effort — {vt.agentName} matches it as closely as it can.
      </p>
    </div>
  );
}

function Sample({ vt, framed }: { vt: VoiceToneState; framed?: boolean }) {
  const t = vt.sampleTone;
  const text = t?.sample;
  if (!vt.showSample || vt.layout === "segmented" || (!text && !vt.isCustom)) return null;
  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        framed ? "rounded-md-md bg-md-surface-container-high px-3.5 py-3" : "bg-md-surface-container-low px-5 pb-4 pt-3.5",
      )}
    >
      <p className={overline}>{framed && t ? `Sample · ${t.name}` : "Sample output"}</p>
      <p className="text-sm italic leading-[21px] text-md-on-surface" aria-live="polite">
        {text ? `“${text}”` : `${vt.agentName} will match “${vt.customTone}” as closely as it can.`}
      </p>
    </div>
  );
}

function Notice({ vt }: { vt: VoiceToneState }) {
  const Icon = vt.notice === "changed" ? RefreshCw : vt.notice === "removed" ? X : Info;
  return (
    <div role="status">
      {vt.noticeText ? (
        <p className="flex flex-wrap items-center gap-2 px-4 pb-1.5 text-[13px] leading-5 text-md-on-surface-variant">
          <Icon className="size-[18px] shrink-0 text-md-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1">{vt.noticeText}</span>
          {vt.notice === "removed" && (
            <Md3Button variant="text" className="h-8 px-2" onClick={vt.undo}>
              Undo
            </Md3Button>
          )}
        </p>
      ) : (
        <span className="sr-only">{vt.announcement}</span>
      )}
    </div>
  );
}

function Picker({ vt, showClose }: { vt: VoiceToneState; showClose?: boolean }) {
  if (!vt.open) return null;
  return (
    <div
      id={vt.ids.picker}
      role="dialog"
      aria-labelledby={vt.ids.title}
      onKeyDown={vt.onPickerKeyDown}
      className="absolute bottom-full left-0 z-50 mb-2 flex w-[min(34rem,calc(100vw-2rem))] flex-col gap-2 rounded-md-lg bg-md-surface-container p-2 text-md-on-surface shadow-md-2 animate-nx-fade-in motion-reduce:animate-none"
    >
      <div className={cn("relative flex flex-col gap-0.5 px-3 pb-1 pt-2.5", showClose && "pr-12")}>
        {showClose && (
          <Md3IconButton aria-label="Close" onClick={vt.closePicker} className="absolute right-0 top-0">
            <X aria-hidden="true" />
          </Md3IconButton>
        )}
        <p id={vt.ids.title} className="text-base font-medium leading-6">
          {vt.label}
          <span className="sr-only"> — {vt.pickerTitle.toLowerCase()}</span>
        </p>
        <p className="text-[12.5px] leading-[18px] text-md-on-surface-variant">{vt.pickerSubtitle}</p>
      </div>
      <div className="px-2">
        <ToneChoices vt={vt} />
      </div>
      <div className="px-2 empty:hidden">
        <Sample vt={vt} framed />
      </div>
      {vt.allowCustom && (
        <div className="px-2 pb-2 pt-1">
          <CustomRow vt={vt} onContainer />
        </div>
      )}
    </div>
  );
}

function ToneChip({ vt }: { vt: VoiceToneState }) {
  const chev = (
    <ChevronDown
      className={cn("-mx-0.5 inline-block transition-transform motion-reduce:transition-none", vt.open && "rotate-180")}
      aria-hidden="true"
    />
  );
  const trigger = {
    ref: vt.triggerRef,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": vt.open,
    "aria-controls": vt.open ? vt.ids.picker : undefined,
    onClick: () => vt.setOpen(!vt.open),
  };
  return (
    <div ref={vt.rootRef} className="inline-flex">
      {vt.toneName ? (
        <span className="inline-flex h-8 items-center overflow-hidden rounded-md-sm bg-md-secondary-container text-md-on-secondary-container">
          <Md3Chip
            {...trigger}
            selected
            aria-label={vt.chipLabel}
            icon={<MessagesSquare />}
            className={cn("rounded-none border-0 bg-transparent pl-2 font-normal", vt.removable ? "pr-1.5" : "pr-2.5")}
          >
            <span className="inline-flex items-center gap-1.5">
              <span>{vt.label}</span>
              <span className="max-w-[18ch] truncate font-semibold">{vt.toneName}</span>
              {chev}
            </span>
          </Md3Chip>
          {vt.removable && (
            <button
              type="button"
              aria-label={vt.removeLabel}
              onClick={vt.remove}
              className={cn(
                stateLayer,
                "inline-flex h-8 w-7 items-center justify-center pr-1 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-md-primary [&_svg]:size-4",
              )}
            >
              <X className="relative" aria-hidden="true" />
            </button>
          )}
        </span>
      ) : (
        <Md3Chip
          {...trigger}
          icon={<MessagesSquare />}
          className={cn("border-md-outline-variant pl-2 pr-2.5 text-md-on-surface", vt.open && "border-md-primary")}
        >
          <span className="inline-flex items-center gap-1.5">
            {vt.label}
            {chev}
          </span>
        </Md3Chip>
      )}
      <Picker vt={vt} />
    </div>
  );
}

function ToneSettings({ vt, anchored }: { vt: VoiceToneState; anchored?: boolean }) {
  return (
    <div ref={vt.rootRef} className="inline-flex">
      <Md3RequestSettings
        ref={vt.triggerRef}
        items={vt.settingsItems(<MessagesSquare />)}
        onSelect={vt.onSettingsSelect}
        onOpenChange={vt.onSettingsOpenChange}
        className={anchored ? "static [&>[role=menu]]:left-10" : undefined}
      />
      <Picker vt={vt} showClose />
    </div>
  );
}

function Settings({ vt }: { vt: VoiceToneState }) {
  return (
    <>
      <div className="flex flex-col gap-4 px-5 pb-4 pt-5">
        {vt.tones.length > 0 && (
          <div className="flex flex-col gap-2.5">
            <p id={vt.ids.presets} className={overline}>
              {vt.label} preset
            </p>
            <ToneChoices vt={vt} />
          </div>
        )}
        {vt.allowCustom && <CustomRow vt={vt} />}
        {vt.ruleList.length > 0 && (
          <div role="group" aria-labelledby={vt.ids.rules} className="flex flex-col gap-1">
            <p id={vt.ids.rules} className={overline}>
              Rules
            </p>
            <div className="-ml-2.5 flex flex-col">
              {vt.ruleList.map((r) => (
                <label key={r.id} className="flex w-fit cursor-pointer items-center gap-1 text-sm text-md-on-surface">
                  <Md3Checkbox
                    checked={vt.rules.includes(r.id)}
                    onCheckedChange={(next) => vt.toggleRule(r.id, next)}
                    aria-labelledby={vt.ids.rule(r.id)}
                  />
                  <span id={vt.ids.rule(r.id)}>{r.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      <Sample vt={vt} />
      <span role="status" className="sr-only">
        {vt.announcement}
      </span>
    </>
  );
}

/**
 * Voice & Tone in Material 3 — the twin of `VoiceTone`, with the same props, callbacks, keyboard
 * model and accessible names (the logic is `useVoiceTone` from `@nucleux/voice-tone`). In the
 * composer (`variant="composer"`), a Tone chip sits in the `Md3AgentComposer` toolbar: closed it is
 * an outlined assist chip; set, it takes the secondary-container role and reads “Tone Professional”
 * with a chevron to change and × to remove (with Undo). It opens a surface-container picker of tone
 * cards — the chosen card gets a 2px primary outline and a check — with a sample line that follows
 * focus and hover, the agent's recommendation marked but never applied, and an outlined “Or describe
 * a tone” field. `variant="settings"` is the same choice as an outlined card with a rules list of
 * `Md3Checkbox`es and a sample sentence. Tone travels beside the prompt as a setting; the prompt text
 * is never edited, and state layers and motion respect `prefers-reduced-motion`.
 */
export const Md3VoiceTone = React.forwardRef<HTMLDivElement, Md3VoiceToneProps>((props, ref) => {
  const vt = useVoiceTone(props);
  const {
    variant: _v,
    layout: _l,
    tones: _t,
    value: _value,
    defaultValue: _dv,
    onValueChange: _ovc,
    allowCustom: _ac,
    customTone: _ct,
    defaultCustomTone: _dct,
    onCustomToneChange: _occ,
    rules: _r,
    ruleValues: _rv,
    defaultRuleValues: _drv,
    onRulesChange: _orc,
    showSample: _ss,
    removable: _rm,
    open: _o,
    defaultOpen: _do,
    onOpenChange: _ooc,
    defaultNotice: _dn,
    label: _lb,
    agentName: _an,
    draft: _d,
    defaultDraft: _dd,
    onDraftChange: _odc,
    onSubmit: _os,
    placeholder = "Describe what to write…",
    loading,
    onStop,
    actions,
    composerLeading,
    trigger = "chip",
    settingsItems: _si,
    onSettingsSelect: _oss,
    onAdd,
    addLabel,
    add,
    model,
    onVoice,
    voiceLabel,
    className,
    ...rest
  } = props;
  const settingsControl = trigger === "settings";

  if (vt.variant === "settings") {
    return (
      <Md3Card
        ref={ref}
        variant="outlined"
        role="group"
        aria-label="Voice and tone"
        data-variant="settings"
        className={cn("font-md", "w-full max-w-[30rem] rounded-md-lg", className)}
        {...rest}
      >
        <Settings vt={vt} />
      </Md3Card>
    );
  }

  if (vt.variant === "chip") {
    return (
      <div ref={ref} data-variant="chip" className={cn("font-md", "relative inline-flex flex-col gap-1", className)} {...rest}>
        <Notice vt={vt} />
        {settingsControl ? <ToneSettings vt={vt} /> : <ToneChip vt={vt} />}
      </div>
    );
  }

  return (
    <div ref={ref} data-variant="composer" className={cn("font-md", "relative flex w-full max-w-[42rem] flex-col", className)} {...rest}>
      <Notice vt={vt} />
      <Md3AgentComposer
        value={vt.draft}
        onValueChange={vt.setDraft}
        onSubmit={vt.submit}
        placeholder={placeholder}
        loading={loading}
        onStop={onStop}
        onAdd={onAdd}
        addLabel={addLabel}
        add={add}
        model={model}
        onVoice={onVoice}
        voiceLabel={voiceLabel}
        className={cn(settingsControl && "relative")}
        leftActions={
          <>
            {composerLeading}
            {settingsControl ? <ToneSettings vt={vt} anchored /> : <ToneChip vt={vt} />}
            {settingsControl ? null : actions}
          </>
        }
        rightActions={settingsControl ? actions : undefined}
      />
    </div>
  );
});
Md3VoiceTone.displayName = "Md3VoiceTone";
