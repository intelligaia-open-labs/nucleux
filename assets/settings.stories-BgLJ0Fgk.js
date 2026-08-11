import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{r as g}from"./index-Bc2G9s8g.js";import{B as b,a as c,b as f,c as v,d as j}from"./index-BXEo9cO5.js";import{T as C,a as N,b as i,c as o}from"./index-DOKeNVmZ.js";import{C as m,a as S,b as y,e as w,f as u}from"./index-Bw-fzWjm.js";import{S as l}from"./index-B7ufj7UL.js";import{S as T}from"./index-C3VXFmeu.js";import{R as k,a as d}from"./index-sYBcQOwx.js";import{A as R}from"./index-BkQTm0hv.js";import{M as A}from"./index-CRQWPjVc.js";import{S as B}from"./index-7WufTKGq.js";import"./utils-DOIGBiOF.js";import"./chevron-right-w7uIHj32.js";import"./createLucideIcon-Br12VlPe.js";import"./chevron-down-Bf1hKLDg.js";import"./circle-alert-CrM0R4cc.js";import"./triangle-alert-BC0ROqOn.js";import"./circle-check-CzMphq9o.js";import"./info-DnZ3yMLo.js";import"./index-B2s0_U20.js";import"./index-DUYuBIOk.js";import"./check-DYrJOilm.js";const $={title:"Examples/Settings",parameters:{layout:"fullscreen",docs:{description:{component:`A settings screen composed from Nucleux primitives — breadcrumb + page\r
header, tabs, toggles, a select, a radio group, an alert, and the modular\r
consent block.`}}}};function r({title:a,description:s,children:n}){return e.jsxs("div",{className:"flex items-center justify-between gap-4 py-3",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-foreground",children:a}),e.jsx("p",{className:"text-sm text-muted-foreground",children:s})]}),n]})}const t={render:()=>{const[a,s]=g.useState("balanced");return e.jsx("div",{className:"min-h-screen bg-background",children:e.jsxs("div",{className:"mx-auto max-w-3xl px-6 py-10",children:[e.jsxs(b,{className:"mb-4",children:[e.jsx(c,{children:e.jsx(f,{href:"#",children:"Workspace"})}),e.jsx(v,{}),e.jsx(c,{children:e.jsx(j,{children:"Settings"})})]}),e.jsxs("header",{className:"mb-6",children:[e.jsx("h1",{className:"text-3xl font-semibold tracking-tight text-foreground",children:"Settings"}),e.jsx("p",{className:"mt-1 text-muted-foreground",children:"Manage assistant behavior and permissions."})]}),e.jsxs(C,{defaultValue:"general",children:[e.jsxs(N,{children:[e.jsx(i,{value:"general",children:"General"}),e.jsx(i,{value:"permissions",children:"Permissions"}),e.jsx(i,{value:"notifications",children:"Notifications"})]}),e.jsx(o,{value:"general",className:"pt-2",children:e.jsxs(m,{children:[e.jsx(S,{children:e.jsx(y,{children:"Assistant"})}),e.jsx(w,{}),e.jsxs(u,{className:"divide-y divide-border py-0",children:[e.jsx(r,{title:"Auto-summarize",description:"Summarize meetings as they end.",children:e.jsx(l,{defaultChecked:!0,"aria-label":"Auto-summarize"})}),e.jsx(r,{title:"Summary speed",description:"Trade latency for depth.",children:e.jsx("div",{className:"w-40",children:e.jsxs(T,{"aria-label":"Summary speed",value:a,onChange:n=>s(n.target.value),children:[e.jsx("option",{value:"instant",children:"Instant"}),e.jsx("option",{value:"balanced",children:"Balanced"}),e.jsx("option",{value:"thorough",children:"Thorough"})]})})}),e.jsxs("div",{className:"py-3",children:[e.jsx("p",{className:"mb-2 text-sm font-medium text-foreground",children:"Default tone"}),e.jsxs(k,{value:a==="instant"?"concise":"neutral",label:"Default tone",children:[e.jsxs("label",{className:"flex items-center gap-2 text-sm text-foreground",children:[e.jsx(d,{value:"concise"})," Concise"]}),e.jsxs("label",{className:"flex items-center gap-2 text-sm text-foreground",children:[e.jsx(d,{value:"neutral"})," Neutral"]}),e.jsxs("label",{className:"flex items-center gap-2 text-sm text-foreground",children:[e.jsx(d,{value:"detailed"})," Detailed"]})]})]})]})]})}),e.jsxs(o,{value:"permissions",className:"space-y-4 pt-2",children:[e.jsx(R,{variant:"info",title:"AI-generated content",children:"Summaries are generated automatically and may contain mistakes."}),e.jsx(A,{className:"max-w-none",title:"Workspace access",description:"Choose what the assistant can read or change.",secondaryLabel:"Always Allow",permissions:[{id:"read",label:"Read selected files",description:"Only files attached to this workspace.",defaultChecked:!0},{id:"draft",label:"Draft edits",description:"Create suggestions without applying them.",defaultChecked:!0},{id:"actions",label:"Run external actions",description:"Ask before connecting tools."}]})]}),e.jsx(o,{value:"notifications",className:"pt-2",children:e.jsx(m,{children:e.jsxs(u,{className:"divide-y divide-border py-0",children:[e.jsx(r,{title:"Email",description:"Send a digest when summaries are ready.",children:e.jsx(l,{defaultChecked:!0,"aria-label":"Email notifications"})}),e.jsx(r,{title:"Desktop",description:"Show a toast when the agent finishes.",children:e.jsx(l,{"aria-label":"Desktop notifications"})})]})})})]}),e.jsx(B,{className:"my-8"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Changes are saved automatically."})]})})}};var p,h,x;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => {
    const [speed, setSpeed] = useState("balanced");
    return <div className="min-h-screen bg-background">\r
        <div className="mx-auto max-w-3xl px-6 py-10">\r
          <Breadcrumb className="mb-4">\r
            <BreadcrumbItem>\r
              <BreadcrumbLink href="#">Workspace</BreadcrumbLink>\r
            </BreadcrumbItem>\r
            <BreadcrumbSeparator />\r
            <BreadcrumbItem>\r
              <BreadcrumbPage>Settings</BreadcrumbPage>\r
            </BreadcrumbItem>\r
          </Breadcrumb>\r
\r
          <header className="mb-6">\r
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>\r
            <p className="mt-1 text-muted-foreground">Manage assistant behavior and permissions.</p>\r
          </header>\r
\r
          <Tabs defaultValue="general">\r
            <TabsList>\r
              <TabsTrigger value="general">General</TabsTrigger>\r
              <TabsTrigger value="permissions">Permissions</TabsTrigger>\r
              <TabsTrigger value="notifications">Notifications</TabsTrigger>\r
            </TabsList>\r
\r
            <TabsContent value="general" className="pt-2">\r
              <CardContainer>\r
                <CardHeader>\r
                  <CardTitle>Assistant</CardTitle>\r
                </CardHeader>\r
                <CardDivider />\r
                <CardContent className="divide-y divide-border py-0">\r
                  <SettingRow title="Auto-summarize" description="Summarize meetings as they end.">\r
                    <Switch defaultChecked aria-label="Auto-summarize" />\r
                  </SettingRow>\r
                  <SettingRow title="Summary speed" description="Trade latency for depth.">\r
                    <div className="w-40">\r
                      <Select aria-label="Summary speed" value={speed} onChange={e => setSpeed(e.target.value)}>\r
                        <option value="instant">Instant</option>\r
                        <option value="balanced">Balanced</option>\r
                        <option value="thorough">Thorough</option>\r
                      </Select>\r
                    </div>\r
                  </SettingRow>\r
                  <div className="py-3">\r
                    <p className="mb-2 text-sm font-medium text-foreground">Default tone</p>\r
                    <RadioGroup value={speed === "instant" ? "concise" : "neutral"} label="Default tone">\r
                      <label className="flex items-center gap-2 text-sm text-foreground">\r
                        <Radio value="concise" /> Concise\r
                      </label>\r
                      <label className="flex items-center gap-2 text-sm text-foreground">\r
                        <Radio value="neutral" /> Neutral\r
                      </label>\r
                      <label className="flex items-center gap-2 text-sm text-foreground">\r
                        <Radio value="detailed" /> Detailed\r
                      </label>\r
                    </RadioGroup>\r
                  </div>\r
                </CardContent>\r
              </CardContainer>\r
            </TabsContent>\r
\r
            <TabsContent value="permissions" className="space-y-4 pt-2">\r
              <Alert variant="info" title="AI-generated content">\r
                Summaries are generated automatically and may contain mistakes.\r
              </Alert>\r
              <ModularConsent className="max-w-none" title="Workspace access" description="Choose what the assistant can read or change." secondaryLabel="Always Allow" permissions={[{
              id: "read",
              label: "Read selected files",
              description: "Only files attached to this workspace.",
              defaultChecked: true
            }, {
              id: "draft",
              label: "Draft edits",
              description: "Create suggestions without applying them.",
              defaultChecked: true
            }, {
              id: "actions",
              label: "Run external actions",
              description: "Ask before connecting tools."
            }]} />\r
            </TabsContent>\r
\r
            <TabsContent value="notifications" className="pt-2">\r
              <CardContainer>\r
                <CardContent className="divide-y divide-border py-0">\r
                  <SettingRow title="Email" description="Send a digest when summaries are ready.">\r
                    <Switch defaultChecked aria-label="Email notifications" />\r
                  </SettingRow>\r
                  <SettingRow title="Desktop" description="Show a toast when the agent finishes.">\r
                    <Switch aria-label="Desktop notifications" />\r
                  </SettingRow>\r
                </CardContent>\r
              </CardContainer>\r
            </TabsContent>\r
          </Tabs>\r
\r
          <Separator className="my-8" />\r
          <p className="text-xs text-muted-foreground">Changes are saved automatically.</p>\r
        </div>\r
      </div>;
  }
}`,...(x=(h=t.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};const ee=["Default"];export{t as Default,ee as __namedExportsOrder,$ as default};
