import { useState } from "react";
import { Connector, ConnectorList, ConnectorLivePill, ConnectorScopePicker, type ConnectorScope } from "./index";

const CHANNELS: ConnectorScope[] = [
  { id: "sales-pipeline", label: "#sales-pipeline" },
  { id: "renewals", label: "#renewals" },
  { id: "general", label: "#general" },
];

/* Brand marks, in their own colours. */
const GoogleDrive = () => (
  <svg width="18" height="16" viewBox="0 0 87.3 78" aria-hidden="true">
    <path fill="#0066da" d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" />
    <path fill="#00ac47" d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.5A9.06 9.06 0 000 53h27.5z" />
    <path fill="#ea4335" d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z" />
    <path fill="#00832d" d="M43.65 25l13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2H34.4c-1.6 0-3.15.45-4.5 1.2z" />
    <path fill="#2684fc" d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" />
    <path fill="#ffba00" d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 28H87.3c0-1.55-.4-3.1-1.2-4.5z" />
  </svg>
);
const SlackMark = () => (
  <svg width="18" height="18" viewBox="0 0 127 127" aria-hidden="true">
    <path fill="#E01E5A" d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.5 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" />
    <path fill="#36C5F0" d="M46.9 27.2c-7.3 0-13.2-5.9-13.2-13.2C33.7 6.7 39.6.8 46.9.8c7.3 0 13.2 5.9 13.2 13.2v13.2H46.9zm0 6.5c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9c0-7.3 5.9-13.2 13.2-13.2h33z" />
    <path fill="#2EB67D" d="M99.7 46.9c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.7V46.9zm-6.5 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.9C66.8 6.6 72.7.7 80 .7c7.3 0 13.2 5.9 13.2 13.2v33z" />
    <path fill="#ECB22E" d="M80 99.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.7H80zm0-6.5c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80z" />
  </svg>
);
const NotionMark = () => (
  <svg width="18" height="18" viewBox="0 0 100 100" aria-hidden="true">
    <rect width="100" height="100" rx="12" fill="#fff" />
    <path fill="#fff" stroke="#e8ecf0" d="M11 9.5C11 7.6 12.4 6 14.3 5.8L55.5 2.1C57 2 58.5 2.4 59.7 3.3L88.5 24.3C89.5 25 90 26.1 90 27.3V90.5C90 92.4 88.6 94 86.7 94.2L43 97.9C41.2 98 39.4 97.4 38.1 96.2L12.5 73.1C11.6 72.3 11 71.1 11 69.9V9.5Z" />
    <path fill="#f7f6f3" d="M55 6.5L87 27V91L55 91V6.5Z" />
    <path fill="#37352f" d="M14 10L55 6.5C57 6.4 59 7.5 59 9V11C59 12.5 57 14 55 13.9L14 17C12 17.1 11 15.5 11 14V12C11 10.7 12.3 10 14 10Z" />
    <text x="24" y="70" fontFamily="Georgia,serif" fontSize="52" fontWeight="700" fill="#37352f">N</text>
  </svg>
);

/** Connectors as nucleux.in's live preview shows them: services, what Aria can read, and a live read. */
export function SitePreview() {
  const [granted, setGranted] = useState(["sales-pipeline", "renewals"]);
  const connect = () => {};
  return (
    <div className="w-full max-w-[30rem] overflow-hidden rounded-[14px] border border-border bg-background p-4 antialiased [font-feature-settings:'ss01','cv11']">
      <ConnectorList label="Connected services" showLabel className="border-b border-border px-[18px] py-3.5">
        <Connector variant="row" name="Google Drive" icon={<GoogleDrive />} status="connected" detail="412 docs" />
        <Connector variant="row" name="Slack" icon={<SlackMark />} onConnect={connect} />
        <Connector variant="row" name="Notion" icon={<NotionMark />} onConnect={connect} />
      </ConnectorList>
      <ConnectorScopePicker
        variant="plain"
        title="Aria can read from"
        scopes={CHANNELS}
        value={granted}
        onValueChange={setGranted}
        className="border-b border-border px-[18px] py-3"
      />
      <div className="px-[18px] py-2.5">
        <ConnectorLivePill count={12} source="Drive" />
      </div>
    </div>
  );
}
