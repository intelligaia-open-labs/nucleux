import { Ban, Clock, Eye, HardDrive } from "lucide-react";
import { Md3Consent, type ConsentScopeItem } from "./index";

const TITLE = "Allow Aria to use Google Drive?";
const WHY = "The product brief is in Google Drive. Aria needs to read it to compare it with this meeting.";
const SCOPE: ConsentScopeItem[] = [
  { icon: <Eye />, label: "Read files and folders your account can open" },
  { icon: <Ban />, label: "Can’t edit, share or delete anything" },
  { icon: <Clock />, label: "For this conversation only" },
];
const OUTCOME = (
  <>
    <b>If you continue:</b> Google Drive asks you to confirm your account, then Aria reads only the files this request
    needs.
  </>
);
const DETAILS = (
  <dl className="m-0 flex flex-col gap-2">
    <div>
      <dt className="font-semibold">Account</dt>
      <dd className="m-0">j.rivera@northwind.example</dd>
    </div>
    <div>
      <dt className="font-semibold">Activity</dt>
      <dd className="m-0">Every file Aria opens is listed in the conversation.</dd>
    </div>
    <div>
      <dt className="font-semibold">Turn it off</dt>
      <dd className="m-0">Settings › Connected apps, at any time.</dd>
    </div>
  </dl>
);

/** Work paused at the one step Aria may not take without permission: what, why, the scope and what happens next. */
export function SitePreview() {
  return (
    <Md3Consent
      className="w-[35rem] max-w-full"
      icon={<HardDrive />}
      badge="Access request"
      title={TITLE}
      description={WHY}
      scope={SCOPE}
      scopeLabel="What Aria will be able to do"
      outcome={OUTCOME}
      details={DETAILS}
      denyLabel="Not now"
      allowLabel="Continue"
      onDeny={() => {}}
      onAllow={() => {}}
    />
  );
}
