import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ArrowUp } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@nucleux/input-group";
import {
  Attachments,
  AttachmentsDropZone,
  AttachmentsNote,
  AttachmentsTray,
  AttachmentsTrigger,
  type AttachmentsFile,
  type AttachmentsProps,
} from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const MB = 1024 * 1024;

const meta = {
  title: "Agent/Attachments",
  component: Attachments,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story, { id }) =>
      id.endsWith("--site-preview") ? (
        <div className="flex w-[44rem] max-w-full justify-center">
          <Story />
        </div>
      ) : (
        <div className="w-[32rem]"><Story /></div>
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
} satisfies Meta<typeof Attachments>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** A composer row (InputGroup) so the tray reads in context. */
function Composer({ children, placeholder }: { children?: React.ReactNode; placeholder: string }) {
  return (
    <InputGroup className="h-11 rounded-full">
      <InputGroupAddon align="inline-start">{children}</InputGroupAddon>
      <InputGroupInput aria-label="Message" placeholder={placeholder} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-sm" variant="primary" aria-label="Send" className="rounded-full">
          <ArrowUp />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
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
    <Attachments {...args}>
      <AttachmentsTray />
      <Composer placeholder="What should I do with this?">
        <AttachmentsTrigger />
      </Composer>
      <AttachmentsNote />
    </Attachments>
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
    <Attachments {...args}>
      <AttachmentsTray />
      <AttachmentsTrigger>Attach file</AttachmentsTrigger>
    </Attachments>
  ),
};

/** Creative canvas: the drop zone lit while a file is dragged in. */
export const DropZoneActive: Story = {
  render: (args) => (
    <Attachments {...args}>
      <AttachmentsDropZone active description="PDF, image, CSV, doc · up to 20 MB each" />
    </Attachments>
  ),
};

/** The idle drop zone: drag files in, or choose them with the keyboard. */
export const DropZone: Story = {
  render: (args) => (
    <Attachments {...args}>
      <AttachmentsDropZone />
    </Attachments>
  ),
};

/** Working demo: pick or drop files; uploads and reading are simulated, limits are real (20 MB, 5 files). */
export const Playground: Story = {
  render: (args) => <PlaygroundDemo {...args} />,
};

function PlaygroundDemo(args: AttachmentsProps) {
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
    <Attachments
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
      <AttachmentsDropZone>
        <div className="flex flex-col gap-2 rounded-2xl border border-border p-3">
          <AttachmentsTray />
          <Composer placeholder="Ask about the proposal…">
            <AttachmentsTrigger />
          </Composer>
        </div>
      </AttachmentsDropZone>
      <AttachmentsNote />
    </Attachments>
  );
}
