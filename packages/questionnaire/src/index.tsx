import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@nucleux/utils";
import { Button, type ButtonSize, type ButtonVariant } from "@nucleux/button";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/** Whether an item has an answer, was intentionally skipped, or neither. */
export type QuestionnaireItemStatus = "unanswered" | "answered" | "skipped";

/** Answer shortcut scheme: A–Z or 1–9 per item. */
export type QuestionnaireShortcuts = "letters" | "numbers";

/** Optional collection data for a fixed answer. */
export interface QuestionnaireChoiceDefinition {
  value: string;
  disabled?: boolean;
}

/** Optional collection data for one item, passed to `Questionnaire` as `items`. */
export interface QuestionnaireItemDefinition {
  name: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  choices?: readonly QuestionnaireChoiceDefinition[];
}

/** Props a part hands to its `render` target. Spread them onto your element. */
export type QuestionnaireRenderProps = React.HTMLAttributes<HTMLElement> & Record<`data-${string}`, unknown>;

/**
 * Replace a part's default element: pass an element (props are merged onto it)
 * or a function that receives the part's props and render state.
 */
export type QuestionnaireRender<State> =
  | React.ReactElement
  | ((props: QuestionnaireRenderProps, state: State) => React.ReactElement);

/** Render state of QuestionnaireProgress. */
export interface QuestionnaireProgressState {
  current: number;
  total: number;
  first: boolean;
  last: boolean;
}

/** Render state of the navigation actions. */
export interface QuestionnaireActionState {
  visible: boolean;
  disabled: boolean;
  shortcut: string | undefined;
  status: QuestionnaireItemStatus;
}

/** Render state of QuestionnaireInput. */
export interface QuestionnaireInputState {
  disabled: boolean;
  filled: boolean;
  invalid: boolean;
}

/** Render state of QuestionnaireError. */
export interface QuestionnaireErrorState {
  invalid: boolean;
}

/** Render state of QuestionnaireChoices. */
export interface QuestionnaireChoicesState {
  shortcuts: QuestionnaireShortcuts | undefined;
}

/** shadcn Button variant names are accepted as aliases ("default" = primary, "outline" = secondary). */
export type QuestionnaireActionVariant = ButtonVariant | "default" | "outline";
/** shadcn Button size names are accepted as aliases ("default" = md, "xs" = sm). */
export type QuestionnaireActionSize = ButtonSize | "default" | "xs";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

type AnyProps = Record<string, unknown>;

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

/** Render a part as `tag`, or into the consumer's `render` element / function. */
function renderPart<State>(
  tag: keyof JSX.IntrinsicElements,
  props: AnyProps,
  state: State,
  render: QuestionnaireRender<State> | undefined,
): React.ReactElement {
  if (typeof render === "function") return render(props as QuestionnaireRenderProps, state);
  if (React.isValidElement(render)) {
    const element = render as React.ReactElement<AnyProps>;
    const theirs = element.props;
    const merged: AnyProps = { ...props, ...theirs };
    for (const key of Object.keys(props)) {
      const ours = props[key];
      const other = theirs[key];
      if (/^on[A-Z]/.test(key) && typeof ours === "function" && typeof other === "function") {
        merged[key] = (...args: unknown[]) => {
          (other as (...a: unknown[]) => void)(...args);
          (ours as (...a: unknown[]) => void)(...args);
        };
      } else if (key === "className") {
        merged.className = cn(ours as string, other as string);
      } else if (key === "children" && other === undefined) {
        merged.children = ours;
      }
    }
    return React.cloneElement(element, merged);
  }
  return React.createElement(tag, props);
}

const flag = (on: boolean | undefined) => (on ? "" : undefined);

interface Answer {
  checked: string[];
  text: string;
}

const CONTROL = "input[data-questionnaire-control]";

function readAnswer(fieldset: HTMLElement): Answer {
  const checked: string[] = [];
  let text = "";
  fieldset.querySelectorAll<HTMLInputElement>(CONTROL).forEach((input) => {
    if (input.matches(":disabled")) return;
    if (input.type === "radio" || input.type === "checkbox") {
      if (input.checked) checked.push(input.value);
    } else if (!text && input.value.trim() !== "") {
      text = input.value;
    }
  });
  return { checked, text };
}

const sameAnswer = (a: Answer | undefined, b: Answer) =>
  !!a && a.text === b.text && a.checked.length === b.checked.length && a.checked.every((v, i) => v === b.checked[i]);

const hasAnswer = (a: Answer | undefined) => !!a && (a.checked.length > 0 || a.text.trim() !== "");

function shortcutLabel(scheme: QuestionnaireShortcuts | undefined, index: number): string | undefined {
  if (!scheme || index < 0) return undefined;
  if (scheme === "letters") return index < 26 ? String.fromCharCode(65 + index) : undefined;
  return index < 9 ? String(index + 1) : undefined;
}

/* -------------------------------------------------------------------------- */
/* Contexts                                                                   */
/* -------------------------------------------------------------------------- */

interface ItemMeta {
  required: boolean;
  multiple: boolean;
  disabled: boolean;
}

interface RootContextValue {
  shortcuts: QuestionnaireShortcuts | undefined;
  definitions: Map<string, QuestionnaireItemDefinition>;
  active: string | undefined;
  index: number;
  total: number;
  answers: Record<string, Answer>;
  invalid: Record<string, boolean>;
  register: (name: string, meta: ItemMeta) => void;
  unregister: (name: string) => void;
  setElement: (name: string, el: HTMLFieldSetElement | null) => void;
  setAnswer: (name: string, answer: Answer) => void;
  statusOf: (name: string) => QuestionnaireItemStatus;
  isRequired: (name: string) => boolean;
  next: () => void;
  previous: () => void;
  skip: () => void;
}

const RootContext = React.createContext<RootContextValue | null>(null);

function useRoot(part: string): RootContextValue {
  const ctx = React.useContext(RootContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <Questionnaire>.`);
  return ctx;
}

interface ItemContextValue {
  name: string;
  multiple: boolean;
  required: boolean;
  disabled: boolean;
  invalid: boolean;
  measured: boolean;
  checked: string[];
  text: string;
  descriptionId: string;
  errorId: string;
  setHasDescription: (has: boolean) => void;
  setHasError: (has: boolean) => void;
  shortcutFor: (value: string) => string | undefined;
}

const ItemContext = React.createContext<ItemContextValue | null>(null);

function useItem(part: string): ItemContextValue {
  const ctx = React.useContext(ItemContext);
  if (!ctx) throw new Error(`<${part}> must be used inside <QuestionnaireItem>.`);
  return ctx;
}

/* -------------------------------------------------------------------------- */
/* Root                                                                       */
/* -------------------------------------------------------------------------- */

export interface QuestionnaireProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** Controlled active item name. */
  item?: string;
  /** Initially active item name. Defaults to the first enabled item. */
  defaultItem?: string;
  /** Optional item data, so order, progress, actions and shortcuts are known before items mount (SSR). */
  items?: readonly QuestionnaireItemDefinition[];
  /** Called when navigation requests a different item. */
  onItemChange?: (item: string) => void;
  /** Assign A–Z or 1–9 answer shortcuts per item, in definition or DOM order. */
  shortcuts?: QuestionnaireShortcuts;
  /** Disable the browser's constraint UI. Questionnaire validation still runs. Defaults to true. */
  noValidate?: boolean;
}

/**
 * A multi-step form that shows one question at a time. It owns the ordered
 * items, the active item, answer state, validation, progress and navigation;
 * answers live in native radios, checkboxes and text inputs, so read them
 * with `FormData` in `onSubmit` (called only once every enabled item
 * validates). Required items need an answer; optional items need an answer or
 * an explicit Skip. Supports `item`/`onItemChange` control, `defaultItem`,
 * `items` for SSR ordering, and `shortcuts="letters" | "numbers"`.
 */
export const Questionnaire = React.forwardRef<HTMLFormElement, QuestionnaireProps>(
  (
    {
      item: itemProp,
      defaultItem,
      items,
      onItemChange,
      shortcuts,
      noValidate = true,
      onSubmit,
      onReset,
      onKeyDown,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const formRef = React.useRef<HTMLFormElement>(null);
    const elements = React.useRef(new Map<string, HTMLFieldSetElement>());
    const initialItem = React.useRef(defaultItem);
    const pendingFocus = React.useRef<{ name: string; target: "item" | "control" } | null>(null);
    const [metas, setMetas] = React.useState<Record<string, ItemMeta>>({});
    const [internalItem, setInternalItem] = React.useState(defaultItem);
    const [answers, setAnswers] = React.useState<Record<string, Answer>>({});
    const [skipped, setSkipped] = React.useState<Record<string, boolean>>({});
    const [invalid, setInvalid] = React.useState<Record<string, boolean>>({});
    const [, setTick] = React.useState(0);

    const definitions = React.useMemo(
      () => new Map((items ?? []).map((d) => [d.name, d] as const)),
      [items],
    );

    const metaOf = (name: string): ItemMeta => {
      const def = definitions.get(name);
      return (
        metas[name] ?? {
          required: def?.required ?? false,
          multiple: def?.multiple ?? false,
          disabled: def?.disabled ?? false,
        }
      );
    };

    // Item order: the `items` collection when given, otherwise DOM order.
    const domOrder = Object.keys(metas).sort((a, b) => {
      const ea = elements.current.get(a);
      const eb = elements.current.get(b);
      if (!ea || !eb) return 0;
      return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    const order = items
      ? [...items.map((d) => d.name), ...domOrder.filter((n) => !definitions.has(n))]
      : domOrder;
    const enabled = order.filter((n) => !metaOf(n).disabled);

    const requested = itemProp !== undefined ? itemProp : internalItem;
    const active = requested !== undefined && enabled.includes(requested) ? requested : enabled[0];
    const index = active !== undefined ? enabled.indexOf(active) : -1;
    const isLast = index === enabled.length - 1;

    const answered = (name: string) => hasAnswer(answers[name]);
    const statusOf = (name: string): QuestionnaireItemStatus =>
      answered(name) ? "answered" : skipped[name] ? "skipped" : "unanswered";
    const isValid = (name: string) => answered(name) || (!metaOf(name).required && !!skipped[name]);

    const goTo = (name: string, target: "item" | "control") => {
      pendingFocus.current = { name, target };
      if (name !== active) {
        if (itemProp === undefined) setInternalItem(name);
        onItemChange?.(name);
      }
      setTick((t) => t + 1);
    };

    const markInvalid = (names: string[]) =>
      setInvalid((prev) => {
        const nextState = { ...prev };
        for (const n of names) nextState[n] = true;
        return nextState;
      });

    const clearFlag = (setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, name: string) =>
      setter((prev) => {
        if (!prev[name]) return prev;
        const nextState = { ...prev };
        delete nextState[name];
        return nextState;
      });

    const next = () => {
      if (active === undefined) return;
      if (!isValid(active)) {
        markInvalid([active]);
        goTo(active, "control");
        return;
      }
      clearFlag(setInvalid, active);
      const target = enabled[index + 1];
      if (target !== undefined) goTo(target, "item");
    };

    const previous = () => {
      const target = enabled[index - 1];
      if (index > 0 && target !== undefined) goTo(target, "item");
    };

    const skip = () => {
      if (active === undefined || metaOf(active).required) return;
      const el = elements.current.get(active);
      el?.querySelectorAll<HTMLInputElement>(CONTROL).forEach((input) => {
        if (input.type === "radio" || input.type === "checkbox") input.checked = false;
        else input.value = "";
      });
      setAnswers((prev) => ({ ...prev, [active]: { checked: [], text: "" } }));
      setSkipped((prev) => ({ ...prev, [active]: true }));
      clearFlag(setInvalid, active);
      const target = enabled[index + 1];
      if (target !== undefined) goTo(target, "item");
    };

    const continueFlow = () => {
      if (active === undefined) return;
      if (!isLast) {
        next();
        return;
      }
      const form = formRef.current;
      if (!form) return;
      if (typeof form.requestSubmit === "function") form.requestSubmit();
      else form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    };

    // Move focus after navigation or failed validation.
    React.useEffect(() => {
      const pending = pendingFocus.current;
      if (!pending || pending.name !== active) return;
      const el = elements.current.get(pending.name);
      if (!el || el.hidden) return;
      pendingFocus.current = null;
      if (pending.target === "control") {
        const control = Array.from(el.querySelectorAll<HTMLInputElement>(CONTROL)).find(
          (c) => !c.matches(":disabled"),
        );
        (control ?? el).focus();
      } else {
        el.focus();
      }
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      const failing = enabled.filter((n) => !isValid(n));
      if (failing.length > 0) {
        event.preventDefault();
        markInvalid(failing);
        goTo(failing[0]!, "control");
        return;
      }
      onSubmit?.(event);
    };

    const handleReset = (event: React.FormEvent<HTMLFormElement>) => {
      onReset?.(event);
      if (event.defaultPrevented) return;
      setSkipped({});
      setInvalid({});
      if (itemProp === undefined) setInternalItem(initialItem.current);
      else if (initialItem.current !== undefined) onItemChange?.(initialItem.current);
      // Native reset runs after this handler; re-read the restored answers afterwards.
      setTimeout(() => setTick((t) => t + 1), 0);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement;
      const fieldset = active !== undefined ? elements.current.get(active) : undefined;
      const input = target instanceof HTMLInputElement ? target : null;
      const isChoiceInput = !!input && (input.type === "radio" || input.type === "checkbox");
      const isTextEntry =
        (!!input && !isChoiceInput && !["button", "submit", "reset"].includes(input.type)) ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable;

      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        continueFlow();
        return;
      }
      if (event.key === "Enter") {
        // Stop implicit form submission from inputs; continue when answered.
        if (input && (isChoiceInput || isTextEntry)) {
          event.preventDefault();
          if (active !== undefined && answered(active)) continueFlow();
        }
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (!fieldset || !fieldset.contains(target)) return;
        if (isTextEntry && !(input && input.value === "")) return;
        const controls = Array.from(fieldset.querySelectorAll<HTMLInputElement>(CONTROL)).filter(
          (c) => !c.matches(":disabled"),
        );
        if (controls.length === 0) return;
        event.preventDefault();
        const i = input ? controls.indexOf(input) : -1;
        const n = controls.length;
        const nextIndex =
          event.key === "ArrowDown" ? (i < 0 ? 0 : (i + 1) % n) : i < 0 ? n - 1 : (i - 1 + n) % n;
        const control = controls[nextIndex]!;
        control.focus();
        if (control.type === "radio" && !control.checked) control.click();
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        if (isTextEntry || (input && input.type === "radio")) return;
        if (event.key === "ArrowLeft") {
          if (index > 0) {
            event.preventDefault();
            previous();
          }
        } else if (active !== undefined && !isLast && statusOf(active) !== "unanswered") {
          event.preventDefault();
          next();
        }
        return;
      }

      if (shortcuts && fieldset && !isTextEntry && event.key.length === 1) {
        const key = shortcuts === "letters" ? event.key.toUpperCase() : event.key;
        if (!(shortcuts === "letters" ? /^[A-Z]$/ : /^[1-9]$/).test(key)) return;
        const choice = fieldset.querySelector(`[data-shortcut="${key}"]`);
        const control = choice?.querySelector<HTMLInputElement>(CONTROL);
        if (control && !control.matches(":disabled")) {
          event.preventDefault();
          control.focus();
          control.click();
        }
      }
    };

    const register = React.useCallback((name: string, meta: ItemMeta) => {
      setMetas((prev) => {
        const old = prev[name];
        if (old && old.required === meta.required && old.multiple === meta.multiple && old.disabled === meta.disabled)
          return prev;
        return { ...prev, [name]: meta };
      });
    }, []);

    const unregister = React.useCallback((name: string) => {
      setMetas((prev) => {
        if (!(name in prev)) return prev;
        const nextState = { ...prev };
        delete nextState[name];
        return nextState;
      });
    }, []);

    const setElement = React.useCallback((name: string, el: HTMLFieldSetElement | null) => {
      if (el) elements.current.set(name, el);
      else elements.current.delete(name);
    }, []);

    const setAnswer = React.useCallback((name: string, answer: Answer) => {
      setAnswers((prev) => (sameAnswer(prev[name], answer) ? prev : { ...prev, [name]: answer }));
      if (hasAnswer(answer)) {
        const drop = (prev: Record<string, boolean>) => {
          if (!prev[name]) return prev;
          const nextState = { ...prev };
          delete nextState[name];
          return nextState;
        };
        setSkipped(drop);
        setInvalid(drop);
      }
    }, []);

    const context: RootContextValue = {
      shortcuts,
      definitions,
      active,
      index,
      total: enabled.length,
      answers,
      invalid,
      register,
      unregister,
      setElement,
      setAnswer,
      statusOf,
      isRequired: (name) => metaOf(name).required,
      next,
      previous,
      skip,
    };

    return (
      <RootContext.Provider value={context}>
        <form
          ref={mergeRefs(ref, formRef)}
          noValidate={noValidate}
          data-slot="questionnaire"
          data-current={index + 1}
          data-total={enabled.length}
          data-first={flag(index === 0)}
          data-last={flag(enabled.length > 0 && isLast)}
          data-shortcuts={shortcuts}
          className={cn("flex w-full min-w-0 flex-col gap-4", className)}
          onSubmit={handleSubmit}
          onReset={handleReset}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {children}
        </form>
      </RootContext.Provider>
    );
  },
);
Questionnaire.displayName = "Questionnaire";

/* -------------------------------------------------------------------------- */
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

export interface QuestionnaireProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Custom render target; receives `{ current, total, first, last }`. */
  render?: QuestionnaireRender<QuestionnaireProgressState>;
}

/**
 * The position within the enabled items, exposed as a named `progressbar`.
 * Renders "Question {current} of {total}" unless you pass children or a
 * `render` function that formats `state.current` and `state.total`.
 */
export const QuestionnaireProgress = React.forwardRef<HTMLDivElement, QuestionnaireProgressProps>(
  ({ className, render, children, ...props }, ref) => {
    const root = useRoot("QuestionnaireProgress");
    const current = root.index + 1;
    const total = root.total;
    const state: QuestionnaireProgressState = {
      current,
      total,
      first: root.index === 0,
      last: total > 0 && current === total,
    };
    const text = `Question ${current} of ${total}`;
    return renderPart(
      "div",
      {
        ref,
        role: "progressbar",
        "aria-label": "Questionnaire progress",
        "aria-valuemin": 0,
        "aria-valuemax": total,
        "aria-valuenow": current,
        "aria-valuetext": text,
        "data-slot": "questionnaire-progress",
        "data-current": current,
        "data-total": total,
        "data-first": flag(state.first),
        "data-last": flag(state.last),
        className: cn(
          "min-h-[1lh] w-fit min-w-[14ch] text-xs font-medium tabular-nums text-muted-foreground",
          className,
        ),
        ...props,
        children: children ?? text,
      },
      state,
      render,
    );
  },
);
QuestionnaireProgress.displayName = "QuestionnaireProgress";

/* -------------------------------------------------------------------------- */
/* Item                                                                       */
/* -------------------------------------------------------------------------- */

export interface QuestionnaireItemProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "name"> {
  /** Unique item identifier; also the form field name of its answers. */
  name: string;
  /** Requires an answer and hides Skip. */
  required?: boolean;
  /** Renders fixed choices as checkboxes. */
  multiple?: boolean;
  /** Removes the item from progress, navigation, validation and submission. */
  disabled?: boolean;
  /** Marks the item invalid from an external validator. */
  invalid?: boolean;
  /** Observes "unanswered" / "answered" / "skipped" changes. */
  onStatusChange?: (status: QuestionnaireItemStatus) => void;
}

/**
 * One questionnaire step, rendered as a `<fieldset>` (QuestionnaireTitle is
 * its `<legend>`). Only the active item is shown; the others stay mounted but
 * hidden so their answers still submit. `required` items need an answer,
 * `multiple` items use checkboxes, and `disabled` items drop out of the flow.
 */
export const QuestionnaireItem = React.forwardRef<HTMLFieldSetElement, QuestionnaireItemProps>(
  (
    {
      name,
      required = false,
      multiple = false,
      disabled = false,
      invalid: invalidProp = false,
      onStatusChange,
      onChange,
      className,
      children,
      "aria-describedby": describedByProp,
      ...props
    },
    ref,
  ) => {
    const root = useRoot("QuestionnaireItem");
    const elRef = React.useRef<HTMLFieldSetElement | null>(null);
    const baseId = React.useId();
    const [hasDescription, setHasDescription] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);
    const [domChoices, setDomChoices] = React.useState<string[]>([]);
    const { register, unregister, setElement, setAnswer } = root;

    useIsoLayoutEffect(() => {
      register(name, { required, multiple, disabled });
    }, [register, name, required, multiple, disabled]);
    useIsoLayoutEffect(() => () => unregister(name), [unregister, name]);

    // Re-read answers from the native controls after every render, so defaults,
    // controlled props and resets are all reflected.
    useIsoLayoutEffect(() => {
      const el = elRef.current;
      if (!el) return;
      setAnswer(name, readAnswer(el));
      const values = Array.from(el.querySelectorAll<HTMLElement>("[data-questionnaire-choice-value]"))
        .filter((c) => !c.hasAttribute("data-disabled"))
        .map((c) => c.getAttribute("data-questionnaire-choice-value") ?? "");
      setDomChoices((prev) =>
        prev.length === values.length && prev.every((v, i) => v === values[i]) ? prev : values,
      );
    });

    const active = root.active === name && !disabled;
    const status = root.statusOf(name);
    const invalid = invalidProp || !!root.invalid[name];

    const lastStatus = React.useRef(status);
    React.useEffect(() => {
      if (lastStatus.current !== status) {
        lastStatus.current = status;
        onStatusChange?.(status);
      }
    }, [status, onStatusChange]);

    const definedChoices = root.definitions.get(name)?.choices;
    const choiceOrder = definedChoices ? definedChoices.filter((c) => !c.disabled).map((c) => c.value) : domChoices;
    const answer = root.answers[name];

    const descriptionId = `${baseId}-description`;
    const errorId = `${baseId}-error`;
    const describedBy =
      [describedByProp, hasDescription && descriptionId, invalid && hasError && errorId].filter(Boolean).join(" ") ||
      undefined;

    const handleChange = (event: React.FormEvent<HTMLFieldSetElement>) => {
      onChange?.(event);
      const el = elRef.current;
      const target = event.target as HTMLInputElement;
      if (!el || !target.matches?.(CONTROL)) return;
      if (!multiple) {
        // A single-answer item keeps one answer: a choice clears the freeform
        // text, and typing clears the selected choice.
        if (target.type === "radio" && target.checked) {
          el.querySelectorAll<HTMLInputElement>(`${CONTROL}[data-questionnaire-control="input"]`).forEach((i) => {
            i.value = "";
          });
        } else if (target.getAttribute("data-questionnaire-control") === "input" && target.value.trim() !== "") {
          el.querySelectorAll<HTMLInputElement>(`${CONTROL}[type="radio"]`).forEach((i) => {
            i.checked = false;
          });
        }
      }
      setAnswer(name, readAnswer(el));
    };

    const itemContext: ItemContextValue = {
      name,
      multiple,
      required,
      disabled,
      invalid,
      measured: answer !== undefined,
      checked: answer?.checked ?? [],
      text: answer?.text ?? "",
      descriptionId,
      errorId,
      setHasDescription,
      setHasError,
      shortcutFor: (value) => shortcutLabel(root.shortcuts, choiceOrder.indexOf(value)),
    };

    return (
      <ItemContext.Provider value={itemContext}>
        <fieldset
          ref={mergeRefs(ref, elRef, (el: HTMLFieldSetElement | null) => setElement(name, el))}
          tabIndex={-1}
          disabled={disabled}
          hidden={!active}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          data-slot="questionnaire-item"
          data-active={flag(active)}
          data-status={status}
          data-required={flag(required)}
          data-multiple={flag(multiple)}
          data-disabled={flag(disabled)}
          data-invalid={flag(invalid)}
          className={cn(
            "m-0 flex min-w-0 flex-col gap-4 border-0 p-0 outline-none [&[hidden]]:hidden",
            className,
          )}
          onChange={handleChange}
          {...props}
        >
          {children}
        </fieldset>
      </ItemContext.Provider>
    );
  },
);
QuestionnaireItem.displayName = "QuestionnaireItem";

/* -------------------------------------------------------------------------- */
/* Title / Description                                                        */
/* -------------------------------------------------------------------------- */

export interface QuestionnaireTitleProps extends React.HTMLAttributes<HTMLLegendElement> {
  /** Custom render target. If it is not a legend, give it an `id` and pass it to the item's `aria-labelledby`. */
  render?: QuestionnaireRender<Record<string, never>>;
}

/** The question, rendered as the item's `<legend>` so it names the fieldset. */
export const QuestionnaireTitle = React.forwardRef<HTMLLegendElement, QuestionnaireTitleProps>(
  ({ className, render, ...props }, ref) =>
    renderPart(
      "legend",
      {
        ref,
        "data-slot": "questionnaire-title",
        className: cn(
          "text-pretty text-base font-medium leading-snug [&:not(:has(~[data-slot=questionnaire-description]))]:mb-4",
          className,
        ),
        ...props,
      },
      {},
      render,
    ),
);
QuestionnaireTitle.displayName = "QuestionnaireTitle";

export interface QuestionnaireDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Custom render target. */
  render?: QuestionnaireRender<Record<string, never>>;
}

/** Supporting text for the question, connected to the item with `aria-describedby`. */
export const QuestionnaireDescription = React.forwardRef<HTMLParagraphElement, QuestionnaireDescriptionProps>(
  ({ className, render, id, ...props }, ref) => {
    const item = useItem("QuestionnaireDescription");
    const { setHasDescription } = item;
    React.useEffect(() => {
      setHasDescription(true);
      return () => setHasDescription(false);
    }, [setHasDescription]);
    return renderPart(
      "p",
      {
        ref,
        id: id ?? item.descriptionId,
        "data-slot": "questionnaire-description",
        className: cn("text-pretty text-sm text-muted-foreground", className),
        ...props,
      },
      {},
      render,
    );
  },
);
QuestionnaireDescription.displayName = "QuestionnaireDescription";

/* -------------------------------------------------------------------------- */
/* Choices                                                                    */
/* -------------------------------------------------------------------------- */

export interface QuestionnaireChoicesProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Custom render target; receives `{ shortcuts }`. */
  render?: QuestionnaireRender<QuestionnaireChoicesState>;
}

/** Layout container for an item's fixed choices and optional freeform input. */
export const QuestionnaireChoices = React.forwardRef<HTMLDivElement, QuestionnaireChoicesProps>(
  ({ className, render, ...props }, ref) => {
    const root = useRoot("QuestionnaireChoices");
    return renderPart(
      "div",
      {
        ref,
        "data-slot": "questionnaire-choices",
        "data-shortcuts": root.shortcuts,
        className: cn("group/questionnaire-choices grid min-w-0 gap-2", className),
        ...props,
      },
      { shortcuts: root.shortcuts },
      render,
    );
  },
);
QuestionnaireChoices.displayName = "QuestionnaireChoices";

export interface QuestionnaireChoiceProps
  extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "onChange" | "defaultChecked"> {
  /** The submitted answer value. */
  value: string;
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state (e.g. when resuming a draft). */
  defaultChecked?: boolean;
  /** Disables this answer. */
  disabled?: boolean;
  /** Native change handler of the underlying radio / checkbox. */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

/**
 * A fixed answer: a `<label>` wrapping a native radio (or checkbox when the
 * item is `multiple`), a visual indicator, the label content and, when the
 * root has `shortcuts`, its key hint. Exposes `data-type`, `data-checked`,
 * `data-disabled`, `data-invalid` and `data-shortcut`.
 */
export const QuestionnaireChoice = React.forwardRef<HTMLLabelElement, QuestionnaireChoiceProps>(
  ({ value, checked, defaultChecked, disabled = false, onChange, className, children, ...props }, ref) => {
    const item = useItem("QuestionnaireChoice");
    const type = item.multiple ? "checkbox" : "radio";
    const isChecked = checked ?? (item.measured ? item.checked.includes(value) : !!defaultChecked);
    const isDisabled = disabled || item.disabled;
    const shortcut = disabled ? undefined : item.shortcutFor(value);
    return (
      <label
        ref={ref}
        data-slot="questionnaire-choice"
        data-questionnaire-choice-value={value}
        data-type={type}
        data-checked={flag(isChecked)}
        data-unchecked={flag(!isChecked)}
        data-disabled={flag(isDisabled)}
        data-invalid={flag(item.invalid)}
        data-shortcut={shortcut}
        className={cn(
          "group/questionnaire-choice relative flex min-h-11 cursor-pointer select-none items-start gap-2.5 rounded-lg border border-input bg-transparent px-3 py-2.5 text-start text-sm outline-none transition-colors hover:bg-muted/50 has-[>input:focus-visible]:border-ring has-[>input:focus-visible]:ring-2 has-[>input:focus-visible]:ring-ring/50 data-[invalid]:border-destructive data-[checked]:border-primary/40 data-[checked]:bg-muted",
          "data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          className,
        )}
        {...props}
      >
        <input
          type={type}
          name={item.name}
          value={value}
          checked={checked}
          defaultChecked={checked === undefined ? defaultChecked : undefined}
          disabled={disabled}
          onChange={onChange}
          aria-invalid={item.invalid || undefined}
          aria-keyshortcuts={shortcut}
          data-questionnaire-control="choice"
          data-slot="questionnaire-choice-input"
          className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
        />
        <span
          aria-hidden="true"
          data-slot="questionnaire-choice-indicator"
          className={cn(
            "pointer-events-none relative flex size-4 shrink-0 translate-y-[0.1125rem] items-center justify-center rounded-[4px] border border-input group-has-[[data-slot=questionnaire-choice-description]]/questionnaire-choice:translate-y-0.5 group-data-[checked]/questionnaire-choice:border-primary group-data-[checked]/questionnaire-choice:bg-primary group-data-[checked]/questionnaire-choice:text-primary-foreground",
            type === "radio" && "rounded-full",
          )}
        >
          {type === "radio" ? (
            <span
              data-slot="questionnaire-choice-indicator-dot"
              className="hidden size-2 rounded-full bg-primary-foreground group-data-[checked]/questionnaire-choice:block"
            />
          ) : (
            <Check
              data-slot="questionnaire-choice-indicator-check"
              className="hidden size-3.5 group-data-[checked]/questionnaire-choice:block"
            />
          )}
        </span>
        <span data-slot="questionnaire-choice-label" className="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug">
          {children}
        </span>
        {shortcut ? (
          <span
            aria-hidden="true"
            data-slot="questionnaire-choice-shortcut"
            className="pointer-events-none ms-auto inline-flex size-5 shrink-0 translate-y-[0.1125rem] items-center justify-center rounded-md border border-input bg-background font-mono text-[0.625rem] font-medium leading-none text-muted-foreground group-has-[[data-slot=questionnaire-choice-description]]/questionnaire-choice:translate-y-0.5"
          >
            {shortcut}
          </span>
        ) : null}
      </label>
    );
  },
);
QuestionnaireChoice.displayName = "QuestionnaireChoice";

export interface QuestionnaireChoiceDescriptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Additional classes merged onto the description. */
  className?: string;
}

/** Secondary line of text inside a QuestionnaireChoice. */
export const QuestionnaireChoiceDescription = React.forwardRef<HTMLSpanElement, QuestionnaireChoiceDescriptionProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      data-slot="questionnaire-choice-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  ),
);
QuestionnaireChoiceDescription.displayName = "QuestionnaireChoiceDescription";

/* -------------------------------------------------------------------------- */
/* Input                                                                      */
/* -------------------------------------------------------------------------- */

export interface QuestionnaireInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  /** Custom render target; receives `{ disabled, filled, invalid }`. */
  render?: QuestionnaireRender<QuestionnaireInputState>;
}

/**
 * A freeform answer: a native text input whose form name is managed by the
 * item (it only submits when filled). In a single-answer item, typing clears
 * any selected choice and vice versa. Always give it an accessible name with
 * a visible label, `aria-label` or `aria-labelledby`.
 */
export const QuestionnaireInput = React.forwardRef<HTMLInputElement, QuestionnaireInputProps>(
  ({ className, type = "text", disabled = false, render, ...props }, ref) => {
    const item = useItem("QuestionnaireInput");
    const initial = String(props.value ?? props.defaultValue ?? "");
    const filled = item.measured ? item.text.trim() !== "" : initial.trim() !== "";
    const isDisabled = disabled || item.disabled;
    const state: QuestionnaireInputState = { disabled: isDisabled, filled, invalid: item.invalid };
    return (
      <div data-slot="questionnaire-input-wrapper" className="group/questionnaire-input relative w-full min-w-0">
        {renderPart(
          "input",
          {
            ref,
            type,
            name: filled ? item.name : undefined,
            disabled,
            "aria-invalid": item.invalid || undefined,
            "data-questionnaire-control": "input",
            "data-slot": "questionnaire-input",
            "data-filled": flag(filled),
            "data-empty": flag(!filled),
            "data-disabled": flag(isDisabled),
            "data-invalid": flag(item.invalid),
            className: cn(
              "h-8 min-h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-[color,box-shadow,background-color] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/20 sm:min-h-0 md:text-sm",
              "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
              className,
            ),
            ...props,
          },
          state,
          render,
        )}
      </div>
    );
  },
);
QuestionnaireInput.displayName = "QuestionnaireInput";

/* -------------------------------------------------------------------------- */
/* Error                                                                      */
/* -------------------------------------------------------------------------- */

export interface QuestionnaireErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** Custom render target; receives `{ invalid }`. */
  render?: QuestionnaireRender<QuestionnaireErrorState>;
}

/**
 * The validation message. Hidden until the item fails validation, then shown
 * with `role="alert"` and linked to the item via `aria-describedby`. Defaults
 * to "Choose an answer to continue." (required) or "Choose an answer or skip
 * this question." (optional); pass children to replace it.
 */
export const QuestionnaireError = React.forwardRef<HTMLParagraphElement, QuestionnaireErrorProps>(
  ({ className, render, children, id, ...props }, ref) => {
    const item = useItem("QuestionnaireError");
    const { setHasError } = item;
    React.useEffect(() => {
      setHasError(true);
      return () => setHasError(false);
    }, [setHasError]);
    const message =
      children ?? (item.required ? "Choose an answer to continue." : "Choose an answer or skip this question.");
    return renderPart(
      "p",
      {
        ref,
        id: id ?? item.errorId,
        role: item.invalid ? "alert" : undefined,
        hidden: !item.invalid || undefined,
        "data-slot": "questionnaire-error",
        "data-invalid": flag(item.invalid),
        className: cn("mt-2 text-sm text-destructive [&[hidden]]:hidden", className),
        ...props,
        children: item.invalid ? message : null,
      },
      { invalid: item.invalid },
      render,
    );
  },
);
QuestionnaireError.displayName = "QuestionnaireError";

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

export interface QuestionnaireActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional classes merged onto the actions row. */
  className?: string;
}

/** Layout row for Previous (start), Skip and Next/Submit (end). Styling only. */
export const QuestionnaireActions = React.forwardRef<HTMLDivElement, QuestionnaireActionsProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="questionnaire-actions"
      className={cn(
        "grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:min-h-8",
        className,
      )}
      {...props}
    />
  ),
);
QuestionnaireActions.displayName = "QuestionnaireActions";

export interface QuestionnaireActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant. Accepts Nucleux variants plus shadcn's "default" and "outline". */
  variant?: QuestionnaireActionVariant;
  /** Button size. Accepts Nucleux sizes plus shadcn's "default" and "xs". */
  size?: QuestionnaireActionSize;
  /** Custom render target; receives `{ visible, disabled, shortcut, status }`. */
  render?: QuestionnaireRender<QuestionnaireActionState>;
}

type ActionKind = "previous" | "skip" | "next" | "submit";

const variantMap: Record<QuestionnaireActionVariant, ButtonVariant> = {
  default: "primary",
  outline: "secondary",
  primary: "primary",
  cta: "cta",
  secondary: "secondary",
  ghost: "ghost",
  destructive: "destructive",
  link: "link",
};

const sizeMap: Record<QuestionnaireActionSize, ButtonSize> = {
  default: "md",
  xs: "sm",
  sm: "sm",
  md: "md",
  lg: "lg",
  icon: "icon",
  "icon-sm": "icon-sm",
  "icon-lg": "icon-lg",
};

const actionLayout: Record<ActionKind, string> = {
  previous: "col-start-1 row-start-1 justify-self-start",
  skip: "col-start-2 row-start-1 justify-self-end",
  next: "col-start-3 row-start-1 justify-self-end",
  submit: "col-start-3 row-start-1 justify-self-end",
};

const actionLabel: Record<ActionKind, string> = {
  previous: "Previous",
  skip: "Skip",
  next: "Next",
  submit: "Submit",
};

function useAction(
  kind: ActionKind,
  { variant, size, render, disabled, onClick, className, children, ...props }: QuestionnaireActionProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const root = useRoot(`Questionnaire${actionLabel[kind]}`);
  const last = root.total > 0 && root.index === root.total - 1;
  const visible =
    root.active !== undefined &&
    (kind === "previous"
      ? root.index > 0
      : kind === "skip"
        ? !root.isRequired(root.active)
        : kind === "next"
          ? !last
          : last);
  const status = root.active !== undefined ? root.statusOf(root.active) : "unanswered";
  const shortcut = (kind === "next" || kind === "submit") && visible && !disabled ? "Enter" : undefined;
  const state: QuestionnaireActionState = { visible, disabled: !!disabled, shortcut, status };
  const nucleuxVariant = variantMap[variant ?? (kind === "next" || kind === "submit" ? "default" : "outline")];
  const nucleuxSize = sizeMap[size ?? "default"];

  return renderPart(
    "button",
    {
      ref,
      type: kind === "submit" ? "submit" : "button",
      disabled,
      hidden: !visible || undefined,
      "aria-keyshortcuts": shortcut ? "Control+Enter Meta+Enter" : undefined,
      "data-slot": `questionnaire-${kind}`,
      "data-size": size ?? "default",
      "data-variant": variant ?? (kind === "next" || kind === "submit" ? "default" : "outline"),
      "data-visible": flag(visible),
      "data-hidden": flag(!visible),
      "data-disabled": flag(disabled),
      "data-shortcut": shortcut,
      "data-status": status,
      className: cn(actionLayout[kind], "min-h-11 sm:min-h-0 data-[hidden]:hidden", className),
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (kind === "previous") root.previous();
        else if (kind === "skip") root.skip();
        else if (kind === "next") root.next();
      },
      ...props,
      children: children ?? actionLabel[kind],
    },
    state,
    render ?? <Button variant={nucleuxVariant} size={nucleuxSize} />,
  );
}

/** Goes back to the previous enabled item. Hidden on the first item. */
export const QuestionnairePrevious = React.forwardRef<HTMLButtonElement, QuestionnaireActionProps>((props, ref) =>
  useAction("previous", props, ref),
);
QuestionnairePrevious.displayName = "QuestionnairePrevious";

/** Records the active optional item as intentionally skipped and moves on. Hidden on required items. */
export const QuestionnaireSkip = React.forwardRef<HTMLButtonElement, QuestionnaireActionProps>((props, ref) =>
  useAction("skip", props, ref),
);
QuestionnaireSkip.displayName = "QuestionnaireSkip";

/** Validates the active item and moves to the next one. Hidden on the last item. */
export const QuestionnaireNext = React.forwardRef<HTMLButtonElement, QuestionnaireActionProps>((props, ref) =>
  useAction("next", props, ref),
);
QuestionnaireNext.displayName = "QuestionnaireNext";

/** Submits the form after validating every enabled item. Shown only on the last item. */
export const QuestionnaireSubmit = React.forwardRef<HTMLButtonElement, QuestionnaireActionProps>((props, ref) =>
  useAction("submit", props, ref),
);
QuestionnaireSubmit.displayName = "QuestionnaireSubmit";
