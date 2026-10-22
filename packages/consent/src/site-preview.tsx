import * as React from "react";
import { Consent } from "./index";

const TITLE = "Allow data to improve the assistant?";
const DESCRIPTION = "Inputs never leave your tenant. Toggle anytime in Settings.";

/** A just-in-time ask: one question, Allow and Not now of equal weight. */
export function SitePreview() {
  const [answer, setAnswer] = React.useState<"allowed" | "declined" | null>(null);

  return (
    <Consent
      title={TITLE}
      description={DESCRIPTION}
      allowLabel={answer === "allowed" ? "✓ Allowed" : "Allow"}
      onAllow={() => setAnswer("allowed")}
      onDeny={() => setAnswer("declined")}
      className={answer === "declined" ? "w-[26rem] opacity-40" : "w-[26rem]"}
    />
  );
}
