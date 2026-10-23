import { useState } from "react";
import { McpConnectionActionPreview, McpConnectionTools, type McpConnectionActionStatus, type McpConnectionToolInfo } from "./index";

const CALL = { title: "Renewal flow broken", team: "Apollo", priority: "high" };

const TOOLS: McpConnectionToolInfo[] = [
  { id: "read_issue", description: "fetch issue details", risk: "read" },
  { id: "create_issue", description: "file a new bug or task", risk: "write" },
  { id: "comment", description: "post a comment to an issue", risk: "write" },
];

/** MCP as nucleux.in's live preview shows it: a proposed Linear call to approve, and what the server offers. */
export function SitePreview() {
  const [status, setStatus] = useState<McpConnectionActionStatus>("pending");
  return (
    <div className="flex w-full max-w-[30rem] flex-col gap-2.5 antialiased [font-feature-settings:'ss01','cv11']">
      <McpConnectionActionPreview
        tool="linear.create_issue"
        args={CALL}
        status={status}
        onApprove={() => setStatus("done")}
        onEdit={() => {}}
        onDeny={() => {}}
        denyLabel="Don't allow"
        result="Filed APO-412 in Apollo."
      />
      <McpConnectionTools variant="compact" title="Linear · 4 actions available" tools={TOOLS} trustNote={null} />
    </div>
  );
}
