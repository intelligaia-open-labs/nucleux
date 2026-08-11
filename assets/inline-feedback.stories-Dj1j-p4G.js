import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{r as g}from"./index-Bc2G9s8g.js";import{c as k}from"./utils-DOIGBiOF.js";import{c as s}from"./createLucideIcon-Br12VlPe.js";import{R as F}from"./rotate-cw-9UNwRvvn.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=s("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=s("Ellipsis",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=s("ThumbsDown",[["path",{d:"M17 14V2",key:"8ymqnk"}],["path",{d:"M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z",key:"m61m77"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=s("ThumbsUp",[["path",{d:"M7 10v12",key:"1qc93n"}],["path",{d:"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",key:"emmmcr"}]]);function a({label:n,onClick:l,pressed:r,children:t}){return e.jsx("button",{type:"button","aria-label":n,title:n,"aria-pressed":r,onClick:l,className:k("inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",r&&"bg-accent text-foreground"),children:t})}const d=g.forwardRef(({rating:n,defaultRating:l=null,onRate:r,onCopy:t,onRegenerate:c,onMore:u,className:C,...j},R)=>{const[I,T]=g.useState(l),p=n!==void 0?n:I,m=f=>{n===void 0&&T(f),r==null||r(f)};return e.jsxs("div",{ref:R,role:"toolbar","aria-label":"Response feedback",className:k("inline-flex items-center gap-0.5",C),...j,children:[t&&e.jsx(a,{label:"Copy",onClick:t,children:e.jsx(M,{"aria-hidden":"true"})}),e.jsx(a,{label:"Good response",pressed:p==="up",onClick:()=>m("up"),children:e.jsx(E,{"aria-hidden":"true"})}),e.jsx(a,{label:"Bad response",pressed:p==="down",onClick:()=>m("down"),children:e.jsx(A,{"aria-hidden":"true"})}),c&&e.jsx(a,{label:"Regenerate",onClick:c,children:e.jsx(F,{"aria-hidden":"true"})}),u&&e.jsx(a,{label:"More",onClick:u,children:e.jsx(q,{"aria-hidden":"true"})})]})});d.displayName="InlineFeedback";d.__docgenInfo={description:`A compact toolbar beneath an AI response: copy, rate (thumbs up/down) and
regenerate — the feedback + re-run affordances specific to generated output.
Source: Figma "Expressive Input / Inline Feedback Controls".`,methods:[],displayName:"InlineFeedback",props:{rating:{required:!1,tsType:{name:"union",raw:"FeedbackRating | null",elements:[{name:"union",raw:'"up" | "down"',elements:[{name:"literal",value:'"up"'},{name:"literal",value:'"down"'}]},{name:"null"}]},description:"Current rating (controlled)."},defaultRating:{required:!1,tsType:{name:"union",raw:"FeedbackRating | null",elements:[{name:"union",raw:'"up" | "down"',elements:[{name:"literal",value:'"up"'},{name:"literal",value:'"down"'}]},{name:"null"}]},description:"Initial rating (uncontrolled).",defaultValue:{value:"null",computed:!1}},onRate:{required:!1,tsType:{name:"signature",type:"function",raw:"(rating: FeedbackRating) => void",signature:{arguments:[{type:{name:"union",raw:'"up" | "down"',elements:[{name:"literal",value:'"up"'},{name:"literal",value:'"down"'}]},name:"rating"}],return:{name:"void"}}},description:"Called when the user rates the response."},onCopy:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Called when the copy control is used. Hidden if omitted."},onRegenerate:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Called when the regenerate control is used. Hidden if omitted."},onMore:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Called when the more-actions control is used. Hidden if omitted."}},composes:["Omit"]};const O={title:"Agent/InlineFeedback",component:d,tags:["autodocs"],parameters:{layout:"centered"},args:{onCopy:()=>{},onRegenerate:()=>{},onMore:()=>{}}},o={},i={args:{onCopy:void 0,onRegenerate:void 0,onMore:void 0}};var h,y,b;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:"{}",...(b=(y=o.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};var v,x,w;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    onCopy: undefined,
    onRegenerate: undefined,
    onMore: undefined
  }
}`,...(w=(x=i.parameters)==null?void 0:x.docs)==null?void 0:w.source}}};const S=["Default","RatingsOnly"];export{o as Default,i as RatingsOnly,S as __namedExportsOrder,O as default};
