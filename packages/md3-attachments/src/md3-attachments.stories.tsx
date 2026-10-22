import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ArrowUp } from "lucide-react";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import {
  Md3Attachments,
  Md3AttachmentsDropZone,
  Md3AttachmentsNote,
  Md3AttachmentsTray,
  Md3AttachmentsTrigger,
  type AttachmentsFile,
  type Md3AttachmentsProps,
} from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const MB = 1024 * 1024;

const meta = {
  title: "Material 3 Agent/Md3Attachments",
  component: Md3Attachments,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story, { id }) =>
      id.endsWith("--site-preview") ? (
        <div className="flex w-[44rem] max-w-full justify-center">
          <Story />
        </div>
      ) : (
        <div className="w-[32rem] bg-md-surface p-4"><Story /></div>
      ),
  ],
  args: {
    accept: ".pdf,.csv,.docx,.xlsx,image/*",
    maxSize: 20 * MB,
    maxFiles: 5,
    onRemove: () => {},
    onRetry: () => {},
    onFilesAdded: () => {},
    onFilesRejected: () => {},
  },
} satisfies Meta<typeof Md3Attachments>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** A Material 3 composer row so the tray reads in context. */
function Composer({ children, placeholder }: { children?: React.ReactNode; placeholder: string }) {
  return (
    <div className="flex h-14 items-center gap-1 rounded-full bg-md-surface-container-high px-2 text-md-on-surface">
      {children}
      <input
        aria-label="Message"
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-md-on-surface-variant"
      />
      <Md3IconButton variant="filled" aria-label="Send">
        <ArrowUp />
      </Md3IconButton>
    </div>
  );
}

const chipItems: AttachmentsFile[] = [
  { id: "csv", name: "Q2-renewals.csv", size: 48 * 1024, type: "text/csv", status: "ready", meta: "1,204 rows" },
  { id: "doc", name: "security-review.docx", size: 1.2 * MB, status: "processing" },
  { id: "pdf", name: "Northwind-proposal.pdf", size: 4.1 * MB, type: "application/pdf", status: "uploading", progress: 62 },
];

/** Chat composer: named chips pinned above the input; what's in context is always visible. */
export const FileChip: Story = {
  args: { variant: "file-chip", items: chipItems },
  render: (args) => (
    <Md3Attachments {...args}>
      <Md3AttachmentsTray />
      <Composer placeholder="What should I do with this?">
        <Md3AttachmentsTrigger />
      </Composer>
      <Md3AttachmentsNote />
    </Md3Attachments>
  ),
};

/** Right rail / email: richer cards that confirm what was loaded, plus a failed file kept with Retry. */
export const PreviewCard: Story = {
  args: {
    variant: "preview-card",
    items: [
      { id: "png", name: "screenshot-bug.png", size: 1.2 * MB, type: "image/png", status: "ready" },
      { id: "pdf", name: "Renewal Playbook v3.pdf", size: 2.4 * MB, type: "application/pdf", status: "ready", meta: "34 pages" },
      { id: "xls", name: "pipeline-export.xlsx", size: 8.7 * MB, status: "error", error: "Upload interrupted" },
    ],
  },
  render: (args) => (
    <Md3Attachments {...args}>
      <Md3AttachmentsTray />
      <Md3AttachmentsTrigger>Attach file</Md3AttachmentsTrigger>
    </Md3Attachments>
  ),
};

/** Creative canvas: the drop zone lit while a file is dragged in. */
export const DropZoneActive: Story = {
  render: (args) => (
    <Md3Attachments {...args}>
      <Md3AttachmentsDropZone active description="PDF, image, CSV, doc · up to 20 MB each" />
    </Md3Attachments>
  ),
};

/** The idle drop zone: drag files in, or choose them with the keyboard. */
export const DropZone: Story = {
  render: (args) => (
    <Md3Attachments {...args}>
      <Md3AttachmentsDropZone />
    </Md3Attachments>
  ),
};

/** Working demo: pick or drop files; uploads and reading are simulated, limits are real (20 MB, 5 files). */
export const Playground: Story = {
  render: (args) => <PlaygroundDemo {...args} />,
};

function PlaygroundDemo(args: Md3AttachmentsProps) {
  const [items, setItems] = React.useState<AttachmentsFile[]>([]);
  const patch = (id: string, next: Partial<AttachmentsFile>) =>
    setItems((all) => all.map((f) => (f.id === id ? { ...f, ...next } : f)));
  const upload = (id: string) => {
    let pct = 0;
    const t = window.setInterval(() => {
      pct += 20;
      if (pct < 100) return patch(id, { status: "uploading", progress: pct });
      window.clearInterval(t);
      patch(id, { status: "processing", progress: undefined });
      window.setTimeout(() => patch(id, { status: "ready" }), 1200);
    }, 300);
  };
  return (
    <Md3Attachments
      {...args}
      items={items}
      onFilesAdded={(files) =>
        files.forEach((file) => {
          const id = `${file.name}-${Date.now()}-${Math.random()}`;
          setItems((all) => [...all, { id, name: file.name, size: file.size, type: file.type, status: "uploading", progress: 0 }]);
          upload(id);
        })
      }
      onRemove={(id) => setItems((all) => all.filter((f) => f.id !== id))}
      onRetry={(id) => upload(id)}
    >
      <Md3AttachmentsDropZone>
        <div className="flex flex-col gap-2 rounded-md-xl border border-md-outline-variant bg-md-surface p-3">
          <Md3AttachmentsTray />
          <Composer placeholder="Ask about the proposal…">
            <Md3AttachmentsTrigger />
          </Composer>
        </div>
      </Md3AttachmentsDropZone>
      <Md3AttachmentsNote />
    </Md3Attachments>
  );
}
