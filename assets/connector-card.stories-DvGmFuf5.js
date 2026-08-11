import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{r as N}from"./index-Bc2G9s8g.js";import{c as j}from"./utils-DOIGBiOF.js";import{c as p}from"./createLucideIcon-Br12VlPe.js";import{C as k}from"./check-DYrJOilm.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=p("Github",[["path",{d:"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",key:"tonef"}],["path",{d:"M9 18c-4.51 2-5-2-7-2",key:"9comsn"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=p("Plug",[["path",{d:"M12 22v-5",key:"1ega77"}],["path",{d:"M9 8V2",key:"14iosj"}],["path",{d:"M15 8V2",key:"18g5xt"}],["path",{d:"M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z",key:"osxo6l"}]]),s=N.forwardRef(({name:o,description:a,icon:f,connected:x=!1,onConnect:h,onDisconnect:c,connectLabel:b="Connect",disconnectLabel:R="Disconnect",className:v,...y},C)=>e.jsxs("div",{ref:C,className:j("flex items-center gap-3 rounded-xl border border-border bg-background p-4",v),...y,children:[e.jsx("span",{className:"inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg]:size-5",children:f??e.jsx(w,{"aria-hidden":"true"})}),e.jsxs("div",{className:"flex min-w-0 flex-1 flex-col",children:[e.jsx("span",{className:"text-sm font-medium text-foreground",children:o}),a&&e.jsx("span",{className:"text-xs text-muted-foreground",children:a})]}),x?e.jsxs("div",{className:"flex shrink-0 items-center gap-2",children:[e.jsxs("span",{className:"inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success [&_svg]:size-3.5",children:[e.jsx(k,{"aria-hidden":"true"}),"Connected"]}),c&&e.jsx("button",{type:"button",onClick:c,className:"rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",children:R})]}):e.jsx("button",{type:"button",onClick:h,className:"inline-flex shrink-0 items-center rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",children:b})]}));s.displayName="ConnectorCard";s.__docgenInfo={description:`A card to enable an external tool or data connector for the agent — icon,
name, what it unlocks, and a connect action.
Source: Figma "Context Expansion / Connector suggestion card".`,methods:[],displayName:"ConnectorCard",props:{name:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:'Connector name, e.g. `"GitHub"`.'},description:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"What the connector gives the agent access to."},icon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Connector logo/icon. Defaults to a plug glyph."},connected:{required:!1,tsType:{name:"boolean"},description:"Whether the connector is already connected.",defaultValue:{value:"false",computed:!1}},onConnect:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Called to connect. Renders the connect button when set and not connected."},onDisconnect:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Called to disconnect. Renders a manage/disconnect control when connected."},connectLabel:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"",defaultValue:{value:'"Connect"',computed:!1}},disconnectLabel:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"",defaultValue:{value:'"Disconnect"',computed:!1}}},composes:["Omit"]};const P={title:"Agent/ConnectorCard",component:s,tags:["autodocs"],parameters:{layout:"centered"},decorators:[o=>e.jsx("div",{className:"w-[26rem]",children:e.jsx(o,{})})]},n={args:{name:"GitHub",description:"Let the agent read issues, PRs, and code",icon:e.jsx(g,{}),onConnect:()=>{}}},t={args:{name:"GitHub",description:"Reading issues, PRs, and code",icon:e.jsx(g,{}),connected:!0,onDisconnect:()=>{}}};var r,i,d;n.parameters={...n.parameters,docs:{...(r=n.parameters)==null?void 0:r.docs,source:{originalSource:`{
  args: {
    name: "GitHub",
    description: "Let the agent read issues, PRs, and code",
    icon: <Github />,
    onConnect: () => {}
  }
}`,...(d=(i=n.parameters)==null?void 0:i.docs)==null?void 0:d.source}}};var u,l,m;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    name: "GitHub",
    description: "Reading issues, PRs, and code",
    icon: <Github />,
    connected: true,
    onDisconnect: () => {}
  }
}`,...(m=(l=t.parameters)==null?void 0:l.docs)==null?void 0:m.source}}};const V=["Disconnected","Connected"];export{t as Connected,n as Disconnected,V as __namedExportsOrder,P as default};
