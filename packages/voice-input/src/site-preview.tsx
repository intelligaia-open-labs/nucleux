import { useState } from "react";
import { VoiceInput, type VoiceInputState } from "./index";

const HEARD = "Find me the renewal numbers for Q2 and";
const STILL_HEARING = "draft a summary for the leadership review";

/** VoiceInput as nucleux.in's live preview shows it: dictating, the last words still being heard. */
export function SitePreview() {
  const [state, setState] = useState<VoiceInputState>("recording");

  return (
    <VoiceInput
      variant="transcript-stream"
      state={state}
      duration="00:08"
      transcript={HEARD}
      interimTranscript={state === "recording" ? STILL_HEARING : undefined}
      listeningLabel="Aria is listening"
      onConfirm={() => setState("transcribing")}
      onStart={() => setState("recording")}
      className="w-full max-w-[30rem] shadow-sm"
    />
  );
}
