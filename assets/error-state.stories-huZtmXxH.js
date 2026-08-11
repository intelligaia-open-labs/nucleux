import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{r as N}from"./index-Bc2G9s8g.js";import{c as i}from"./utils-DOIGBiOF.js";import{T as R}from"./triangle-alert-BC0ROqOn.js";import{c as j}from"./createLucideIcon-Br12VlPe.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=j("Inbox",[["polyline",{points:"22 12 16 12 14 15 10 15 8 12 2 12",key:"o97t9d"}],["path",{d:"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",key:"oot6mr"}]]),s=N.forwardRef(({variant:t="empty",icon:f,title:y,description:a,actions:n,className:b,children:x,...h},v)=>e.jsxs("div",{ref:v,role:t==="error"?"alert":void 0,className:i("flex flex-col items-center gap-3 rounded-xl border border-border bg-background px-6 py-10 text-center",b),...h,children:[e.jsx("span",{className:i("inline-flex size-12 items-center justify-center rounded-full [&_svg]:size-6",t==="error"?"bg-destructive/10 text-destructive":"bg-muted text-muted-foreground"),children:f??e.jsx(R,{"aria-hidden":"true"})}),e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsx("h3",{className:"text-base font-semibold text-foreground",children:y}),a&&e.jsx("p",{className:"max-w-sm text-sm text-muted-foreground",children:a})]}),x,n&&e.jsx("div",{className:"mt-1 flex flex-wrap items-center justify-center gap-2",children:n})]}));s.displayName="ErrorState";s.__docgenInfo={description:`A centered empty / failure state — icon, title, description and recovery
actions. The AI-failure variant is the "your prompt didn't go through, your
draft is saved" recovery card.
Source: Figma "Recovery / Error & Empty States".`,methods:[],displayName:"ErrorState",props:{variant:{required:!1,tsType:{name:"union",raw:'"empty" | "error"',elements:[{name:"literal",value:'"empty"'},{name:"literal",value:'"error"'}]},description:"`empty` for neutral empty states, `error` for a failure (tints the icon).",defaultValue:{value:'"empty"',computed:!1}},icon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Icon shown above the title."},title:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:'Headline, e.g. `"Something went wrong"`.'},description:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Supporting explanation."},actions:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Action buttons, e.g. Retry / Edit prompt."}},composes:["Omit"]};const _={title:"Agent/ErrorState",component:s,tags:["autodocs"],parameters:{layout:"centered"},decorators:[t=>e.jsx("div",{className:"w-[28rem]",children:e.jsx(t,{})})],args:{title:"Nothing here yet"}},g="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",E="rounded-lg bg-info px-3 py-2 text-sm font-medium text-info-foreground transition-colors hover:bg-info/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",r={args:{variant:"error",title:"Something went wrong",description:"Your prompt didn't go through. Your draft is saved.",actions:e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:g,children:"Edit prompt"}),e.jsx("button",{type:"button",className:E,children:"Retry"})]})}},o={args:{icon:e.jsx(w,{}),title:"No results found",description:"Try adjusting your filters.",actions:e.jsx("button",{type:"button",className:g,children:"Clear filters"})}};var c,d,l;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    variant: "error",
    title: "Something went wrong",
    description: "Your prompt didn't go through. Your draft is saved.",
    actions: <>\r
        <button type="button" className={btn}>Edit prompt</button>\r
        <button type="button" className={primary}>Retry</button>\r
      </>
  }
}`,...(l=(d=r.parameters)==null?void 0:d.docs)==null?void 0:l.source}}};var m,u,p;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    icon: <Inbox />,
    title: "No results found",
    description: "Try adjusting your filters.",
    actions: <button type="button" className={btn}>Clear filters</button>
  }
}`,...(p=(u=o.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};const k=["PromptFailed","Empty"];export{o as Empty,r as PromptFailed,k as __namedExportsOrder,_ as default};
