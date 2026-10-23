import { useState } from "react";
import { Input } from "@nucleux/input";
import { VisualInput, type VisualInputFile } from "./index";

const SCREENSHOT: VisualInputFile = {
  id: "dashboard",
  file: new File([new Uint8Array(340 * 1024)], "screenshot-dashboard.png", { type: "image/png" }),
  source: "paste",
};

/** VisualInput as nucleux.in's live preview shows it: a pasted screenshot ready to go with the question. */
export function SitePreview() {
  const [files, setFiles] = useState<VisualInputFile[]>([SCREENSHOT]);
  const [question, setQuestion] = useState("");

  return (
    <div className="w-full max-w-[30rem] rounded-lg border border-border bg-background p-4 shadow-sm">
      <VisualInput
        variant="drag-drop"
        accept="image/png,image/jpeg,.pdf"
        hint="PNG, JPG, PDF · up to 20 MB"
        seeText={null}
        files={files}
        onFilesChange={setFiles}
        className="gap-2.5"
      >
        <Input
          aria-label="Ask about the image"
          placeholder="What's causing the dip in this chart?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="h-auto rounded-[10px] border-border px-3.5 py-2.5 text-[12.5px] leading-[1.55] shadow-none placeholder:text-faint"
        />
      </VisualInput>
    </div>
  );
}
