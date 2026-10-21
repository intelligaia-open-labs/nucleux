import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  Attachments,
  AttachmentsTray,
  AttachmentsTrigger,
  AttachmentsDropZone,
  AttachmentsNote,
} from "@nucleux/attachments";

describe("Attachments", () => {
  it("render case passes axe", async () => {
    const { container } = render(
      <Attachments
        onRemove={() => {}}
        onRetry={() => {}}
        items={[
          { id: "1", name: "Q2-renewals.csv", size: 49152, type: "text/csv", status: "ready" },
          { id: "2", name: "security-review.docx", size: 1258291, status: "processing" },
          { id: "3", name: "deck.pdf", size: 4200000, type: "application/pdf", status: "uploading", progress: 40 },
          { id: "4", name: "export.xlsx", status: "error", error: "Upload interrupted" },
        ]}
      >
        <AttachmentsTray />
        <AttachmentsTrigger />
        <AttachmentsNote />
      </Attachments>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("refuses files over the limit before upload and names the limit", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onFilesAdded = vi.fn();
    const onFilesRejected = vi.fn();
    const { container } = render(
      <Attachments maxSize={1024 * 1024} accept=".csv,.pdf" onFilesAdded={onFilesAdded} onFilesRejected={onFilesRejected}>
        <AttachmentsTrigger />
      </Attachments>,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const small = new File(["a,b"], "Q2-renewals.csv", { type: "text/csv" });
    const big = new File([new Uint8Array(2 * 1024 * 1024)], "board-deck.pdf", { type: "application/pdf" });
    const png = new File(["x"], "logo.png", { type: "image/png" });
    await user.upload(input, [small, big, png]);
    expect(onFilesAdded).toHaveBeenCalledWith([small]);
    expect(onFilesRejected.mock.calls[0][0].map((r: { reason: string }) => r.reason)).toEqual(["size", "type"]);
    expect(screen.getByRole("alert")).toHaveTextContent("board-deck.pdf is over the 1 MB limit.");
  });

  it("names remove and retry for each file and announces reading state", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onRetry = vi.fn();
    render(
      <Attachments
        onRemove={onRemove}
        onRetry={onRetry}
        items={[
          { id: "a", name: "contract.pdf", status: "processing" },
          { id: "b", name: "notes.txt", status: "error", error: "Upload interrupted" },
        ]}
      >
        <AttachmentsTray />
      </Attachments>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("2 files attached, 1 still being read, 1 couldn't be attached");
    expect(screen.getByRole("progressbar", { name: "Reading contract.pdf" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry notes.txt" }));
    expect(onRetry).toHaveBeenCalledWith("b");
    await user.click(screen.getByRole("button", { name: "Remove contract.pdf" }));
    expect(onRemove).toHaveBeenCalledWith("a");
    expect(within(screen.getByRole("list", { name: "Attached files" })).getAllByRole("listitem")).toHaveLength(2);
  });

  it("drop zone passes axe and lights up when active", async () => {
    const { container } = render(
      <Attachments accept=".pdf,image/*,.csv" maxSize={20 * 1024 * 1024}>
        <AttachmentsDropZone active />
      </Attachments>,
    );
    expect(screen.getByText("Drop to attach")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
