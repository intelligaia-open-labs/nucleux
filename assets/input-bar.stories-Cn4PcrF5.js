import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{r as a}from"./index-Bc2G9s8g.js";import{c as E}from"./utils-DOIGBiOF.js";import{S as q,A as I}from"./square-BDdoWZtE.js";import"./createLucideIcon-Br12VlPe.js";const i=a.forwardRef(({value:t,onValueChange:r,onSubmit:c,loading:d=!1,onStop:o,maxHeight:s=200,placeholder:w="Message the agent…",className:V,disabled:p,...C},j)=>{const m=a.useRef(null);a.useImperativeHandle(j,()=>m.current),a.useLayoutEffect(()=>{const n=m.current;n&&(n.style.height="auto",n.style.height=`${Math.min(n.scrollHeight,s)}px`)},[t,s]);const g=t.trim().length>0&&!p,f=()=>{g&&c(t.trim())},N=n=>{n.key==="Enter"&&!n.shiftKey&&!n.nativeEvent.isComposing&&(n.preventDefault(),f())};return e.jsxs("div",{className:E("flex items-end gap-2 rounded-2xl border border-input bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring",V),children:[e.jsx("textarea",{ref:m,rows:1,value:t,disabled:p,placeholder:w,onChange:n=>r(n.target.value),onKeyDown:N,className:"max-h-[inherit] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50",...C}),d?e.jsx("button",{type:"button",onClick:o,"aria-label":"Stop generating",className:"inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",children:e.jsx(q,{className:"size-3.5 fill-current"})}):e.jsx("button",{type:"button",onClick:f,disabled:!g,"aria-label":"Send message",className:"inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",children:e.jsx(I,{className:"size-4"})})]})});i.displayName="InputBar";i.__docgenInfo={description:"Auto-resizing chat composer. Enter submits, Shift+Enter inserts a newline.\nWhile `loading`, the send button becomes a stop button wired to `onStop`.",methods:[],displayName:"InputBar",props:{value:{required:!0,tsType:{name:"string"},description:"Controlled value of the input."},onValueChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:"Called when the value changes."},onSubmit:{required:!0,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:"Called with the trimmed value on submit (Enter or button)."},loading:{required:!1,tsType:{name:"boolean"},description:"Show the agent as busy — swaps the send button for a stop button.",defaultValue:{value:"false",computed:!1}},onStop:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Called when the stop button is pressed while `loading`."},maxHeight:{required:!1,tsType:{name:"number"},description:"Max auto-grow height in px before scrolling.",defaultValue:{value:"200",computed:!1}},placeholder:{defaultValue:{value:'"Message the agent…"',computed:!1},required:!1}},composes:["Omit"]};const D={title:"Chat/InputBar",component:i,parameters:{layout:"centered"}},u={args:{value:"",onValueChange:()=>{},onSubmit:()=>{}},render:()=>{const[t,r]=a.useState(""),[c,d]=a.useState([]);return e.jsxs("div",{className:"w-[28rem] space-y-3",children:[e.jsx(i,{value:t,onValueChange:r,onSubmit:o=>{d(s=>[...s,o]),r("")}}),e.jsx("ul",{className:"space-y-1 text-sm text-muted-foreground",children:c.map((o,s)=>e.jsxs("li",{children:["→ ",o]},s))})]})}},l={args:{value:"",onValueChange:()=>{},onSubmit:()=>{}},render:()=>{const[t,r]=a.useState("Generating a response…");return e.jsx("div",{className:"w-[28rem]",children:e.jsx(i,{value:t,onValueChange:r,onSubmit:()=>{},loading:!0,onStop:()=>{}})})}};var h,v,b;u.parameters={...u.parameters,docs:{...(h=u.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    value: "",
    onValueChange: () => {},
    onSubmit: () => {}
  },
  render: () => {
    const [value, setValue] = useState("");
    const [log, setLog] = useState<string[]>([]);
    return <div className="w-[28rem] space-y-3">\r
        <InputBar value={value} onValueChange={setValue} onSubmit={v => {
        setLog(l => [...l, v]);
        setValue("");
      }} />\r
        <ul className="space-y-1 text-sm text-muted-foreground">\r
          {log.map((m, i) => <li key={i}>→ {m}</li>)}\r
        </ul>\r
      </div>;
  }
}`,...(b=(v=u.parameters)==null?void 0:v.docs)==null?void 0:b.source}}};var y,x,S;l.parameters={...l.parameters,docs:{...(y=l.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    value: "",
    onValueChange: () => {},
    onSubmit: () => {}
  },
  render: () => {
    const [value, setValue] = useState("Generating a response…");
    return <div className="w-[28rem]">\r
        <InputBar value={value} onValueChange={setValue} onSubmit={() => {}} loading onStop={() => {}} />\r
      </div>;
  }
}`,...(S=(x=l.parameters)==null?void 0:x.docs)==null?void 0:S.source}}};const M=["Default","Loading"];export{u as Default,l as Loading,M as __namedExportsOrder,D as default};
