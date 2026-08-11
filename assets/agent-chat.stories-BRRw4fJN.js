import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{r as a}from"./index-Bc2G9s8g.js";import{G as N}from"./index-BzsLIf89.js";import{I as f}from"./index-B1NnkLOj.js";import{B as y}from"./bell-C5sr0gLP.js";import{A as C}from"./index-B94DuRv6.js";import{S as k}from"./index-lf3vvOwG.js";import{S as T,b as d,C as I,L as A,c as B}from"./index-CM4X2-d5.js";import{H as z}from"./house-CIkgSlct.js";import{S as V}from"./sparkles-DMH0TSi7.js";import{c as p}from"./utils-DOIGBiOF.js";import{c as w}from"./createLucideIcon-Br12VlPe.js";import{M as x}from"./index-DbTpd01E.js";import{B as q}from"./brain-BdCyDv6E.js";import{C as E}from"./chevron-right-w7uIHj32.js";import{T as H}from"./index-PV9wSYDP.js";import{S as R}from"./index-B4DL37_5.js";import{A as M}from"./index-hrsjRn9R.js";import{B as D}from"./index-CH_MAmOK.js";import{M as L}from"./mic-B6VkfAVp.js";import"./wrench-DwLdfYdB.js";import"./search-AaExa3de.js";import"./circle-alert-CrM0R4cc.js";import"./check-DYrJOilm.js";import"./loader-circle-ce2YPMvU.js";import"./square-BDdoWZtE.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=w("ArrowDown",[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=w("Paperclip",[["path",{d:"M13.234 20.252 21 12.3",key:"1cbrk9"}],["path",{d:"m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486",key:"1pkts6"}]]);function P({dependency:n,threshold:t=48}={}){const o=a.useRef(null),[i,c]=a.useState(!0),m=a.useCallback((s="smooth")=>{const r=o.current;r&&(r.scrollTo({top:r.scrollHeight,behavior:s}),c(!0))},[]),l=a.useCallback(()=>{const s=o.current;if(!s)return;const r=s.scrollHeight-s.scrollTop-s.clientHeight;c(r<=t)},[t]);return a.useLayoutEffect(()=>{i&&m("auto")},[n]),a.useEffect(()=>{const s=o.current;if(s)return s.addEventListener("scroll",l,{passive:!0}),()=>s.removeEventListener("scroll",l)},[l]),{ref:o,pinned:i,scrollToBottom:m}}const h=a.forwardRef(({content:n,streaming:t=!1,defaultOpen:o=!1,label:i="Reasoning",className:c,...m},l)=>{const[s,r]=a.useState(o);return e.jsxs("div",{ref:l,className:p("rounded-md border border-dashed border-border bg-muted/30",c),...m,children:[e.jsxs("button",{type:"button",onClick:()=>r(S=>!S),"aria-expanded":s,className:"flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",children:[e.jsx(q,{className:p("size-4 shrink-0",t&&"animate-pulse")}),e.jsx("span",{className:"font-medium",children:i}),e.jsx(E,{className:p("ml-auto size-4 transition-transform",s&&"rotate-90")})]}),s&&e.jsx("div",{className:"whitespace-pre-wrap break-words border-t border-border px-3 py-2 text-sm italic text-muted-foreground",children:n})]})});h.displayName="Reasoning";h.__docgenInfo={description:`A collapsible panel for an agent's chain-of-thought / reasoning tokens,
visually de-emphasized from the final answer.`,methods:[],displayName:"Reasoning",props:{content:{required:!0,tsType:{name:"string"},description:"The reasoning / thinking text to reveal."},streaming:{required:!1,tsType:{name:"boolean"},description:"Whether reasoning is still streaming (shows a subtle pulse).",defaultValue:{value:"false",computed:!1}},defaultOpen:{required:!1,tsType:{name:"boolean"},description:"Expanded by default.",defaultValue:{value:"false",computed:!1}},label:{required:!1,tsType:{name:"string"},description:"Header label.",defaultValue:{value:'"Reasoning"',computed:!1}}}};const g=a.forwardRef(({autoScrollKey:n,hideScrollButton:t=!1,className:o,children:i,...c},m)=>{const{ref:l,pinned:s,scrollToBottom:r}=P({dependency:n});return e.jsxs("div",{className:"relative flex min-h-0 flex-1 flex-col",children:[e.jsx("div",{ref:l,className:p("flex-1 space-y-4 overflow-y-auto scroll-smooth p-4",o),...c,children:i}),!t&&!s&&e.jsx("button",{type:"button",onClick:()=>r(),"aria-label":"Scroll to latest",className:"absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring animate-nx-fade-in",children:e.jsx(O,{className:"size-4"})})]})});g.displayName="Thread";g.__docgenInfo={description:`Scrollable transcript container that keeps itself pinned to the newest
message while content streams, and surfaces a "jump to latest" button when
the user scrolls away.`,methods:[],displayName:"Thread",props:{autoScrollKey:{required:!1,tsType:{name:"unknown"},description:"Change this whenever messages are added so the view re-pins to bottom."},hideScrollButton:{required:!1,tsType:{name:"boolean"},description:'Disable the sticky "scroll to bottom" affordance.',defaultValue:{value:"false",computed:!1}}}};const xe={title:"Examples/Agent Chat",parameters:{layout:"fullscreen",docs:{description:{component:`A full agent chat screen assembled from Nucleux primitives — app shell +\r
transcript with reasoning, a tool call, streaming, suggestions, and the\r
agent composer.`}}}},u={render:()=>{const[n,t]=a.useState("");return e.jsxs("div",{className:"flex h-screen flex-col bg-background",children:[e.jsx(N,{left:e.jsx("span",{className:"text-base font-medium text-foreground",children:"Nebula"}),center:e.jsx(k,{containerClassName:"w-72"}),right:e.jsxs(e.Fragment,{children:[e.jsx(f,{"aria-label":"Notifications",size:"lg",children:e.jsx(y,{})}),e.jsx(C,{name:"Eric",className:"size-8"})]})}),e.jsxs("div",{className:"flex min-h-0 flex-1",children:[e.jsxs(T,{footer:e.jsx(d,{icon:e.jsx(B,{}),label:"Settings"}),children:[e.jsx(d,{icon:e.jsx(z,{}),label:"Home"}),e.jsx(d,{icon:e.jsx(V,{}),label:"Assistant",active:!0}),e.jsx(d,{icon:e.jsx(I,{}),label:"Calendar"}),e.jsx(d,{icon:e.jsx(A,{}),label:"Tasks"})]}),e.jsxs("main",{className:"flex min-w-0 flex-1 flex-col",children:[e.jsxs(g,{className:"mx-auto w-full max-w-3xl",children:[e.jsx(x,{role:"user",content:"Summarize the CPQ Q3 scope review and list the action items."}),e.jsxs("div",{className:"flex w-full max-w-3xl flex-col gap-2",children:[e.jsx(h,{defaultOpen:!0,content:"The user wants a summary plus action items. I'll pull the transcript, extract decisions, then format owners and due dates."}),e.jsx(H,{defaultOpen:!0,toolCall:{id:"t1",name:"get_transcript",status:"success",args:{meetingId:"zuora-cpq-q3"},result:{turns:214,durationSec:2700}}})]}),e.jsx(x,{role:"assistant",content:"Here's the summary: the team aligned on a phased CPQ rollout, with pricing rules landing first. Three action items were captured."}),e.jsx(x,{role:"assistant",streaming:!0,content:"Drafting the action item list"})]}),e.jsxs("div",{className:"mx-auto w-full max-w-3xl space-y-3 p-4",children:[e.jsx(R,{items:["List action items","Draft a follow-up email","Show decisions"],onSelect:t}),e.jsx(M,{value:n,onValueChange:t,onSubmit:()=>t(""),leftActions:e.jsx(f,{"aria-label":"Attach",size:"sm",children:e.jsx(_,{})}),rightActions:e.jsxs(e.Fragment,{children:[e.jsx(D,{variant:"secondary",children:"Opus 4.8"}),e.jsx(f,{"aria-label":"Voice",size:"sm",children:e.jsx(L,{})})]})})]})]})]})]})}};var b,v,j;u.parameters={...u.parameters,docs:{...(b=u.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("");
    return <div className="flex h-screen flex-col bg-background">\r
        <GlobalNav left={<span className="text-base font-medium text-foreground">Nebula</span>} center={<SearchInput containerClassName="w-72" />} right={<>\r
              <IconButton aria-label="Notifications" size="lg">\r
                <Bell />\r
              </IconButton>\r
              <Avatar name="Eric" className="size-8" />\r
            </>} />\r
\r
        <div className="flex min-h-0 flex-1">\r
          <Sidebar footer={<SidebarItem icon={<Settings />} label="Settings" />}>\r
            <SidebarItem icon={<Home />} label="Home" />\r
            <SidebarItem icon={<Sparkles />} label="Assistant" active />\r
            <SidebarItem icon={<Calendar />} label="Calendar" />\r
            <SidebarItem icon={<ListChecks />} label="Tasks" />\r
          </Sidebar>\r
\r
          <main className="flex min-w-0 flex-1 flex-col">\r
            <Thread className="mx-auto w-full max-w-3xl">\r
              <Message role="user" content="Summarize the CPQ Q3 scope review and list the action items." />\r
\r
              <div className="flex w-full max-w-3xl flex-col gap-2">\r
                <Reasoning defaultOpen content="The user wants a summary plus action items. I'll pull the transcript, extract decisions, then format owners and due dates." />\r
                <ToolCall defaultOpen toolCall={{
                id: "t1",
                name: "get_transcript",
                status: "success",
                args: {
                  meetingId: "zuora-cpq-q3"
                },
                result: {
                  turns: 214,
                  durationSec: 2700
                }
              }} />\r
              </div>\r
\r
              <Message role="assistant" content="Here's the summary: the team aligned on a phased CPQ rollout, with pricing rules landing first. Three action items were captured." />\r
              <Message role="assistant" streaming content="Drafting the action item list" />\r
            </Thread>\r
\r
            <div className="mx-auto w-full max-w-3xl space-y-3 p-4">\r
              <Suggestions items={["List action items", "Draft a follow-up email", "Show decisions"]} onSelect={setValue} />\r
              <AgentComposer value={value} onValueChange={setValue} onSubmit={() => setValue("")} leftActions={<IconButton aria-label="Attach" size="sm">\r
                    <Paperclip />\r
                  </IconButton>} rightActions={<>\r
                    <Badge variant="secondary">Opus 4.8</Badge>\r
                    <IconButton aria-label="Voice" size="sm">\r
                      <Mic />\r
                    </IconButton>\r
                  </>} />\r
            </div>\r
          </main>\r
        </div>\r
      </div>;
  }
}`,...(j=(v=u.parameters)==null?void 0:v.docs)==null?void 0:j.source}}};const he=["Default"];export{u as Default,he as __namedExportsOrder,xe as default};
