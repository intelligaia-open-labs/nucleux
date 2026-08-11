import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{M as d}from"./meeting-dashboard-CB2dra3w.js";import{G as m}from"./index-BzsLIf89.js";import{I as s}from"./index-B1NnkLOj.js";import{B as c}from"./bell-C5sr0gLP.js";import{A as p}from"./index-B94DuRv6.js";import{S as b}from"./index-lf3vvOwG.js";import{S as x,a as i,b as a,C as f,L as u,c as g}from"./index-CM4X2-d5.js";import{P as t}from"./plus-DfvTaRbJ.js";import{H as h}from"./house-CIkgSlct.js";import{S as j}from"./sparkles-DMH0TSi7.js";import"./index-Bc2G9s8g.js";import"./index-Bw-fzWjm.js";import"./utils-DOIGBiOF.js";import"./play-BsFCSAZD.js";import"./createLucideIcon-Br12VlPe.js";import"./index-CH_MAmOK.js";import"./circle-check-CzMphq9o.js";import"./index-BEXbxuuC.js";import"./mic-B6VkfAVp.js";import"./index-DuJlUU1n.js";import"./check-DYrJOilm.js";import"./index-B2s0_U20.js";import"./wrench-DwLdfYdB.js";import"./search-AaExa3de.js";const J={title:"Examples/Day-0 Dashboard (App Shell)",parameters:{layout:"fullscreen",docs:{description:{component:`Full "day-0-dashboard" app shell — GlobalNav + collapsed Sidebar wrapping the\r
meeting dashboard body. Faithful implementation of the source Figma design\r
(AI-UX-Pattern › day-0-dashboard).`}}}};function S(){return e.jsx("div",{className:"flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-emerald-400 via-teal-500 to-violet-600 text-sm font-semibold text-white",children:"P"})}const r={render:()=>e.jsxs("div",{className:"flex h-screen flex-col bg-background",children:[e.jsx(m,{left:e.jsx("span",{className:"text-base text-foreground",children:"Heading"}),center:e.jsx(b,{containerClassName:"w-72"}),right:e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"relative",children:[e.jsx(s,{"aria-label":"Notifications",size:"lg",children:e.jsx(c,{})}),e.jsx("span",{className:"absolute right-2 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background"})]}),e.jsx(p,{name:"Eric",className:"size-8"})]})}),e.jsxs("div",{className:"flex min-h-0 flex-1",children:[e.jsxs(x,{footer:e.jsx(a,{icon:e.jsx(g,{}),label:"Settings"}),children:[e.jsx(S,{}),e.jsx(s,{"aria-label":"New recording",variant:"solid",children:e.jsx(t,{})}),e.jsx(i,{}),e.jsx(a,{icon:e.jsx(h,{}),label:"Home",active:!0}),e.jsx(a,{icon:e.jsx(j,{}),label:"Assistant"}),e.jsx(a,{icon:e.jsx(f,{}),label:"Calendar"}),e.jsx(a,{icon:e.jsx(u,{}),label:"Tasks"}),e.jsx(i,{}),e.jsx(a,{icon:e.jsx(t,{}),label:"Add"})]}),e.jsx("main",{className:"min-w-0 flex-1 overflow-y-auto",children:e.jsx(d,{})})]})]})};var n,o,l;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: () => <div className="flex h-screen flex-col bg-background">\r
      <GlobalNav left={<span className="text-base text-foreground">Heading</span>} center={<SearchInput containerClassName="w-72" />} right={<>\r
            <div className="relative">\r
              <IconButton aria-label="Notifications" size="lg">\r
                <Bell />\r
              </IconButton>\r
              <span className="absolute right-2 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />\r
            </div>\r
            <Avatar name="Eric" className="size-8" />\r
          </>} />\r
\r
      <div className="flex min-h-0 flex-1">\r
        <Sidebar footer={<SidebarItem icon={<Settings />} label="Settings" />}>\r
          <BrandMark />\r
          <IconButton aria-label="New recording" variant="solid">\r
            <Plus />\r
          </IconButton>\r
          <SidebarSeparator />\r
          <SidebarItem icon={<Home />} label="Home" active />\r
          <SidebarItem icon={<Sparkles />} label="Assistant" />\r
          <SidebarItem icon={<Calendar />} label="Calendar" />\r
          <SidebarItem icon={<ListChecks />} label="Tasks" />\r
          <SidebarSeparator />\r
          <SidebarItem icon={<Plus />} label="Add" />\r
        </Sidebar>\r
\r
        <main className="min-w-0 flex-1 overflow-y-auto">\r
          <MeetingDashboardBody />\r
        </main>\r
      </div>\r
    </div>
}`,...(l=(o=r.parameters)==null?void 0:o.docs)==null?void 0:l.source}}};const K=["Default"];export{r as Default,K as __namedExportsOrder,J as default};
