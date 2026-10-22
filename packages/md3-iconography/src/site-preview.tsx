import { Md3Iconography } from "./index";

/** The AI action as nucleux.in's live preview shows it: a tonal Rewrite button carrying the AI mark. */
export function SitePreview() {
  const rewrite = () => {};
  return <Md3Iconography label="Rewrite" agentName="AI" variant="secondary" onClick={rewrite} />;
}
