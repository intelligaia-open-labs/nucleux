import{j as t}from"./jsx-runtime-DFAAy_2V.js";import{r as v}from"./index-Bc2G9s8g.js";import{c as x}from"./utils-DOIGBiOF.js";import{c as p}from"./createLucideIcon-Br12VlPe.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=p("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=p("EyeOff",[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]),j={temporary:{icon:t.jsx(N,{"aria-hidden":"true"}),text:"This chat won't appear in your history or update memory."},incognito:{icon:t.jsx(k,{"aria-hidden":"true"}),text:"Incognito chats aren't saved or added to memory."}},r=v.forwardRef(({variant:l="temporary",icon:y,className:u,children:g,...h},f)=>{const o=j[l];return t.jsxs("div",{ref:f,className:x("inline-flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground [&_svg]:size-3.5",u),...h,children:[y??o.icon,t.jsx("span",{children:g??o.text})]})});r.displayName="PrivacyNotice";r.__docgenInfo={description:`A subtle notice that a conversation is ephemeral or private — communicates
the agent's data-handling/memory state to the user.
Source: Figma "Privacy and Control / temporary & incognito notices".`,methods:[],displayName:"PrivacyNotice",props:{variant:{required:!1,tsType:{name:"union",raw:'"temporary" | "incognito"',elements:[{name:"literal",value:'"temporary"'},{name:"literal",value:'"incognito"'}]},description:"Which data-handling mode this notice describes.",defaultValue:{value:'"temporary"',computed:!1}},icon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Leading icon. Defaults per variant."}}};const P={title:"Agent/PrivacyNotice",component:r,tags:["autodocs"],parameters:{layout:"centered"}},e={args:{variant:"temporary"}},a={args:{variant:"incognito"}};var n,i,s;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    variant: "temporary"
  }
}`,...(s=(i=e.parameters)==null?void 0:i.docs)==null?void 0:s.source}}};var c,m,d;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    variant: "incognito"
  }
}`,...(d=(m=a.parameters)==null?void 0:m.docs)==null?void 0:d.source}}};const T=["Temporary","Incognito"];export{a as Incognito,e as Temporary,T as __namedExportsOrder,P as default};
