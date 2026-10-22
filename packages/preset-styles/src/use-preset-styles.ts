import * as React from "react";
import { mergeRequestSettingsItems, type OpenInputProps, type RequestSettingsItem } from "@nucleux/open-input";

/**
 * Layout, from the two specs: `"grid"` — a swatch grid picked before generating
 * (with a reference-image drop and a per-project lock); `"list"` — a short list
 * of named, brand-agreed presets; `"menu"` — the composer's Style control that
 * opens "Use style" with a live preview and lets people create their own.
 */
export type PresetStylesVariant = "grid" | "list" | "menu";

/** Token tone for a style's swatch. Swatches are tokens, never raw colours. */
export type PresetStyleSwatch = "brand" | "info" | "success" | "warning" | "destructive" | "neutral";

/** What the menu variant is showing: nothing open, the Use style menu, the Create card, or the Review card. */
export type PresetStylesView = "closed" | "menu" | "create" | "review";

/** The one-line confirmation under the composer: a style was applied, or it went back to the base style. */
export type PresetStylesNotice = "applied" | "reset";

/**
 * Where the style is set from in the menu variant. "chip" (default): the Style control up front.
 * "settings": no Style control; a Request settings control (the tune icon) lists Style with its
 * value, and its row opens "Use style".
 */
export type PresetStylesTrigger = "chip" | "settings";

/** Where a custom style is learnt from. */
export type PresetStyleSource = "example" | "description";

/** One preset style. */
export interface PresetStyle {
  /** Stable id passed to `onValueChange`. */
  id: string;
  /** Display name, e.g. `"Concise"` or `"Photo"`. */
  name: string;
  /** One plain line on what it changes, e.g. `"Shorter, more direct replies."`. */
  description?: string;
  /** Swatch tone (grid tile, list dot). Defaults to `"neutral"`. */
  swatch?: PresetStyleSwatch;
  /** Thumbnail URL drawn instead of the swatch tone. */
  image?: string;
  /** A sample reply to `previewPrompt`, written in this style — the menu's preview. */
  sample?: string;
  /** The person's own style: listed under "Your styles" and tagged "From your writing". */
  custom?: boolean;
  /** The instructions behind a custom style. */
  instructions?: string;
}

/** The reference image a style is matched to. */
export interface PresetStyleReference {
  /** File name shown on the card, e.g. `"reference.jpg"`. */
  name: string;
  /** Optional thumbnail URL. */
  src?: string;
}

/** What `onGenerateStyle` receives: writing they like (pasted or a file) or a description. */
export interface PresetStyleRequest {
  source: PresetStyleSource;
  /** The pasted example or the description. */
  text: string;
  /** An uploaded example file, when they chose one. */
  file?: File;
}

/** What the app's generator returns — every part editable before saving. */
export interface PresetStyleDraft {
  name: string;
  /** One line on what it changes. */
  description: string;
  /** The instructions behind it. */
  instructions: string;
  /** A sample reply to `previewPrompt` in the new style. */
  sample?: string;
}

export interface PresetStylesProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "onSubmit">,
    /** The composer's own chrome (menu variant), passed straight to it: `onAdd` (the + button), `model` (the model chip), `onVoice` (the mic). */
    Pick<OpenInputProps, "onAdd" | "addLabel" | "add" | "model" | "onVoice" | "voiceLabel"> {
  /** The presets, in order. In `"menu"`, the first one is the base style (Normal) unless `baseStyle` says otherwise. */
  styles: PresetStyle[];
  /** Chosen style id (controlled). */
  value?: string;
  /** Initial style id (uncontrolled). Defaults to the base style. */
  defaultValue?: string;
  /** Called when a style is chosen (or × returns to the base style). Never touches the request text. */
  onValueChange?: (id: string) => void;
  /** Layout. Defaults to `"grid"`. */
  variant?: PresetStylesVariant;
  /** Heading. Defaults to `"Output style"` (grid, list) or `"Use style"` (menu). Also the group's accessible name. */
  label?: string;
  /** Menu sub-heading. Defaults to `"How {agentName} writes its replies — not what it knows or does."`. */
  description?: string;
  /** The plain style × goes back to. Defaults to the first style. */
  baseStyle?: string;
  /** Who writes, for the copy. Defaults to `"Aria"`. */
  agentName?: string;

  /** Grid / list: show the per-project lock line. */
  lockable?: boolean;
  /** Locked (controlled). */
  locked?: boolean;
  /** Initially locked (uncontrolled). */
  defaultLocked?: boolean;
  /** Called when the lock is switched. */
  onLockedChange?: (locked: boolean) => void;
  /** What the lock covers. Defaults to `"this project"`. */
  lockScope?: string;

  /** Grid / list: show the "Match a style" reference-image drop. */
  allowReference?: boolean;
  /** The attached reference (controlled; `null` for none). */
  reference?: PresetStyleReference | null;
  /** Initially attached reference (uncontrolled). */
  defaultReference?: PresetStyleReference | null;
  /** Called with the dropped or picked image, or `null` when removed. */
  onReferenceChange?: (file: File | null) => void;

  /** Menu: what is showing at first. Defaults to `"closed"`. */
  defaultView?: PresetStylesView;
  /** Menu: called when the menu or a card opens or closes. */
  onViewChange?: (view: PresetStylesView) => void;
  /** Menu: show a sample reply for the style under the pointer or focus. Defaults to `true`. */
  showPreview?: boolean;
  /** Menu: the style previewed when the menu opens. Defaults to the chosen one. */
  defaultPreview?: string;
  /** Menu: the familiar request the preview answers, e.g. `"Summarize the October release."`. */
  previewPrompt?: string;
  /** Menu: what a style applies to. Defaults to `"new messages, edits and retries"`. */
  scope?: string;
  /** Menu: the conversation already has replies — switching says earlier ones keep their style. */
  earlierReplies?: boolean;
  /** Menu: the confirmation line shown at first (restoring UI). */
  defaultNotice?: PresetStylesNotice | null;

  /** Menu: makes a custom style from an example or a description. Enables "Create & edit styles". */
  onGenerateStyle?: (request: PresetStyleRequest) => Promise<PresetStyleDraft>;
  /** Menu: called when a custom style is saved (`use` = Save and use). It is also kept locally. */
  onSaveStyle?: (style: PresetStyle, use: boolean) => void;
  /** Menu: the generated draft to review when `defaultView="review"`. */
  defaultGenerated?: PresetStyleDraft;

  /** Menu: render the family's composer with the Style control in its toolbar. Defaults to `true`; `false` renders only the control. */
  withComposer?: boolean;
  /** Composer text (controlled). */
  message?: string;
  /** Composer text at first (uncontrolled). */
  defaultMessage?: string;
  /** Called as the composer text changes. */
  onMessageChange?: (text: string) => void;
  /** Called on send with the request and the chosen style id. The style is a setting; the text is never edited. */
  onSubmit?: (text: string, styleId: string) => void;
  /** Composer placeholder. Defaults to `"Describe what you need…"`. */
  placeholder?: string;
  /** Menu: composer controls placed first in the toolbar, before the Style control or Request settings (attach, +…). */
  composerLeading?: React.ReactNode;
  /** Menu: more composer tools, placed after the Style control (model, voice…). */
  composerActions?: React.ReactNode;
  /**
   * Menu: "chip" (default) puts the Style control in the composer. "settings": no Style control; a
   * Request settings control right after `composerLeading` lists Style (with its value) and opens
   * "Use style" from that row.
   */
  trigger?: PresetStylesTrigger;
  /** With `trigger="settings"`: the app's other request settings for the same menu (Mode, Tone, Improve prompt…), merged in the site's order. */
  settingsItems?: RequestSettingsItem[];
  /** With `trigger="settings"`: called when one of `settingsItems` is chosen. */
  onSettingsSelect?: (id: string) => void;
}

type GenerateStatus = "idle" | "busy" | "error";

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "style";

/** Copy shared by both families. */
export const presetStylesCopy = {
  menuLabel: "Use style",
  gridLabel: "Output style",
  menuDescription: (agent: string) => `How ${agent} writes its replies — not what it knows or does.`,
  scope: "new messages, edits and retries",
  lockScope: "this project",
  placeholder: "Describe what you need…",
  create: "Create & edit styles",
  yourStyles: "Your styles",
  fromWriting: "From your writing",
  createTitle: "Create a style",
  createSub: (agent: string) =>
    `${agent} learns how you want replies to read — from writing you like, or from a description.`,
  generated: (agent: string) => `Style made by ${agent} from your example`,
  generateError: "Couldn't generate a style. Your example is still here — try again.",
  matchTitle: "Match a style",
  matchSub: "Drop a reference image to copy its aesthetic",
  matchAttached: "Match this style",
} as const;

/** "Concise applies to …" / "Style switched to …" / "Back to Normal." */
export function presetStylesNoticeText(
  kind: PresetStylesNotice,
  name: string,
  opts: { scope: string; earlierReplies?: boolean },
): string {
  if (kind === "reset") return `Back to ${name}.`;
  return opts.earlierReplies
    ? `Style switched to ${name}. It applies from here — earlier replies keep the style they were written in.`
    : `${name} applies to ${opts.scope}.`;
}

/**
 * Arrow-key movement among `[role="radio"]` inside `container` (both
 * families). Returns the newly focused element's `data-style-id`, or null.
 * Grid swatches select on move; menu rows only move focus (the preview follows).
 */
export function presetStylesMoveFocus(e: React.KeyboardEvent, container: HTMLElement | null): string | null {
  if (!container) return null;
  const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
  if (!keys.includes(e.key)) return null;
  const items = Array.from(container.querySelectorAll<HTMLElement>('[role="radio"]'));
  if (!items.length) return null;
  e.preventDefault();
  const i = items.indexOf(document.activeElement as HTMLElement);
  let n = i;
  if (e.key === "Home") n = 0;
  else if (e.key === "End") n = items.length - 1;
  else if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % items.length;
  else n = (i - 1 + items.length) % items.length;
  const el = items[n];
  el.focus();
  return el.getAttribute("data-style-id");
}

/**
 * All of PresetStyles' state and behaviour, shared by `PresetStyles` and
 * `Md3PresetStyles` so both families have one keyboard model, one set of
 * states and the same copy. Only markup differs between them.
 */
export function usePresetStyles(props: PresetStylesProps) {
  const {
    styles,
    value,
    defaultValue,
    onValueChange,
    variant = "grid",
    baseStyle,
    agentName = "Aria",
    locked: lockedProp,
    defaultLocked = false,
    onLockedChange,
    reference: referenceProp,
    defaultReference = null,
    onReferenceChange,
    defaultView = "closed",
    onViewChange,
    defaultPreview,
    scope = presetStylesCopy.scope,
    earlierReplies,
    defaultNotice = null,
    onGenerateStyle,
    onSaveStyle,
    defaultGenerated,
    message: messageProp,
    defaultMessage = "",
    onMessageChange,
    onSubmit,
  } = props;

  const ids = React.useId();
  const [added, setAdded] = React.useState<PresetStyle[]>([]);
  const all = React.useMemo(
    () => [...styles, ...added.filter((a) => !styles.some((s) => s.id === a.id))],
    [styles, added],
  );
  const base = baseStyle ?? styles[0]?.id ?? "";
  const byId = React.useCallback((id: string | null | undefined) => all.find((s) => s.id === id), [all]);

  const [internal, setInternal] = React.useState<string>(defaultValue ?? base);
  const current = value !== undefined ? value : internal;
  const currentStyle = byId(current);
  const baseName = byId(base)?.name ?? "Normal";

  const [notice, setNotice] = React.useState<{ kind: PresetStylesNotice; prev: string | null } | null>(
    defaultNotice ? { kind: defaultNotice, prev: null } : null,
  );

  const commit = (id: string) => {
    if (value === undefined) setInternal(id);
    onValueChange?.(id);
  };

  const [view, setViewState] = React.useState<PresetStylesView>(defaultView);
  const setView = (v: PresetStylesView) => {
    setViewState(v);
    onViewChange?.(v);
  };
  const open = view === "menu";

  const [peek, setPeek] = React.useState<string | null>(defaultPreview ?? null);
  const previewStyle = byId(peek ?? current) ?? currentStyle;

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLElement>(null);
  const cardMoved = React.useRef(false);
  // Create / Review: move focus into the card when it opens from a control.
  React.useEffect(() => {
    if ((view === "create" || view === "review") && cardMoved.current) {
      cardMoved.current = false;
      cardRef.current?.focus();
    }
  }, [view]);
  const openedByUser = React.useRef(false);
  // The trigger re-renders (plain ↔ set chip), so focus it after the commit.
  const pendingFocus = React.useRef(false);
  const focusTrigger = () => {
    pendingFocus.current = true;
  };
  React.useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    triggerRef.current?.focus();
  });

  const openMenu = () => {
    openedByUser.current = true;
    setPeek(null);
    setNotice(null);
    setView("menu");
  };
  const closeMenu = (refocus = true) => {
    setView("closed");
    if (refocus) focusTrigger();
  };
  const toggleMenu = () => (open ? closeMenu() : openMenu());

  /** Choose a style. In the menu this applies it at once, closes and confirms in one line. */
  const select = (id: string) => {
    const was = current;
    commit(id);
    if (variant !== "menu") return;
    setNotice(
      id === base ? (was !== base ? { kind: "reset", prev: was } : null) : { kind: "applied", prev: was },
    );
    closeMenu();
  };
  /** × on the chip: back to the base style, with Undo. */
  const reset = () => {
    const was = current;
    commit(base);
    setNotice({ kind: "reset", prev: was });
    focusTrigger();
  };
  const undo = () => {
    if (notice?.prev && notice.prev !== base) commit(notice.prev);
    setNotice(null);
    focusTrigger();
  };

  // Menu: focus the checked row when it opens; Escape and outside clicks close it.
  React.useEffect(() => {
    if (!open) return;
    if (openedByUser.current) {
      const rows = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="radio"]') ?? []);
      (rows.find((r) => r.getAttribute("aria-checked") === "true") ?? rows[0])?.focus();
    }
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      closeMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu(true);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const id = presetStylesMoveFocus(e, listRef.current);
    if (id) setPeek(id);
  };

  // Grid / list: radio semantics — arrows move and select.
  const onGroupKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    const id = presetStylesMoveFocus(e, e.currentTarget);
    if (id) select(id);
  };

  // Lock
  const [lockedInternal, setLockedInternal] = React.useState(defaultLocked);
  const locked = lockedProp !== undefined ? lockedProp : lockedInternal;
  const setLocked = (on: boolean) => {
    if (lockedProp === undefined) setLockedInternal(on);
    onLockedChange?.(on);
  };

  // Reference image
  const [refInternal, setRefInternal] = React.useState<PresetStyleReference | null>(defaultReference);
  const reference = referenceProp !== undefined ? referenceProp : refInternal;
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const attachReference = (file: File | null) => {
    if (referenceProp === undefined) setRefInternal(file ? { name: file.name } : null);
    onReferenceChange?.(file);
  };
  const referenceDropProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer?.files?.[0];
      if (f) attachReference(f);
    },
  };
  const referenceInputProps = {
    ref: fileRef,
    type: "file" as const,
    accept: "image/*",
    tabIndex: -1,
    "aria-hidden": true as const,
    className: "sr-only",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) attachReference(f);
      e.target.value = "";
    },
  };

  // Create a style
  const [source, setSource] = React.useState<PresetStyleSource>("example");
  const [example, setExample] = React.useState("");
  const [describe, setDescribe] = React.useState("");
  const [exampleFile, setExampleFile] = React.useState<File | null>(null);
  const exampleFileRef = React.useRef<HTMLInputElement>(null);
  const [status, setStatus] = React.useState<GenerateStatus>("idle");
  const [draft, setDraft] = React.useState<PresetStyleDraft | null>(defaultGenerated ?? null);
  const [instructionsOpen, setInstructionsOpen] = React.useState(false);
  const mounted = React.useRef(true);
  React.useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const canCreate = typeof onGenerateStyle === "function";
  const sourceText = source === "example" ? example : describe;
  const canGenerate = status !== "busy" && (sourceText.trim().length > 0 || (source === "example" && !!exampleFile));
  const startCreate = () => {
    cardMoved.current = true;
    setStatus("idle");
    setView("create");
  };
  const generate = async () => {
    if (!onGenerateStyle || !canGenerate) return;
    setStatus("busy");
    try {
      const d = await onGenerateStyle({
        source,
        text: sourceText.trim(),
        file: source === "example" ? exampleFile ?? undefined : undefined,
      });
      if (!mounted.current) return;
      setDraft(d);
      setInstructionsOpen(false);
      setStatus("idle");
      cardMoved.current = true;
      setView("review");
    } catch {
      if (mounted.current) setStatus("error");
    }
  };
  const save = (use: boolean) => {
    if (!draft || !draft.name.trim()) return;
    let id = slug(draft.name);
    while (all.some((s) => s.id === id)) id = `${id}-2`;
    const style: PresetStyle = {
      id,
      name: draft.name.trim(),
      description: draft.description,
      instructions: draft.instructions,
      sample: draft.sample,
      custom: true,
    };
    setAdded((a) => [...a, style]);
    onSaveStyle?.(style, use);
    if (use) {
      const was = current;
      commit(id);
      setNotice({ kind: "applied", prev: was });
      setView("closed");
      focusTrigger();
    } else {
      openedByUser.current = true;
      setView("menu");
    }
  };

  // Composer
  const [msgInternal, setMsgInternal] = React.useState(defaultMessage);
  const message = messageProp !== undefined ? messageProp : msgInternal;
  const setMessage = (t: string) => {
    if (messageProp === undefined) setMsgInternal(t);
    onMessageChange?.(t);
  };
  const submit = (text: string) => {
    onSubmit?.(text, current);
    if (messageProp === undefined) setMsgInternal("");
  };

  const noticeText = notice
    ? presetStylesNoticeText(notice.kind, notice.kind === "reset" ? baseName : currentStyle?.name ?? "", {
        scope,
        earlierReplies,
      })
    : null;
  const canUndo = notice?.kind === "reset" && !!notice.prev && notice.prev !== base;

  const presets = all.filter((s) => !s.custom);
  const mine = all.filter((s) => s.custom);
  const isSet = current !== base && !!currentStyle;

  return {
    ids,
    all,
    presets,
    mine,
    base,
    baseName,
    current,
    currentStyle,
    isSet,
    select,
    reset,
    undo,
    notice,
    noticeText,
    canUndo,
    view,
    setView,
    open,
    openMenu,
    closeMenu,
    toggleMenu,
    peek,
    setPeek,
    previewStyle,
    triggerRef,
    menuRef,
    listRef,
    rootRef,
    cardRef,
    backToCreate: () => {
      cardMoved.current = true;
      setView("create");
    },
    onMenuKeyDown,
    onGroupKeyDown,
    locked,
    setLocked,
    reference,
    attachReference,
    openReferencePicker: () => fileRef.current?.click(),
    referenceDropProps,
    referenceInputProps,
    dragging,
    canCreate,
    startCreate,
    source,
    setSource,
    example,
    setExample,
    describe,
    setDescribe,
    exampleFile,
    setExampleFile,
    exampleFileRef,
    status,
    canGenerate,
    generate,
    draft,
    setDraft,
    instructionsOpen,
    setInstructionsOpen,
    save,
    message,
    setMessage,
    submit,
    agentName,
    /** Request settings rows: the Style row (current style, or the base style's name) merged with `settingsItems`. */
    settingsItems: (icon?: React.ReactNode) =>
      mergeRequestSettingsItems(
        { id: "style", label: "Style", icon, value: currentStyle?.name ?? baseName, set: isSet },
        props.settingsItems,
      ),
    /** Handles a Request settings row: Style opens "Use style"; others go to `onSettingsSelect`. */
    onSettingsSelect: (id: string) => {
      if (id === "style") openMenu();
      else props.onSettingsSelect?.(id);
    },
    /** When the Request settings menu opens, an open "Use style" closes. */
    onSettingsOpenChange: (o: boolean) => {
      if (o && view === "menu") closeMenu(false);
    },
  };
}

export type PresetStylesState = ReturnType<typeof usePresetStyles>;
