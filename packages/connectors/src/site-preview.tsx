import { useState } from "react";
import { BookOpen, HardDrive, Slack } from "lucide-react";
import { Connector, ConnectorList, ConnectorLivePill, ConnectorScopePicker, type ConnectorScope } from "./index";

const CHANNELS: ConnectorScope[] = [
  { id: "sales-pipeline", label: "#sales-pipeline" },
  { id: "renewals", label: "#renewals" },
  { id: "general", label: "#general" },
];

/** Connectors as nucleux.in's live preview shows them: services, what Aria can read, and a live read. */
export function SitePreview() {
  const [granted, setGranted] = useState(["sales-pipeline", "renewals"]);
  const connect = () => {};
  return (
    <div className="w-full max-w-[30rem] overflow-hidden rounded-2xl border border-border bg-background">
      <ConnectorList label="Connected services" showLabel className="border-b border-border px-5 py-4">
        <Connector variant="row" name="Google Drive" icon={<HardDrive />} status="connected" detail="412 docs" />
        <Connector variant="row" name="Slack" icon={<Slack />} onConnect={connect} />
        <Connector variant="row" name="Notion" icon={<BookOpen />} onConnect={connect} />
      </ConnectorList>
      <ConnectorScopePicker
        variant="plain"
        title="Aria can read from"
        scopes={CHANNELS}
        value={granted}
        onValueChange={setGranted}
        className="border-b border-border px-5 py-3"
      />
      <div className="px-5 py-2.5">
        <ConnectorLivePill count={12} source="Drive" />
      </div>
    </div>
  );
}
