import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{r as h}from"./index-Bc2G9s8g.js";import{c as b}from"./utils-DOIGBiOF.js";import{c as d}from"./createLucideIcon-Br12VlPe.js";import{T as y}from"./triangle-alert-BC0ROqOn.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=d("Lightbulb",[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",key:"1gvzjb"}],["path",{d:"M9 18h6",key:"x1upvd"}],["path",{d:"M10 22h4",key:"ceow96"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=d("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]),i=h.forwardRef(({sections:t,heading:r,footnote:o,className:m,...p},u)=>e.jsxs("div",{ref:u,className:b("flex flex-col gap-5 rounded-xl border border-border bg-background p-6",m),...p,children:[r&&e.jsx("h3",{className:"text-center text-lg font-semibold text-foreground",children:r}),e.jsx("div",{className:"grid gap-4 sm:grid-cols-3",children:t.map((a,x)=>e.jsxs("section",{className:"flex flex-col gap-3",children:[e.jsxs("div",{className:"flex flex-col items-center gap-1.5 text-center",children:[a.icon&&e.jsx("span",{className:"inline-flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4",children:a.icon}),e.jsx("span",{className:"text-sm font-medium text-foreground",children:a.title})]}),e.jsx("ul",{className:"flex flex-col gap-2",children:a.items.map((f,g)=>e.jsx("li",{className:"rounded-lg bg-muted/50 px-3 py-2 text-center text-xs leading-relaxed text-muted-foreground",children:f},g))})]},x))}),o&&e.jsx("p",{className:"text-center text-xs text-muted-foreground",children:o})]}));i.displayName="CapabilityOverview";i.__docgenInfo={description:`A first-run card that sets expectations for an agent — what it can do, and
where it falls short — as Examples / Capabilities / Limits columns.
Source: Figma "Onboarding / Generic Assistant Overview".`,methods:[],displayName:"CapabilityOverview",props:{sections:{required:!0,tsType:{name:"Array",elements:[{name:"CapabilitySection"}],raw:"CapabilitySection[]"},description:"The columns to show — typically Examples / Capabilities / Limits."},heading:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Heading above the columns."},footnote:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Footnote, e.g. a knowledge-cutoff note."}}};const A={title:"Agent/CapabilityOverview",component:i,tags:["autodocs"],parameters:{layout:"centered"},decorators:[t=>e.jsx("div",{className:"w-[44rem]",children:e.jsx(t,{})})],argTypes:{sections:{control:!1}},args:{sections:[]}},s={render:t=>e.jsx(i,{...t,heading:"Meet your assistant",footnote:"Knowledge cutoff: January 2026. May not know recent events.",sections:[{title:"Examples",icon:e.jsx(w,{}),items:['"Summarize this contract"','"Draft a renewal email"','"Compare these two vendors"']},{title:"Capabilities",icon:e.jsx(v,{}),items:["Reads your attached files","Remembers context in a chat","Cites the sources it uses"]},{title:"Limits",icon:e.jsx(y,{}),items:["May occasionally be wrong","Can't access the live web by default","Won't act without approval"]}]})};var n,c,l;s.parameters={...s.parameters,docs:{...(n=s.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: args => <CapabilityOverview {...args} heading="Meet your assistant" footnote="Knowledge cutoff: January 2026. May not know recent events." sections={[{
    title: "Examples",
    icon: <Lightbulb />,
    items: ['"Summarize this contract"', '"Draft a renewal email"', '"Compare these two vendors"']
  }, {
    title: "Capabilities",
    icon: <Zap />,
    items: ["Reads your attached files", "Remembers context in a chat", "Cites the sources it uses"]
  }, {
    title: "Limits",
    icon: <TriangleAlert />,
    items: ["May occasionally be wrong", "Can't access the live web by default", "Won't act without approval"]
  }]} />
}`,...(l=(c=s.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};const k=["Default"];export{s as Default,k as __namedExportsOrder,A as default};
