import { BookOpen, Github, HardDrive, Slack } from "lucide-react";
import { Md3Connector, Md3ConnectorList } from "./index";

const SOURCES = [
  { id: "drive", name: "Google Drive", description: "Files and documents", icon: <HardDrive /> },
  { id: "slack", name: "Slack", description: "Messages and channels", icon: <Slack /> },
  { id: "github", name: "GitHub", description: "Issues and pull requests", icon: <Github /> },
  { id: "notion", name: "Notion", description: "Docs and wikis", icon: <BookOpen /> },
];

/** Material 3 connectors as nucleux.in's live preview shows them: the available sources, each with Connect. */
export function SitePreview() {
  // Start the service's sign-in in your app.
  const connect = (_id: string) => {};
  return (
    <Md3ConnectorList label="Available sources" showLabel grouped className="w-full max-w-[29rem]">
      {SOURCES.map((s) => (
        <Md3Connector key={s.id} variant="row" name={s.name} description={s.description} icon={s.icon} onConnect={() => connect(s.id)} />
      ))}
    </Md3ConnectorList>
  );
}
