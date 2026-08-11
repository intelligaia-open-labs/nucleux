import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{r}from"./index-Bc2G9s8g.js";import{c as i}from"./utils-DOIGBiOF.js";import{B as c}from"./index-B2s0_U20.js";const m=r.createContext(null);function f({open:n,onOpenChange:o,children:a,className:t,dismissible:u=!0}){const l=r.useId(),y=r.useRef(null),d=r.useCallback(()=>o(!1),[o]);return r.useEffect(()=>{if(!n||!u)return;const s=j=>{j.key==="Escape"&&d()};return document.addEventListener("keydown",s),()=>document.removeEventListener("keydown",s)},[n,u,d]),r.useEffect(()=>{var s;n&&((s=y.current)==null||s.focus())},[n]),n?e.jsx(m.Provider,{value:{titleId:`${l}-title`,descriptionId:`${l}-desc`,onClose:d},children:e.jsxs("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4",children:[e.jsx("div",{"aria-hidden":!0,className:"absolute inset-0 bg-foreground/50 animate-nx-fade-in",onClick:u?d:void 0}),e.jsx("div",{ref:y,role:"dialog","aria-modal":"true","aria-labelledby":`${l}-title`,"aria-describedby":`${l}-desc`,tabIndex:-1,className:i("relative z-10 flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-background p-6 shadow-lg outline-none animate-nx-fade-in",t),children:a})]})}):null}const g=r.forwardRef(({className:n,...o},a)=>e.jsx("div",{ref:a,className:i("flex flex-col gap-1",n),...o}));g.displayName="DialogHeader";const x=r.forwardRef(({className:n,...o},a)=>{const t=r.useContext(m);return e.jsx("h2",{ref:a,id:t==null?void 0:t.titleId,className:i("text-xl font-semibold text-foreground",n),...o})});x.displayName="DialogTitle";const h=r.forwardRef(({className:n,...o},a)=>{const t=r.useContext(m);return e.jsx("p",{ref:a,id:t==null?void 0:t.descriptionId,className:i("text-sm text-muted-foreground",n),...o})});h.displayName="DialogDescription";const v=r.forwardRef(({className:n,...o},a)=>e.jsx("div",{ref:a,className:i("flex items-center justify-end gap-2 pt-2",n),...o}));v.displayName="DialogFooter";f.__docgenInfo={description:"A modal dialog. Controlled via `open` / `onOpenChange`. Renders an overlay and\na centered panel; closes on overlay click or Escape (unless `dismissible` is\nfalse). Compose with DialogHeader, DialogTitle, DialogDescription, DialogFooter.",methods:[],displayName:"Dialog",props:{open:{required:!0,tsType:{name:"boolean"},description:"Whether the dialog is open."},onOpenChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(open: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"open"}],return:{name:"void"}}},description:"Called when the dialog requests to close (overlay click / Escape)."},children:{required:!0,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"Panel content — compose DialogHeader/Title/Description/Footer."},className:{required:!1,tsType:{name:"string"},description:"Class overrides for the panel."},dismissible:{required:!1,tsType:{name:"boolean"},description:"Disable closing on overlay click / Escape.",defaultValue:{value:"true",computed:!1}}}};g.__docgenInfo={description:"",methods:[],displayName:"DialogHeader"};x.__docgenInfo={description:"",methods:[],displayName:"DialogTitle"};h.__docgenInfo={description:"",methods:[],displayName:"DialogDescription"};v.__docgenInfo={description:"",methods:[],displayName:"DialogFooter"};const E={title:"Overlays/Dialog",component:f,parameters:{layout:"centered"}},p={args:{open:!1,onOpenChange:()=>{},children:null},render:()=>{const[n,o]=r.useState(!1);return e.jsxs(e.Fragment,{children:[e.jsx(c,{onClick:()=>o(!0),children:"Save memory…"}),e.jsxs(f,{open:n,onOpenChange:o,children:[e.jsxs(g,{children:[e.jsx(x,{children:"Save this as memory?"}),e.jsx(h,{children:"This preference can personalize future conversations and actions."})]}),e.jsx("div",{className:"rounded-lg border border-border bg-accent p-3 text-sm text-foreground",children:"Prefers concise product copy, dark-mode screenshots, and approval before file changes."}),e.jsxs(v,{children:[e.jsx(c,{variant:"ghost",onClick:()=>o(!1),children:"Cancel"}),e.jsx(c,{variant:"secondary",children:"Edit"}),e.jsx(c,{onClick:()=>o(!1),children:"Save"})]})]})]})}};var D,b,C;p.parameters={...p.parameters,docs:{...(D=p.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    open: false,
    onOpenChange: () => {},
    children: null
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <>\r
        <Button onClick={() => setOpen(true)}>Save memory…</Button>\r
        <Dialog open={open} onOpenChange={setOpen}>\r
          <DialogHeader>\r
            <DialogTitle>Save this as memory?</DialogTitle>\r
            <DialogDescription>\r
              This preference can personalize future conversations and actions.\r
            </DialogDescription>\r
          </DialogHeader>\r
          <div className="rounded-lg border border-border bg-accent p-3 text-sm text-foreground">\r
            Prefers concise product copy, dark-mode screenshots, and approval before file changes.\r
          </div>\r
          <DialogFooter>\r
            <Button variant="ghost" onClick={() => setOpen(false)}>\r
              Cancel\r
            </Button>\r
            <Button variant="secondary">Edit</Button>\r
            <Button onClick={() => setOpen(false)}>Save</Button>\r
          </DialogFooter>\r
        </Dialog>\r
      </>;
  }
}`,...(C=(b=p.parameters)==null?void 0:b.docs)==null?void 0:C.source}}};const O=["MemorySaveConsent"];export{p as MemorySaveConsent,O as __namedExportsOrder,E as default};
