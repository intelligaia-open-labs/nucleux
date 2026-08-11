import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{r as c}from"./index-Bc2G9s8g.js";import{A as i}from"./index-hrsjRn9R.js";import{I as r}from"./index-B1NnkLOj.js";import{B as m}from"./index-CH_MAmOK.js";import{c as u}from"./createLucideIcon-Br12VlPe.js";import{M as x}from"./mic-B6VkfAVp.js";import{P as d}from"./plus-DfvTaRbJ.js";import"./utils-DOIGBiOF.js";import"./square-BDdoWZtE.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=u("SlidersHorizontal",[["line",{x1:"21",x2:"14",y1:"4",y2:"4",key:"obuewd"}],["line",{x1:"10",x2:"3",y1:"4",y2:"4",key:"1q6298"}],["line",{x1:"21",x2:"12",y1:"12",y2:"12",key:"1iu8h1"}],["line",{x1:"8",x2:"3",y1:"12",y2:"12",key:"ntss68"}],["line",{x1:"21",x2:"16",y1:"20",y2:"20",key:"14d8ph"}],["line",{x1:"12",x2:"3",y1:"20",y2:"20",key:"m0wm8r"}],["line",{x1:"14",x2:"14",y1:"2",y2:"6",key:"14e1ph"}],["line",{x1:"8",x2:"8",y1:"10",y2:"14",key:"1i6ji0"}],["line",{x1:"16",x2:"16",y1:"18",y2:"22",key:"1lctlv"}]]),V={title:"Agent/AgentComposer",component:i,parameters:{layout:"centered"}},n={args:{value:"",onValueChange:()=>{},onSubmit:()=>{}},render:()=>{const[l,t]=c.useState("");return e.jsx("div",{className:"w-[34rem]",children:e.jsx(i,{value:l,onValueChange:t,onSubmit:()=>t(""),leftActions:e.jsx(r,{"aria-label":"Attach",size:"sm",children:e.jsx(d,{})}),rightActions:e.jsxs(e.Fragment,{children:[e.jsx(m,{variant:"secondary",children:"Model 2"}),e.jsx(r,{"aria-label":"Settings",size:"sm",children:e.jsx(y,{})}),e.jsx(r,{"aria-label":"Voice",size:"sm",children:e.jsx(x,{})})]})})})}};var a,o,s;n.parameters={...n.parameters,docs:{...(a=n.parameters)==null?void 0:a.docs,source:{originalSource:`{
  args: {
    value: "",
    onValueChange: () => {},
    onSubmit: () => {}
  },
  render: () => {
    const [value, setValue] = useState("");
    return <div className="w-[34rem]">\r
        <AgentComposer value={value} onValueChange={setValue} onSubmit={() => setValue("")} leftActions={<IconButton aria-label="Attach" size="sm">\r
              <Plus />\r
            </IconButton>} rightActions={<>\r
              <Badge variant="secondary">Model 2</Badge>\r
              <IconButton aria-label="Settings" size="sm">\r
                <SlidersHorizontal />\r
              </IconButton>\r
              <IconButton aria-label="Voice" size="sm">\r
                <Mic />\r
              </IconButton>\r
            </>} />\r
      </div>;
  }
}`,...(s=(o=n.parameters)==null?void 0:o.docs)==null?void 0:s.source}}};const k=["Default"];export{n as Default,k as __namedExportsOrder,V as default};
