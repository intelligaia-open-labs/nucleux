import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{M as a}from"./index-QqMYKlKD.js";import{P as n}from"./play-BsFCSAZD.js";import{c as j}from"./createLucideIcon-Br12VlPe.js";import{L as d,A as m}from"./index-CwttvJ9N.js";import{B as y}from"./index-B2s0_U20.js";import{A as C}from"./index-B94DuRv6.js";import{B as g}from"./index-CH_MAmOK.js";import{C as b}from"./index-57FInBkB.js";import"./index-Bc2G9s8g.js";import"./utils-DOIGBiOF.js";import"./wrench-DwLdfYdB.js";import"./x-y04c1Xo9.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=j("Image",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]]),T={title:"Examples/Card Variations",parameters:{layout:"padded",docs:{description:{component:'The **Card Variation** family from Figma ("Card Variation 1…33") — every one\r\nof them is the same anatomy: a media area with an overlaid *label*, a\r\n*heading*, and a *description*. Rather than ship 22+ near-identical packages,\r\nthe whole family is expressed with a single {@link MediaCard} primitive via\r\nits `media` slot, `orientation`, `footer`, and `title`/`description` props.\r\n\nThis gallery reproduces the Figma pattern and then walks through the\r\nmeaningful, real-world permutations you get for free.'}}}};function i({label:r,labelVariant:o,icon:c,from:h="from-slate-700",to:x="to-slate-950"}){return e.jsxs("div",{className:`relative flex size-full items-center justify-center bg-gradient-to-br ${h} ${x}`,children:[c&&e.jsx("span",{className:"text-background/90",children:c}),r!=null&&(o&&o!=="chip"?e.jsx(g,{variant:o,className:"absolute left-3 top-3 shadow-sm",children:r}):e.jsx(b,{className:"absolute left-3 top-3 shadow-sm",children:r}))]})}function t({caption:r,children:o}){return e.jsxs("div",{className:"space-y-2",children:[e.jsx("p",{className:"text-xs font-medium uppercase tracking-wide text-muted-foreground",children:r}),o]})}const s={render:()=>e.jsxs("div",{className:"grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3",children:[e.jsx(t,{caption:"Canonical (label overlay)",children:e.jsx(a,{media:e.jsx(i,{label:"Label",icon:e.jsx(n,{className:"size-8 fill-current"})}),title:"Heading",description:"Description"})}),e.jsx(t,{caption:"Info label",children:e.jsx(a,{media:e.jsx(i,{label:"New",labelVariant:"info",from:"from-indigo-600",to:"to-violet-900"}),title:"Model comparison",description:"Claude Opus 4.8 vs. Sonnet on reasoning benchmarks."})}),e.jsx(t,{caption:"Success label",children:e.jsx(a,{media:e.jsx(i,{label:"Live",labelVariant:"success",from:"from-emerald-600",to:"to-teal-900"}),title:"Deployment ready",description:"All checks passed. Ship when you are."})}),e.jsx(t,{caption:"No label",children:e.jsx(a,{media:e.jsx(i,{icon:e.jsx(l,{className:"size-8"})}),title:"Untitled asset",description:"Uploaded just now · 2.4 MB"})}),e.jsx(t,{caption:"Text only (no media)",children:e.jsx(a,{title:"Weekly summary",description:"12 conversations · 3 flagged for follow-up. Your agent handled routing automatically."})}),e.jsx(t,{caption:"With footer action",children:e.jsx(a,{media:e.jsx(i,{label:"Guide",icon:e.jsx(n,{className:"size-8 fill-current"})}),title:"Getting started",description:"A 5-minute tour of the agent workspace.",footer:e.jsx(d,{rightIcon:e.jsx(m,{className:"size-4"}),children:"Open guide"})})}),e.jsx(t,{caption:"Real image",children:e.jsx(a,{image:"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=640&q=60",imageAlt:"Abstract data visualization",title:"Telemetry dashboard",description:"Latency and token usage across all sessions."})}),e.jsx(t,{caption:"CTA footer",children:e.jsx(a,{media:e.jsx(i,{label:"Beta",labelVariant:"default",from:"from-fuchsia-600",to:"to-purple-900"}),title:"Try agent memory",description:"Persist context across conversations automatically.",footer:e.jsx(y,{size:"sm",className:"w-full",children:"Enable memory"})})}),e.jsx(t,{caption:"Contributor footer",children:e.jsx(a,{media:e.jsx(i,{label:"Draft",icon:e.jsx(l,{className:"size-8"})}),title:"Q3 planning doc",description:"Shared workspace · edited 2h ago",footer:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"flex -space-x-2",children:["Ada Lin","Sam Poe","Zoe Ray"].map(r=>e.jsx(C,{name:r,className:"size-6 ring-2 ring-background"},r))}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"+4 editing"})]})})}),e.jsx(t,{caption:"Horizontal",children:e.jsx(a,{orientation:"horizontal",media:e.jsx(i,{label:"45:00",icon:e.jsx(n,{className:"size-6 fill-current"})}),title:"CPQ scope review",description:"Recorded meeting · summarized by agent."})}),e.jsx(t,{caption:"Horizontal + action",children:e.jsx(a,{orientation:"horizontal",media:e.jsx(i,{icon:e.jsx(l,{className:"size-6"}),from:"from-sky-600",to:"to-blue-900"}),title:"Design handoff",description:"14 frames ready for review.",footer:e.jsx(d,{rightIcon:e.jsx(m,{className:"size-4"}),children:"Review"})})}),e.jsx(t,{caption:"Body badge",children:e.jsx(a,{media:e.jsx(i,{label:"Report",from:"from-slate-600",to:"to-slate-900"}),title:"Usage report",description:"Generated for July 2026.",children:e.jsx(g,{variant:"success",className:"mt-1 w-fit",children:"+12% vs. June"})})})]})};var p,f,u;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">\r
      <Cell caption="Canonical (label overlay)">\r
        <MediaCard media={<Poster label="Label" icon={<Play className="size-8 fill-current" />} />} title="Heading" description="Description" />\r
      </Cell>\r
\r
      <Cell caption="Info label">\r
        <MediaCard media={<Poster label="New" labelVariant="info" from="from-indigo-600" to="to-violet-900" />} title="Model comparison" description="Claude Opus 4.8 vs. Sonnet on reasoning benchmarks." />\r
      </Cell>\r
\r
      <Cell caption="Success label">\r
        <MediaCard media={<Poster label="Live" labelVariant="success" from="from-emerald-600" to="to-teal-900" />} title="Deployment ready" description="All checks passed. Ship when you are." />\r
      </Cell>\r
\r
      <Cell caption="No label">\r
        <MediaCard media={<Poster icon={<ImageIcon className="size-8" />} />} title="Untitled asset" description="Uploaded just now · 2.4 MB" />\r
      </Cell>\r
\r
      <Cell caption="Text only (no media)">\r
        <MediaCard title="Weekly summary" description="12 conversations · 3 flagged for follow-up. Your agent handled routing automatically." />\r
      </Cell>\r
\r
      <Cell caption="With footer action">\r
        <MediaCard media={<Poster label="Guide" icon={<Play className="size-8 fill-current" />} />} title="Getting started" description="A 5-minute tour of the agent workspace." footer={<LinkButton rightIcon={<ArrowUpRight className="size-4" />}>Open guide</LinkButton>} />\r
      </Cell>\r
\r
      <Cell caption="Real image">\r
        <MediaCard image="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=640&q=60" imageAlt="Abstract data visualization" title="Telemetry dashboard" description="Latency and token usage across all sessions." />\r
      </Cell>\r
\r
      <Cell caption="CTA footer">\r
        <MediaCard media={<Poster label="Beta" labelVariant="default" from="from-fuchsia-600" to="to-purple-900" />} title="Try agent memory" description="Persist context across conversations automatically." footer={<Button size="sm" className="w-full">\r
              Enable memory\r
            </Button>} />\r
      </Cell>\r
\r
      <Cell caption="Contributor footer">\r
        <MediaCard media={<Poster label="Draft" icon={<ImageIcon className="size-8" />} />} title="Q3 planning doc" description="Shared workspace · edited 2h ago" footer={<div className="flex items-center gap-2">\r
              <div className="flex -space-x-2">\r
                {["Ada Lin", "Sam Poe", "Zoe Ray"].map(n => <Avatar key={n} name={n} className="size-6 ring-2 ring-background" />)}\r
              </div>\r
              <span className="text-xs text-muted-foreground">+4 editing</span>\r
            </div>} />\r
      </Cell>\r
\r
      <Cell caption="Horizontal">\r
        <MediaCard orientation="horizontal" media={<Poster label="45:00" icon={<Play className="size-6 fill-current" />} />} title="CPQ scope review" description="Recorded meeting · summarized by agent." />\r
      </Cell>\r
\r
      <Cell caption="Horizontal + action">\r
        <MediaCard orientation="horizontal" media={<Poster icon={<ImageIcon className="size-6" />} from="from-sky-600" to="to-blue-900" />} title="Design handoff" description="14 frames ready for review." footer={<LinkButton rightIcon={<ArrowUpRight className="size-4" />}>Review</LinkButton>} />\r
      </Cell>\r
\r
      <Cell caption="Body badge">\r
        <MediaCard media={<Poster label="Report" from="from-slate-600" to="to-slate-900" />} title="Usage report" description="Generated for July 2026.">\r
          <Badge variant="success" className="mt-1 w-fit">\r
            +12% vs. June\r
          </Badge>\r
        </MediaCard>\r
      </Cell>\r
    </div>
}`,...(u=(f=s.parameters)==null?void 0:f.docs)==null?void 0:u.source}}};const U=["Gallery"];export{s as Gallery,U as __namedExportsOrder,T as default};
