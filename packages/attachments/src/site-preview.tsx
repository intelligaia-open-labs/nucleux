import { useState } from "react";
import { Input } from "@nucleux/input";
import { Attachments, AttachmentsDropZone, AttachmentsItem, AttachmentsTray, type AttachmentsFile } from "./index";

const MB = 1024 * 1024;

const FILES: AttachmentsFile[] = [
  { id: "csv", name: "Q2-renewals.csv", size: 340 * 1024, type: "text/csv", icon: "📄" },
  { id: "png", name: "screenshot-bug.png", size: 1.2 * MB, type: "image/png", icon: "📷" },
];

/** Attachments as nucleux.in's live preview shows it: two files in context, the drop zone, the image as a card, then the question. */
export function SitePreview() {
  const [files, setFiles] = useState(FILES);
  const [question, setQuestion] = useState("");
  const image = files.find((f) => f.id === "png");
  const thumb = (
    <span className="grid size-full place-items-center bg-gradient-to-br from-destructive/[.13] to-destructive/[.19]">📷</span>
  );
  const remove = (id: string) => setFiles((all) => all.filter((f) => f.id !== id));

  return (
    <div className="flex w-full max-w-[31rem] flex-col gap-2.5 rounded-lg border border-border bg-background p-4 leading-[1.55] shadow-sm">
      <Attachments
        items={files}
        showReadyStatus={false}
        accept=".pdf,.csv,.doc,.docx,image/*"
        maxSize={50 * MB}
        onFilesAdded={() => {}}
        onRemove={remove}
        className="gap-2.5"
      >
        <AttachmentsTray className="gap-1.5" />
        <AttachmentsDropZone icon="📎" description="PDF, image, CSV, doc · up to 50 MB" />
        {image && <AttachmentsItem file={{ ...image, icon: thumb }} variant="preview-card" />}
      </Attachments>
      <Input
        aria-label="Ask about your files"
        placeholder="What's causing the spike in this chart?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="h-auto rounded-xl border-border px-4 py-2.5 text-[12.5px] leading-[1.55] shadow-none placeholder:text-faint"
      />
    </div>
  );
}
