import{j as r}from"./jsx-runtime-DFAAy_2V.js";import{r as m}from"./index-Bc2G9s8g.js";import{R as s,a as p}from"./index-sYBcQOwx.js";import"./utils-DOIGBiOF.js";const b={title:"Primitives/RadioGroup",component:s,parameters:{layout:"centered"}},c=[{value:"instant",label:"Instant"},{value:"balanced",label:"Balanced"},{value:"thorough",label:"Thorough"}],e={render:()=>{const[n,u]=m.useState("balanced");return r.jsx(s,{value:n,onValueChange:u,label:"Summary speed",children:c.map(a=>r.jsxs("label",{className:"flex items-center gap-2 text-sm text-foreground",children:[r.jsx(p,{value:a.value}),a.label]},a.value))})}};var t,l,o;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("balanced");
    return <RadioGroup value={value} onValueChange={setValue} label="Summary speed">\r
        {options.map(o => <label key={o.value} className="flex items-center gap-2 text-sm text-foreground">\r
            <Radio value={o.value} />\r
            {o.label}\r
          </label>)}\r
      </RadioGroup>;
  }
}`,...(o=(l=e.parameters)==null?void 0:l.docs)==null?void 0:o.source}}};const f=["Default"];export{e as Default,f as __namedExportsOrder,b as default};
