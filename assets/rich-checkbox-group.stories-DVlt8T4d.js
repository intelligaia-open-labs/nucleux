import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{r as h}from"./index-Bc2G9s8g.js";import{R as i,a as c}from"./index-DUYuBIOk.js";import"./utils-DOIGBiOF.js";import"./check-DYrJOilm.js";import"./createLucideIcon-Br12VlPe.js";const g={title:"Primitives/RichCheckboxGroup",component:i,parameters:{layout:"centered"}},t={render:()=>{const[r,m]=h.useState({summary:!0}),s=p=>d=>m(l=>({...l,[p]:d}));return e.jsxs(i,{label:"Include in export",className:"w-[22rem]",children:[e.jsx(c,{label:"Summary",description:"The AI-generated meeting summary.",checked:!!r.summary,onCheckedChange:s("summary")}),e.jsx(c,{label:"Transcript",description:"Full speaker-by-speaker transcript.",checked:!!r.transcript,onCheckedChange:s("transcript")}),e.jsx(c,{label:"Action items",description:"Extracted tasks and owners.",checked:!!r.actions,onCheckedChange:s("actions")})]})}};var n,a,o;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: () => {
    const [selected, setSelected] = useState<Record<string, boolean>>({
      summary: true
    });
    const set = (key: string) => (v: boolean) => setSelected(prev => ({
      ...prev,
      [key]: v
    }));
    return <RichCheckboxGroup label="Include in export" className="w-[22rem]">\r
        <RichCheckboxOption label="Summary" description="The AI-generated meeting summary." checked={!!selected.summary} onCheckedChange={set("summary")} />\r
        <RichCheckboxOption label="Transcript" description="Full speaker-by-speaker transcript." checked={!!selected.transcript} onCheckedChange={set("transcript")} />\r
        <RichCheckboxOption label="Action items" description="Extracted tasks and owners." checked={!!selected.actions} onCheckedChange={set("actions")} />\r
      </RichCheckboxGroup>;
  }
}`,...(o=(a=t.parameters)==null?void 0:a.docs)==null?void 0:o.source}}};const R=["Default"];export{t as Default,R as __namedExportsOrder,g as default};
