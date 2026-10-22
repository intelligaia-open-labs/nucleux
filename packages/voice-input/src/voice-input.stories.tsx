import type { Meta, StoryObj } from "@storybook/react";
import { VoiceInput } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const meta = {
  title: "Agent/VoiceInput",
  component: VoiceInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story, { id }) =>
      id.endsWith("--site-preview") ? (
        <div className="flex w-[44rem] max-w-full justify-center">
          <Story />
        </div>
      ) : (
        <div className="w-[28rem]"><Story /></div>
      ),
  ],
  args: { onStart: () => {}, onCancel: () => {}, onConfirm: () => {} },
} satisfies Meta<typeof VoiceInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

export const Idle: Story = { args: { state: "idle" } };
/** `waveform` variant (default): the live waveform confirms the mic is hot. */
export const Recording: Story = {
  args: { state: "recording", duration: "0:08", onPause: () => {}, listeningLabel: "Listening" },
};
export const Transcribing: Story = {
  args: { state: "transcribing", transcript: "Draft a follow-up email to the renewal contacts…" },
};

/** `mic-button` variant: tap-to-talk in the composer — a pulsing stop button makes the hot mic obvious. */
export const MicButton: Story = {
  args: { variant: "mic-button", state: "recording", duration: "0:08", listeningLabel: "Aria is listening" },
};

/** `transcript-stream` variant: words appear as they are heard; the unfinished part is muted. */
export const TranscriptStream: Story = {
  args: {
    variant: "transcript-stream",
    state: "recording",
    duration: "0:14",
    listeningLabel: "Aria is listening",
    transcript: "Find me the renewal numbers for Q2 and",
    interimTranscript: "draft a summary for the leadership review",
    onPause: () => {},
  },
};

/** Pause keeps what was said with the mic off; Resume carries on. */
export const Paused: Story = {
  args: { state: "paused", duration: "0:21", onResume: () => {} },
};

/** When speech can't be trusted, say so and offer Retry — the keyboard is never taken away. */
export const Failed: Story = {
  args: { state: "error", errorText: "Couldn’t make out all of that.", onRetry: () => {} },
};
