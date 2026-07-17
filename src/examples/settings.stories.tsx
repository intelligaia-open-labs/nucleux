import { type ReactNode, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  CardContainer,
  CardContent,
  CardDivider,
  CardHeader,
  CardTitle,
  ModularConsent,
  Radio,
  RadioGroup,
  Select,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../index";

/**
 * A settings screen composed from Nucleux primitives — breadcrumb + page
 * header, tabs, toggles, a select, a radio group, an alert, and the modular
 * consent block.
 */
const meta = {
  title: "Examples/Settings",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

export const Default: Story = {
  render: () => {
    const [speed, setSpeed] = useState("balanced");
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <Breadcrumb className="mb-4">
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </Breadcrumb>

          <header className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
            <p className="mt-1 text-muted-foreground">Manage assistant behavior and permissions.</p>
          </header>

          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="pt-2">
              <CardContainer>
                <CardHeader>
                  <CardTitle>Assistant</CardTitle>
                </CardHeader>
                <CardDivider />
                <CardContent className="divide-y divide-border py-0">
                  <SettingRow title="Auto-summarize" description="Summarize meetings as they end.">
                    <Switch defaultChecked aria-label="Auto-summarize" />
                  </SettingRow>
                  <SettingRow title="Summary speed" description="Trade latency for depth.">
                    <div className="w-40">
                      <Select
                        aria-label="Summary speed"
                        value={speed}
                        onChange={(e) => setSpeed(e.target.value)}
                      >
                        <option value="instant">Instant</option>
                        <option value="balanced">Balanced</option>
                        <option value="thorough">Thorough</option>
                      </Select>
                    </div>
                  </SettingRow>
                  <div className="py-3">
                    <p className="mb-2 text-sm font-medium text-foreground">Default tone</p>
                    <RadioGroup value={speed === "instant" ? "concise" : "neutral"} label="Default tone">
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <Radio value="concise" /> Concise
                      </label>
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <Radio value="neutral" /> Neutral
                      </label>
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <Radio value="detailed" /> Detailed
                      </label>
                    </RadioGroup>
                  </div>
                </CardContent>
              </CardContainer>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4 pt-2">
              <Alert variant="info" title="AI-generated content">
                Summaries are generated automatically and may contain mistakes.
              </Alert>
              <ModularConsent
                className="max-w-none"
                title="Workspace access"
                description="Choose what the assistant can read or change."
                secondaryLabel="Always Allow"
                permissions={[
                  { id: "read", label: "Read selected files", description: "Only files attached to this workspace.", defaultChecked: true },
                  { id: "draft", label: "Draft edits", description: "Create suggestions without applying them.", defaultChecked: true },
                  { id: "actions", label: "Run external actions", description: "Ask before connecting tools." },
                ]}
              />
            </TabsContent>

            <TabsContent value="notifications" className="pt-2">
              <CardContainer>
                <CardContent className="divide-y divide-border py-0">
                  <SettingRow title="Email" description="Send a digest when summaries are ready.">
                    <Switch defaultChecked aria-label="Email notifications" />
                  </SettingRow>
                  <SettingRow title="Desktop" description="Show a toast when the agent finishes.">
                    <Switch aria-label="Desktop notifications" />
                  </SettingRow>
                </CardContent>
              </CardContainer>
            </TabsContent>
          </Tabs>

          <Separator className="my-8" />
          <p className="text-xs text-muted-foreground">Changes are saved automatically.</p>
        </div>
      </div>
    );
  },
};
