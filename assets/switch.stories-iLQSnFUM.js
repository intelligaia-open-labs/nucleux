import{j as s}from"./jsx-runtime-DFAAy_2V.js";import{r as S}from"./index-Bc2G9s8g.js";import{S as t}from"./index-B7ufj7UL.js";import"./utils-DOIGBiOF.js";const C={title:"Primitives/Switch",component:t,tags:["autodocs"],parameters:{layout:"centered"}},e={render:()=>{const[h,f]=S.useState(!0);return s.jsx(t,{checked:h,onCheckedChange:f,"aria-label":"Notifications"})}},a={render:()=>s.jsxs("div",{className:"flex items-center gap-4",children:[s.jsx(t,{size:"sm",defaultChecked:!0,"aria-label":"Small"}),s.jsx(t,{size:"md",defaultChecked:!0,"aria-label":"Medium"})]})},r={args:{disabled:!0,defaultChecked:!0,"aria-label":"Disabled"}};var i,c,o;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => {
    const [on, setOn] = useState(true);
    return <Switch checked={on} onCheckedChange={setOn} aria-label="Notifications" />;
  }
}`,...(o=(c=e.parameters)==null?void 0:c.docs)==null?void 0:o.source}}};var n,d,l;a.parameters={...a.parameters,docs:{...(n=a.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">\r
      <Switch size="sm" defaultChecked aria-label="Small" />\r
      <Switch size="md" defaultChecked aria-label="Medium" />\r
    </div>
}`,...(l=(d=a.parameters)==null?void 0:d.docs)==null?void 0:l.source}}};var m,u,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultChecked: true,
    "aria-label": "Disabled"
  }
}`,...(p=(u=r.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};const j=["Default","Sizes","Disabled"];export{e as Default,r as Disabled,a as Sizes,j as __namedExportsOrder,C as default};
