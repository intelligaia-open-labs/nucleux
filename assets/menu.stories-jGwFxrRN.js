import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{r as s}from"./index-Bc2G9s8g.js";import{c as d}from"./utils-DOIGBiOF.js";import{R as v}from"./rotate-cw-9UNwRvvn.js";import{c}from"./createLucideIcon-Br12VlPe.js";import{C as b}from"./chevron-right-w7uIHj32.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=c("FoldVertical",[["path",{d:"M12 22v-6",key:"6o8u61"}],["path",{d:"M12 8V2",key:"1wkif3"}],["path",{d:"M4 12H2",key:"rhcxmi"}],["path",{d:"M10 12H8",key:"s88cx1"}],["path",{d:"M16 12h-2",key:"10asgb"}],["path",{d:"M22 12h-2",key:"14jgyd"}],["path",{d:"m15 19-3-3-3 3",key:"e37ymu"}],["path",{d:"m15 5-3 3-3-3",key:"19d6lf"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=c("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=c("UnfoldVertical",[["path",{d:"M12 22v-6",key:"6o8u61"}],["path",{d:"M12 8V2",key:"1wkif3"}],["path",{d:"M4 12H2",key:"rhcxmi"}],["path",{d:"M10 12H8",key:"s88cx1"}],["path",{d:"M16 12h-2",key:"10asgb"}],["path",{d:"M22 12h-2",key:"14jgyd"}],["path",{d:"m15 19-3 3-3-3",key:"11eu04"}],["path",{d:"m15 5-3-3-3 3",key:"itvq4r"}]]),i=s.forwardRef(({className:t,...n},r)=>e.jsx("div",{ref:r,role:"menu",className:d("min-w-[12rem] rounded-lg border border-border bg-background p-1 text-foreground shadow-md",t),...n}));i.displayName="Menu";const a=s.forwardRef(({icon:t,trailing:n,destructive:r=!1,type:x="button",className:f,children:y,...M},g)=>e.jsxs("button",{ref:g,type:x,role:"menuitem",className:d("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",r?"text-destructive hover:bg-destructive/10":"text-foreground hover:bg-accent",f),...M,children:[t&&e.jsx("span",{className:"shrink-0",children:t}),e.jsx("span",{className:"flex-1 truncate",children:y}),n&&e.jsx("span",{className:"shrink-0 text-muted-foreground",children:n})]}));a.displayName="MenuItem";const u=s.forwardRef(({className:t,...n},r)=>e.jsx("div",{ref:r,role:"separator",className:d("-mx-1 my-1 h-px bg-border",t),...n}));u.displayName="MenuSeparator";const l=s.forwardRef(({className:t,...n},r)=>e.jsx("div",{ref:r,className:d("px-2 py-1.5 text-xs font-medium text-muted-foreground",t),...n}));l.displayName="MenuLabel";i.__docgenInfo={description:`A menu surface (dropdown / context menu panel). Presentational — pair with
your own trigger/positioning. Compose with MenuItem, MenuSeparator, MenuLabel.`,methods:[],displayName:"Menu"};a.__docgenInfo={description:"",methods:[],displayName:"MenuItem",props:{icon:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Leading icon."},trailing:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Trailing content — shortcut hint or submenu chevron."},destructive:{required:!1,tsType:{name:"boolean"},description:"Style as a destructive action.",defaultValue:{value:"false",computed:!1}},type:{defaultValue:{value:'"button"',computed:!1},required:!1}}};u.__docgenInfo={description:"",methods:[],displayName:"MenuSeparator"};l.__docgenInfo={description:"",methods:[],displayName:"MenuLabel"};const C={title:"Navigation/Menu",component:i,parameters:{layout:"centered"}},o={render:()=>e.jsxs(i,{children:[e.jsx(l,{children:"Response"}),e.jsx(a,{icon:e.jsx(v,{}),children:"Try again"}),e.jsx(a,{icon:e.jsx(N,{}),children:"Expand response"}),e.jsx(a,{icon:e.jsx(k,{}),children:"Concise response"}),e.jsx(u,{}),e.jsx(a,{trailing:e.jsx(b,{}),children:"Transform"}),e.jsx(a,{icon:e.jsx(j,{}),destructive:!0,children:"Delete"})]})};var p,m,h;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <Menu>\r
      <MenuLabel>Response</MenuLabel>\r
      <MenuItem icon={<RotateCw />}>Try again</MenuItem>\r
      <MenuItem icon={<UnfoldVertical />}>Expand response</MenuItem>\r
      <MenuItem icon={<FoldVertical />}>Concise response</MenuItem>\r
      <MenuSeparator />\r
      <MenuItem trailing={<ChevronRight />}>Transform</MenuItem>\r
      <MenuItem icon={<Trash2 />} destructive>\r
        Delete\r
      </MenuItem>\r
    </Menu>
}`,...(h=(m=o.parameters)==null?void 0:m.docs)==null?void 0:h.source}}};const L=["ContextMenu"];export{o as ContextMenu,L as __namedExportsOrder,C as default};
