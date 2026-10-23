import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@nucleux/utils";
import {
  useRequestSettings,
  type RequestSettingsItem,
  type RequestSettingsProps,
} from "@nucleux/open-input";
import { Md3IconButton } from "@nucleux/md3-icon-button";

export type Md3RequestSettingsItem = RequestSettingsItem;
export type Md3RequestSettingsProps = RequestSettingsProps;
export {
  REQUEST_SETTINGS_ORDER,
  mergeRequestSettingsItems,
  requestSettingsLabel,
  useRequestSettings,
} from "@nucleux/open-input";

const stateLayer =
  "before:pointer-events-none before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12] motion-reduce:before:transition-none";

/**
 * The Material 3 Request settings control: a standard icon button with the
 * tune icon, in the same states as + (rest, hover, pressed, open, disabled),
 * placed right after + in the composer. Its menu surface (248dp minimum) lists
 * Mode, Tone, Style and Improve prompt with a 20dp icon and the current value
 * on the right — primary and semibold when set. A primary dot on the control
 * and its accessible name say what is on. Same API, keyboard model and
 * accessible names as `RequestSettings` from `@nucleux/open-input`. To anchor
 * the menu to the composer rather than the button (as on nucleux.in), give the
 * root `static` and make the composer `relative`.
 */
export const Md3RequestSettings = React.forwardRef<HTMLButtonElement, Md3RequestSettingsProps>((props, ref) => {
  const {
    items,
    onSelect: _onSelect,
    open: _open,
    defaultOpen: _defaultOpen,
    onOpenChange: _onOpenChange,
    label: _label,
    disabled,
    className,
    ...rest
  } = props;
  const rs = useRequestSettings(props, ref);
  return (
    <div ref={rs.rootRef} className={cn("font-md", "relative inline-flex", className)} {...rest}>
      <Md3IconButton
        {...rs.buttonProps}
        disabled={disabled}
        aria-label={rs.name}
        className={cn("shrink-0 [&_svg]:size-6", rs.open && "bg-md-on-surface/[0.08]")}
      >
        <SlidersHorizontal aria-hidden="true" />
        {rs.anySet && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-1 -top-1 size-2 rounded-full bg-md-primary ring-2 ring-md-surface"
          />
        )}
      </Md3IconButton>
      {rs.open && (
        <div
          {...rs.menuProps}
          className="absolute bottom-full left-0 z-50 mb-2.5 min-w-[248px] rounded-md-md bg-md-surface p-1.5 text-left font-normal text-md-on-surface shadow-md-3 outline-none animate-nx-fade-in motion-reduce:animate-none"
        >
          {items.map((item) => (
            <button
              {...rs.itemProps(item)}
              key={item.id}
              className={cn(
                "relative flex w-full items-center gap-3 overflow-hidden rounded-md-sm px-[11px] py-[9px] text-left text-[13px] leading-5 text-md-on-surface outline-none",
                stateLayer,
                "focus-visible:before:opacity-[0.12]",
                item.disabled && "cursor-not-allowed opacity-[0.38]",
              )}
            >
              <span
                aria-hidden="true"
                className="relative grid size-5 shrink-0 place-items-center text-md-on-surface-variant [&_svg]:size-5"
              >
                {item.icon}
              </span>
              <span className="relative min-w-0 flex-1 truncate">{item.label}</span>
              {item.value && (
                <span
                  className={cn(
                    "relative ml-3 shrink-0 text-[11px]",
                    item.set ? "font-semibold text-md-primary" : "text-md-on-surface-variant",
                  )}
                >
                  {item.value}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
Md3RequestSettings.displayName = "Md3RequestSettings";
