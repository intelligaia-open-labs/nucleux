# Pure MCP-driven login — transcript

## search_components 'login form text field button checkbox'

```
- AgentComposer (@nucleux/agent-composer) — Agent task composer with toolbar — Nucleux agentic UI for React.
- Form (@nucleux/form) — Accessible form primitives — Nucleux agentic UI for React.
- Input (@nucleux/input) — Text input field — Nucleux agentic UI for React.
- LinkButton (@nucleux/link-button) — Link-styled action button — Nucleux agentic UI for React.
- Md3AgentComposer (@nucleux/md3-agent-composer) — Material 3 agent task composer — Nucleux agentic UI for React.
- Md3Button (@nucleux/md3-button) — Material 3 button (filled, tonal, outlined, text, elevated) — Nucleux agentic UI for React.
- Md3TextField (@nucleux/md3-text-field) — Material 3 text field (filled, outlined) — Nucleux agentic UI for React.
- ModularConsent (@nucleux/modular-consent) — Agent permission/consent panel — Nucleux agentic UI for React.
- RewriteMenu (@nucleux/rewrite-menu) — RewriteMenu — a menu of AI rewrite and transform actions — Nucleux agentic UI for React.
- ActionConfirmation (@nucleux/action-confirmation) — ActionConfirmation — a guardrail before an agent takes a consequential action — Nucleux agentic UI for React.
- Alert (@nucleux/alert) — Contextual message banner (info/success/warning/error) — Nucleux agentic UI for React.
- AttachmentTile (@nucleux/attachment-tile) — AttachmentTile — removable file and image context tiles for the composer — Nucleux agentic UI for React.
```

## get_setup · html

```
# Nucleux setup for plain HTML (no React) — @nucleux/react@0.4.0

Nucleux styling is Tailwind + CSS variables, so any HTML page can use the component markup.

1) Install Tailwind + tokens:
```bash
npm i -D tailwindcss @nucleux/tokens
```
2) `tailwind.config.js`:
```js
module.exports = { presets: [require("@nucleux/tokens/preset")], content: ["./**/*.html"] };
```
3) `input.css` (pulls in the @tailwind layers + the --nx-* design tokens):
```css
@import "@nucleux/tokens/styles.css";
```
4) Build the stylesheet:
```bash
npx tailwindcss -i input.css -o output.css --minify
```
5) Link it, then paste component markup from `get_component` (framework:"html"):
```html
<link rel="stylesheet" href="output.css" />
```

Dark theme: add `class="dark"` on `<html>`. The static HTML carries styling only — for
interactive behavior use the React packages (framework:"react").
```

## get_component md3-text-field · html

```
# Md3TextField  (HTML)

A Material Design 3 text field (filled or outlined) with a floating label,
optional leading/trailing icons, supporting text, and an error state.

Static HTML with Tailwind classes. Requires the Nucleux Tailwind preset + tokens CSS — run `get_setup` with framework:"html". Behavior (menus, dialogs, toggles) is not included; wire it up yourself or use the React package.

```html
<div class="w-full"><div class="relative"><input id=":R0:" placeholder=" " aria-describedby=":R0:-support" class="peer h-14 w-full text-base text-md-on-surface outline-none transition-colors placeholder:text-transparent disabled:cursor-not-allowed pl-4 pr-4 rounded-t-md-xs border-0 border-b-2 bg-md-surface-container-high pb-2 pt-6 border-md-on-surface-variant focus:border-md-primary"/><label for=":R0:" class="pointer-events-none absolute transition-all left-4 top-2 text-xs peer-placeholder-shown:text-base peer-placeholder-shown:text-md-on-surface-variant peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs text-md-on-surface-variant peer-focus:text-md-primary">Email</label></div><p id=":R0:-support" class="px-4 pt-1 text-xs text-md-on-surface-variant">Required</p></div>
```
```

## get_component md3-button · html

```
# Md3Button  (HTML)

A Material Design 3 button. Five variants (filled, tonal, elevated, outlined,
text) with an on-color state layer for hover/focus/press.

Static HTML with Tailwind classes. Requires the Nucleux Tailwind preset + tokens CSS — run `get_setup` with framework:"html". Behavior (menus, dialogs, toggles) is not included; wire it up yourself or use the React package.

```html
<button type="button" class="relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-full text-sm font-medium transition-shadow px-6 [&_svg]:size-[18px] before:absolute before:inset-0 before:bg-current before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12] outline-none focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2 focus-visible:ring-offset-md-surface disabled:pointer-events-none disabled:opacity-[0.38] disabled:shadow-none bg-md-primary text-md-on-primary hover:shadow-md-1"><span class="relative">Save</span></button>
```
```

## get_component md3-checkbox · html

```
# Md3Checkbox  (HTML)

A Material Design 3 checkbox with a circular state layer and error-free tokens.

Static HTML with Tailwind classes. Requires the Nucleux Tailwind preset + tokens CSS — run `get_setup` with framework:"html". Behavior (menus, dialogs, toggles) is not included; wire it up yourself or use the React package.

```html
<button type="button" role="checkbox" aria-checked="true" class="relative inline-flex h-10 w-10 items-center justify-center rounded-full outline-none before:absolute before:inset-0 before:rounded-full before:bg-md-on-surface before:opacity-0 before:transition-opacity before:content-[''] hover:before:opacity-[0.08] focus-visible:before:opacity-[0.12] active:before:opacity-[0.12] focus-visible:ring-2 focus-visible:ring-md-primary disabled:pointer-events-none disabled:opacity-[0.38]" aria-label="Accept"><span class="relative flex h-[18px] w-[18px] items-center justify-center rounded-[2px] border-2 transition-colors [&_svg]:size-[14px] border-md-primary bg-md-primary text-md-on-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg></span></button>
```
```

## get_component label · html

```
# Label  (HTML)

An accessible caption for a form control. Pair with `htmlFor`.

Static HTML with Tailwind classes. Requires the Nucleux Tailwind preset + tokens CSS — run `get_setup` with framework:"html". Behavior (menus, dialogs, toggles) is not included; wire it up yourself or use the React package.

```html
<label class="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="nm">Name</label><input id="nm"/>
```
```

## get_component button · html

```
# Button  (HTML)

Button — variants, sizes, and icons — Nucleux agentic UI for React.

Static HTML with Tailwind classes. Requires the Nucleux Tailwind preset + tokens CSS — run `get_setup` with framework:"html". Behavior (menus, dialogs, toggles) is not included; wire it up yourself or use the React package.

```html
<button type="button" class="inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap font-semibold tracking-[0.005em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 border border-border bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 rounded-lg px-4 text-sm">Save</button>
```
```

## get_component checkbox · html

```
# Checkbox  (HTML)

Accessible checkbox (role=checkbox). Controlled via `checked` or uncontrolled.

Static HTML with Tailwind classes. Requires the Nucleux Tailwind preset + tokens CSS — run `get_setup` with framework:"html". Behavior (menus, dialogs, toggles) is not included; wire it up yourself or use the React package.

```html
<button type="button" role="checkbox" aria-checked="true" data-state="checked" class="inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 border-primary bg-primary text-primary-foreground" aria-label="Accept"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check size-3"><path d="M20 6 9 17l-5-5"></path></svg></button>
```
```

## get_component separator · html

```
# Separator  (HTML)

A thin dividing line between content, horizontal or vertical.

Static HTML with Tailwind classes. Requires the Nucleux Tailwind preset + tokens CSS — run `get_setup` with framework:"html". Behavior (menus, dialogs, toggles) is not included; wire it up yourself or use the React package.

```html
<div role="none" class="shrink-0 bg-border h-px w-full"></div>
```
```
