# @nucleux/md3-attachments

Material 3 Attachments — hand the agent the files this request depends on — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).

This is the Material 3 twin of [`@nucleux/attachments`](https://www.npmjs.com/package/@nucleux/attachments) and **shares its API**: the same props, callbacks, states, limits and accessible names. Switch families by changing only the import (`Attachments` → `Md3Attachments`); only the look differs.

## Exports

- **`Md3Attachments`** — root: holds `items`, checks `accept` / `maxSize` / `maxFiles` before upload (refusals in an error-container alert naming the limit), owns the file picker, announces progress politely
- **`Md3AttachmentsTray`** — the list of attached files, as chips (`file-chip`) or outlined preview cards (`preview-card`)
- **`Md3AttachmentsItem`** — one file: state word first, hairline progress while uploading/reading, Retry on a failure, remove named for the file
- **`Md3AttachmentsTrigger`** — the add control (icon button "Attach file", or a labelled button)
- **`Md3AttachmentsDropZone`** — drag-and-drop target that lights up in primary-container
- **`Md3AttachmentsNote`** — what removal does (forward-only)
- `formatFileSize`, and types: `Md3AttachmentsProps`, `Md3AttachmentsItemProps`, `Md3AttachmentsTrayProps`, `Md3AttachmentsTriggerProps`, `Md3AttachmentsDropZoneProps`, `Md3AttachmentsNoteProps`, `Md3AttachmentsVariant`, `Md3AttachmentsStatus`, `AttachmentsFile`, `AttachmentsRejection`, `AttachmentsRejectionReason`

## Install

```bash
pnpm add @nucleux/md3-attachments @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import { Md3Attachments, Md3AttachmentsTray, Md3AttachmentsTrigger, Md3AttachmentsNote } from "@nucleux/md3-attachments";

<Md3Attachments items={items} accept=".pdf,.csv,image/*" maxSize={20 * 1024 * 1024} onFilesAdded={upload} onRemove={remove} onRetry={retry}>
  <Md3AttachmentsTray />
  <Md3AttachmentsTrigger />
  <Md3AttachmentsNote />
</Md3Attachments>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
