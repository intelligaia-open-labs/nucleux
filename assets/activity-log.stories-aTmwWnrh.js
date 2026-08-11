import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{r as g}from"./index-Bc2G9s8g.js";import{c as x}from"./utils-DOIGBiOF.js";import{c as m}from"./createLucideIcon-Br12VlPe.js";import{F as y}from"./file-text-ZyCytQVl.js";import{C as h}from"./circle-check-CzMphq9o.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=m("Activity",[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=m("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=m("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]),a=g.forwardRef(({icon:t,time:i,className:s,children:c,...n},f)=>e.jsxs("li",{ref:f,className:x("relative flex gap-3 pb-4 last:pb-0",s),...n,children:[e.jsx("span",{className:"relative z-10 mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground [&_svg]:size-3.5",children:t??e.jsx(u,{"aria-hidden":"true"})}),e.jsxs("span",{className:"flex min-w-0 flex-1 flex-col gap-0.5",children:[e.jsx("span",{className:"text-sm text-foreground",children:c}),i&&e.jsx("span",{className:"text-xs text-muted-foreground",children:i})]})]}));a.displayName="ActivityLogItem";const o=g.forwardRef(({heading:t,className:i,children:s,...c},n)=>e.jsxs("div",{className:"flex flex-col gap-3",children:[t&&e.jsx("p",{className:"text-xs font-medium uppercase tracking-wide text-muted-foreground",children:t}),e.jsx("ol",{ref:n,className:x("relative before:absolute before:left-3 before:top-1 before:h-[calc(100%-1rem)] before:w-px before:-translate-x-1/2 before:bg-border",i),...c,children:s})]}));o.displayName="ActivityLog";a.__docgenInfo={description:"A single entry in an {@link ActivityLog}: an action the agent took, with a timestamp.",methods:[],displayName:"ActivityLogItem",props:{icon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Icon for the action type. Defaults to a generic activity glyph."},time:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:'Relative or absolute timestamp, e.g. `"2m ago"`.'}}};o.__docgenInfo={description:`A timestamped audit trail of the actions an agent performed on the user's
behalf — a connected timeline of {@link ActivityLogItem}s.
Source: Figma "Explainability / Footprints".`,methods:[],displayName:"ActivityLog",props:{heading:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Heading above the trail."}}};const I={title:"Agent/ActivityLog",component:o,tags:["autodocs"],parameters:{layout:"centered"},decorators:[t=>e.jsx("div",{className:"w-96",children:e.jsx(t,{})})]},r={render:()=>e.jsxs(o,{heading:"Agent footprints",children:[e.jsxs(a,{icon:e.jsx(A,{}),time:"2m ago",children:["Sent email to ",e.jsx("span",{className:"font-medium",children:"Sam Rivera"})]}),e.jsx(a,{icon:e.jsx(v,{}),time:"3m ago",children:"Read 3 CRM records"}),e.jsx(a,{icon:e.jsx(y,{}),time:"4m ago",children:"Created Linear issue ENG-412"}),e.jsx(a,{icon:e.jsx(h,{}),time:"4m ago",children:"Marked task complete"})]})};var d,l,p;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <ActivityLog heading="Agent footprints">\r
      <ActivityLogItem icon={<Mail />} time="2m ago">\r
        Sent email to <span className="font-medium">Sam Rivera</span>\r
      </ActivityLogItem>\r
      <ActivityLogItem icon={<Database />} time="3m ago">\r
        Read 3 CRM records\r
      </ActivityLogItem>\r
      <ActivityLogItem icon={<FileText />} time="4m ago">\r
        Created Linear issue ENG-412\r
      </ActivityLogItem>\r
      <ActivityLogItem icon={<CheckCircle2 />} time="4m ago">\r
        Marked task complete\r
      </ActivityLogItem>\r
    </ActivityLog>
}`,...(p=(l=r.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};const w=["Default"];export{r as Default,w as __namedExportsOrder,I as default};
