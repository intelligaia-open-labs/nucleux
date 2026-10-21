# @nucleux/attachments

Attachments — upload files, photos, docs for the AI to read — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

## Exports

Built on `@nucleux/attachment` (`Attachment`, `AttachmentGroup`).

- **`Attachments`** — the root: holds `items`, checks limits before upload (`accept`, `maxSize` bytes, `maxFiles`), owns the file picker, shows refusals in an alert that names the limit, and announces "2 files attached, 1 still being read". Props: `items`, `variant` (`"file-chip"` | `"preview-card"`), `onFilesAdded(files)`, `onFilesRejected(rejections)`, `onRemove(id)`, `onRetry(id)`, `disabled`, `label`.
- **`AttachmentsTray`** — the list of what is in context: chips above the composer, or preview cards.
- **`AttachmentsItem`** — one file. The state is a word first (Uploading 40%, Reading, Ready, Couldn't attach), then size and detail; a hairline bar along its bottom edge is determinate while uploading and indeterminate while reading; a failed file stays listed with **Retry**.
- **`AttachmentsTrigger`** — the add button (icon-only "Attach file", or labelled with children).
- **`AttachmentsDropZone`** — drag-and-drop target that lights up while a file is dragged in (`active` forces it). Standalone it is a dashed box with a "Choose files" button; wrapped around a composer or canvas it covers it only while dragging.
- **`AttachmentsNote`** — says what removal does: forward-only.
- `formatFileSize(bytes)`; types `AttachmentsFile`, `AttachmentsStatus`, `AttachmentsVariant`, `AttachmentsRejection`, `AttachmentsRejectionReason` and each component's Props.

Variants: `file-chip` and `preview-card` are the `variant` prop; `drop-zone-active` is `AttachmentsDropZone`.

Uploading is the app's job: start it in `onFilesAdded`, then feed each item's `status` and `progress` back through `items`.

## Install

```bash
pnpm add @nucleux/attachments @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Attachments, AttachmentsTray, AttachmentsTrigger, AttachmentsNote } from "@nucleux/attachments";

<Attachments
  items={files}
  accept=".pdf,.csv,image/*"
  maxSize={20 * 1024 * 1024}
  maxFiles={5}
  onFilesAdded={upload}
  onRemove={remove}
  onRetry={retry}
>
  <AttachmentsTray />
  <AttachmentsTrigger />
  <AttachmentsNote />
</Attachments>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
