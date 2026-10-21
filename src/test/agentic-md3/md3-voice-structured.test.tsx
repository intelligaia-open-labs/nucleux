import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Md3VoiceInput as VoiceInput } from "@nucleux/md3-voice-input";
import {
  Md3StructuredInput as StructuredInput,
  Md3StructuredInputSlots as StructuredInputSlots,
  Md3StructuredInputTags as StructuredInputTags,
  Md3StructuredInputWizard as StructuredInputWizard,
} from "@nucleux/md3-structured-input";

describe("VoiceInput review", () => {
  it("announces state, pauses and resumes, and Stop only confirms", async () => {
    const user = userEvent.setup();
    const onPause = vi.fn();
    const onConfirm = vi.fn();
    const { rerender } = render(
      <VoiceInput variant="mic-button" state="recording" duration="0:08" listeningLabel="Aria is listening" onPause={onPause} onConfirm={onConfirm} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Aria is listening");
    await user.click(screen.getByRole("button", { name: "Pause dictation" }));
    expect(onPause).toHaveBeenCalled();
    const onResume = vi.fn();
    rerender(<VoiceInput variant="mic-button" state="paused" onResume={onResume} onConfirm={onConfirm} />);
    expect(screen.getByRole("status")).toHaveTextContent("Paused");
    await user.click(screen.getByRole("button", { name: "Resume dictation" }));
    expect(onResume).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Stop and use recording" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("streams final and interim words, and offers Retry on error", async () => {
    const user = userEvent.setup();
    const { rerender, container } = render(
      <VoiceInput
        variant="transcript-stream"
        state="recording"
        transcript="Find me the renewal numbers for Q2 and"
        interimTranscript="draft a summary"
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("draft a summary")).toHaveClass("italic");
    expect(await axe(container)).toHaveNoViolations();
    const onRetry = vi.fn();
    rerender(<VoiceInput variant="transcript-stream" state="error" onRetry={onRetry} />);
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe("StructuredInput review", () => {
  it("radio options follow the arrow-key pattern", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <StructuredInput
        question="Which audience is this for?"
        options={[
          { value: "execs", label: "Executives" },
          { value: "eng", label: "Engineers" },
        ]}
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "Which audience is this for?" })).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole("radio", { name: "Executives" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Engineers" })).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith(["eng"]);
  });

  it("named slots submit with any one value and mark edited suggestions", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <StructuredInputSlots
        slots={[
          { name: "length", label: "Length", placeholder: "3 bullets", suggested: "from your last brief" },
          { name: "topic", label: "Topic" },
        ]}
        defaultValues={{ length: "3 bullets" }}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.getByText("Suggested")).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "Length" }), " max");
    expect(screen.getByText("Edited by you")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Generate" }));
    expect(onSubmit).toHaveBeenCalledWith({ length: "3 bullets max" }, "");
  });

  it("tag input turns trigger words into removable chips and sends plain text", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<StructuredInputTags onSubmit={onSubmit} />);
    const field = screen.getByRole("textbox");
    await user.type(field, "Update @sam on p:Apollo ");
    expect(screen.getByRole("button", { name: "Remove person @sam" })).toBeInTheDocument();
    await user.type(field, "before Friday{Enter}");
    expect(onSubmit).toHaveBeenCalledWith(expect.any(Array), "Update @sam on p:Apollo before Friday");
  });

  it("wizard moves focus to the new step heading", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <StructuredInputWizard steps={["Intent", "Audience", "Tone"]} onSubmit={onSubmit}>
        <p>Fields</p>
      </StructuredInputWizard>,
    );
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Step 2 of 3 · Audience")).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Generate now" }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
