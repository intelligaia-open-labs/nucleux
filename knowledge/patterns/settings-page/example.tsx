import { useState, type FormEvent, type ReactNode } from "react";
import {
  Alert,
  Button,
  CardContainer,
  CardContent,
  CardDescription,
  CardDivider,
  CardHeader,
  CardTitle,
  Input,
  Label,
  NativeSelect,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nucleux/react";

/** Label + help text on the left, the control on the right; stacks on mobile. */
export function SettingRow({ id, title, description, children }: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-sm font-medium text-foreground">{title}</p>
        <p id={`${id}-desc`} className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

/**
 * Settings: tabs group related sections; each section is a card of rows;
 * form sections save explicitly with a confirmation, toggles apply instantly.
 */
export default function SettingsPageExample() {
  const [name, setName] = useState("Dana Kim");
  const [saved, setSaved] = useState(false);
  const [digest, setDigest] = useState(true);

  const save = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile and notifications.</p>
        </div>
      </header>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="pt-4">
          <CardContainer>
            <form onSubmit={save}>
              <CardHeader>
                <CardTitle aria-level={2}>Profile</CardTitle>
                <CardDescription>Shown to your teammates.</CardDescription>
              </CardHeader>
              <CardDivider />
              <CardContent className="space-y-4">
                {saved && (
                  <Alert variant="success" title="Profile saved">
                    Your changes are live.
                  </Alert>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="display-name" required>Display name</Label>
                  <Input
                    id="display-name"
                    value={name}
                    invalid={!name.trim()}
                    aria-describedby="display-name-hint"
                    onChange={(e) => {
                      setName(e.target.value);
                      setSaved(false);
                    }}
                  />
                  <p id="display-name-hint" className="text-xs text-muted-foreground">
                    {name.trim() ? "Use your full name." : "Display name is required."}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="timezone">Time zone</Label>
                  <NativeSelect id="timezone" defaultValue="utc">
                    <option value="utc">UTC</option>
                    <option value="est">Eastern Time</option>
                    <option value="ist">India Standard Time</option>
                  </NativeSelect>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={!name.trim()}>Save changes</Button>
                </div>
              </CardContent>
            </form>
          </CardContainer>
        </TabsContent>

        <TabsContent value="notifications" className="pt-4">
          <CardContainer>
            <CardContent className="divide-y divide-border py-0">
              <SettingRow id="digest" title="Weekly digest" description="A summary of project progress every Monday.">
                <Switch
                  checked={digest}
                  onCheckedChange={setDigest}
                  aria-labelledby="digest-label"
                  aria-describedby="digest-desc"
                />
              </SettingRow>
              <SettingRow id="mentions" title="Mentions" description="Email me when someone mentions me.">
                <Switch defaultChecked aria-labelledby="mentions-label" aria-describedby="mentions-desc" />
              </SettingRow>
            </CardContent>
          </CardContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}
