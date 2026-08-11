import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{r as y}from"./index-Bc2G9s8g.js";import{c}from"./utils-DOIGBiOF.js";import{C as S}from"./check-DYrJOilm.js";import{L as v}from"./loader-circle-ce2YPMvU.js";import{X as A}from"./x-y04c1Xo9.js";import{c as s}from"./createLucideIcon-Br12VlPe.js";import{S as N}from"./search-AaExa3de.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=s("BookOpen",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=s("Circle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=s("FilePlus",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M9 15h6",key:"cctwl0"}],["path",{d:"M12 18v-6",key:"17g6i2"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=s("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=s("Terminal",[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]]),E={pending:"border-border bg-background text-muted-foreground",active:"border-info bg-info/10 text-info",done:"border-success bg-success text-success-foreground",error:"border-destructive bg-destructive text-destructive-foreground"};function T({status:t}){return t==="done"?e.jsx(S,{className:"size-3.5","aria-hidden":"true"}):t==="active"?e.jsx(v,{className:"size-3.5 animate-spin","aria-hidden":"true"}):t==="error"?e.jsx(A,{className:"size-3.5","aria-hidden":"true"}):e.jsx(R,{className:"size-2 fill-current","aria-hidden":"true"})}const r=y.forwardRef(({status:t="pending",icon:d,title:l,description:a,progress:p,className:b,...j},k)=>e.jsxs("li",{ref:k,className:c("relative flex gap-3 pb-5 last:pb-0","before:absolute before:left-[0.6875rem] before:top-6 before:h-[calc(100%-1.25rem)] before:w-px before:-translate-x-1/2 before:bg-border last:before:hidden",b),"aria-current":t==="active"?"step":void 0,...j,children:[e.jsx("span",{className:c("relative z-10 mt-0.5 inline-flex size-[1.375rem] shrink-0 items-center justify-center rounded-full border [&_svg]:size-3.5",E[t]),children:d??e.jsx(T,{status:t})}),e.jsxs("span",{className:"flex min-w-0 flex-1 flex-col gap-1",children:[e.jsx("span",{className:c("text-sm font-medium",t==="pending"?"text-muted-foreground":"text-foreground"),children:l}),a&&e.jsx("span",{className:"text-xs text-muted-foreground",children:a}),p!=null&&e.jsx("span",{className:"mt-1 block h-1 w-full overflow-hidden rounded-full bg-muted",children:e.jsx("span",{className:"block h-full rounded-full bg-info transition-[width]",style:{width:`${Math.max(0,Math.min(100,p))}%`}})})]})]}));r.displayName="AgentStep";const n=y.forwardRef(({className:t,children:d,...l},a)=>e.jsx("ol",{ref:a,className:c("flex flex-col",t),...l,children:d}));n.displayName="AgentSteps";r.__docgenInfo={description:"A single step in an {@link AgentSteps} tracker.",methods:[],displayName:"AgentStep",props:{status:{required:!1,tsType:{name:"union",raw:'"pending" | "active" | "done" | "error"',elements:[{name:"literal",value:'"pending"'},{name:"literal",value:'"active"'},{name:"literal",value:'"done"'},{name:"literal",value:'"error"'}]},description:"Execution status of the step.",defaultValue:{value:'"pending"',computed:!1}},icon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Action-type icon (e.g. read, execute, search). Overrides the status glyph."},title:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Step label."},description:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Supporting detail under the title."},progress:{required:!1,tsType:{name:"number"},description:"Optional progress track, 0–100, shown under the step while active."}},composes:["Omit"]};n.__docgenInfo={description:`A live tracker of an agent's multi-step plan — each {@link AgentStep} shows an
action-type icon, status and optional progress as the agent works.
Source: Figma "During Interaction / Processing Steps · Footprints".`,methods:[],displayName:"AgentSteps"};const V={title:"Agent/AgentSteps",component:n,tags:["autodocs"],parameters:{layout:"centered"},decorators:[t=>e.jsx("div",{className:"w-96",children:e.jsx(t,{})})]},i={render:()=>e.jsxs(n,{children:[e.jsx(r,{status:"done",icon:e.jsx(w,{}),title:"Reading skill doc",description:"Loaded 4 references"}),e.jsx(r,{status:"done",icon:e.jsx(N,{}),title:"Searching the codebase",description:"12 matches"}),e.jsx(r,{status:"active",icon:e.jsx(M,{}),title:"Executing command",description:"pnpm build",progress:60}),e.jsx(r,{status:"pending",icon:e.jsx(z,{}),title:"Browsing documentation"}),e.jsx(r,{status:"pending",icon:e.jsx(q,{}),title:"Creating file"})]})},o={render:()=>e.jsxs(n,{children:[e.jsx(r,{status:"done",title:"Fetched data"}),e.jsx(r,{status:"error",title:"Write failed",description:"Permission denied"}),e.jsx(r,{status:"pending",title:"Verify output"})]})};var u,m,g;i.parameters={...i.parameters,docs:{...(u=i.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <AgentSteps>\r
      <AgentStep status="done" icon={<BookOpen />} title="Reading skill doc" description="Loaded 4 references" />\r
      <AgentStep status="done" icon={<Search />} title="Searching the codebase" description="12 matches" />\r
      <AgentStep status="active" icon={<Terminal />} title="Executing command" description="pnpm build" progress={60} />\r
      <AgentStep status="pending" icon={<Globe />} title="Browsing documentation" />\r
      <AgentStep status="pending" icon={<FilePlus />} title="Creating file" />\r
    </AgentSteps>
}`,...(g=(m=i.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var f,h,x;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <AgentSteps>\r
      <AgentStep status="done" title="Fetched data" />\r
      <AgentStep status="error" title="Write failed" description="Permission denied" />\r
      <AgentStep status="pending" title="Verify output" />\r
    </AgentSteps>
}`,...(x=(h=o.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};const G=["Working","WithError"];export{o as WithError,i as Working,G as __namedExportsOrder,V as default};
