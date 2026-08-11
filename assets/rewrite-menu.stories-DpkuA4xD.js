import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{r as y}from"./index-Bc2G9s8g.js";import{c as f}from"./utils-DOIGBiOF.js";import{R as x}from"./rotate-cw-9UNwRvvn.js";import{c as t}from"./createLucideIcon-Br12VlPe.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=t("Briefcase",[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=t("List",[["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M3 18h.01",key:"1tta3j"}],["path",{d:"M3 6h.01",key:"1rqtza"}],["path",{d:"M8 12h13",key:"1za7za"}],["path",{d:"M8 18h13",key:"1lx6n3"}],["path",{d:"M8 6h13",key:"ik3vkj"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=t("Maximize2",[["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["polyline",{points:"9 21 3 21 3 15",key:"1avn1i"}],["line",{x1:"21",x2:"14",y1:"3",y2:"10",key:"ota7mn"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=t("MessageCircleQuestion",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=t("Minimize2",[["polyline",{points:"4 14 10 14 10 20",key:"11kfnr"}],["polyline",{points:"20 10 14 10 14 4",key:"rlmsce"}],["line",{x1:"14",x2:"21",y1:"10",y2:"3",key:"o5lafz"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]),w=[{id:"retry",label:"Try again",icon:e.jsx(x,{"aria-hidden":"true"})},{id:"expand",label:"Make longer",icon:e.jsx(g,{"aria-hidden":"true"})},{id:"concise",label:"Make concise",icon:e.jsx(M,{"aria-hidden":"true"})},{id:"professional",label:"Make it professional",icon:e.jsx(h,{"aria-hidden":"true"})},{id:"bullets",label:"Convert to bullet points",icon:e.jsx(k,{"aria-hidden":"true"})},{id:"follow-up",label:"Ask a follow-up",icon:e.jsx(b,{"aria-hidden":"true"})}],o=y.forwardRef(({actions:c=w,onAction:r,label:i,className:p,...u},m)=>e.jsxs("div",{ref:m,role:"menu","aria-label":typeof i=="string"?i:"Rewrite",className:f("flex w-56 flex-col gap-0.5 rounded-xl border border-border bg-background p-1.5 shadow-md",p),...u,children:[i&&e.jsx("p",{className:"px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground",children:i}),c.map(a=>e.jsxs("button",{type:"button",role:"menuitem",onClick:()=>r==null?void 0:r(a.id),className:"flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none [&_svg]:size-4 [&_svg]:text-muted-foreground",children:[a.icon,e.jsx("span",{className:"flex-1",children:a.label})]},a.id))]}));o.displayName="RewriteMenu";o.__docgenInfo={description:`A menu of model-driven rewrite and transform actions on an AI response —
retry, expand, make concise, restyle, convert to bullets.
Source: Figma "Refinement / Contextual transform".`,methods:[],displayName:"RewriteMenu",props:{actions:{required:!1,tsType:{name:"Array",elements:[{name:"RewriteAction"}],raw:"RewriteAction[]"},description:"Actions to list. Defaults to {@link defaultRewriteActions}.",defaultValue:{value:`[
  { id: "retry", label: "Try again", icon: <RotateCw aria-hidden="true" /> },
  { id: "expand", label: "Make longer", icon: <Maximize2 aria-hidden="true" /> },
  { id: "concise", label: "Make concise", icon: <Minimize2 aria-hidden="true" /> },
  { id: "professional", label: "Make it professional", icon: <Briefcase aria-hidden="true" /> },
  { id: "bullets", label: "Convert to bullet points", icon: <List aria-hidden="true" /> },
  { id: "follow-up", label: "Ask a follow-up", icon: <MessageCircleQuestion aria-hidden="true" /> },
]`,computed:!1}},onAction:{required:!1,tsType:{name:"signature",type:"function",raw:"(id: string) => void",signature:{arguments:[{type:{name:"string"},name:"id"}],return:{name:"void"}}},description:"Called with the action id when an item is chosen."},label:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Optional heading above the list."}},composes:["Omit"]};const C={title:"Agent/RewriteMenu",component:o,tags:["autodocs"],parameters:{layout:"centered"},args:{label:"Rewrite",onAction:()=>{}}},n={};var s,l,d;n.parameters={...n.parameters,docs:{...(s=n.parameters)==null?void 0:s.docs,source:{originalSource:"{}",...(d=(l=n.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};const N=["Default"];export{n as Default,N as __namedExportsOrder,C as default};
