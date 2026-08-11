import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{M as r}from"./index-DbTpd01E.js";import"./index-Bc2G9s8g.js";import"./utils-DOIGBiOF.js";import"./index-B94DuRv6.js";import"./wrench-DwLdfYdB.js";import"./createLucideIcon-Br12VlPe.js";const N={title:"Chat/Message",component:r,tags:["autodocs"],parameters:{layout:"centered"},args:{role:"assistant",content:"Hi! I'm an agent built with Nucleux. How can I help you today?"}},s={},t={args:{role:"user",content:"Summarize the last quarterly report."}},o={args:{role:"system",content:"You are a helpful, concise assistant."}},a={args:{role:"assistant",streaming:!0,content:"Let me look that up for you"}},n={render:()=>e.jsxs("div",{className:"flex w-[28rem] flex-col gap-4",children:[e.jsx(r,{role:"user",content:"What's the weather in Tokyo?"}),e.jsx(r,{role:"assistant",content:"It's 24°C and clear in Tokyo right now."}),e.jsx(r,{role:"user",content:"And tomorrow?"}),e.jsx(r,{role:"assistant",streaming:!0,content:"Tomorrow looks like light rain"})]})};var c,i,m;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:"{}",...(m=(i=s.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};var l,u,p;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    role: "user",
    content: "Summarize the last quarterly report."
  }
}`,...(p=(u=t.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var g,d,h;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    role: "system",
    content: "You are a helpful, concise assistant."
  }
}`,...(h=(d=o.parameters)==null?void 0:d.docs)==null?void 0:h.source}}};var y,x,w;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    role: "assistant",
    streaming: true,
    content: "Let me look that up for you"
  }
}`,...(w=(x=a.parameters)==null?void 0:x.docs)==null?void 0:w.source}}};var f,S,k;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <div className="flex w-[28rem] flex-col gap-4">\r
      <Message role="user" content="What's the weather in Tokyo?" />\r
      <Message role="assistant" content="It's 24°C and clear in Tokyo right now." />\r
      <Message role="user" content="And tomorrow?" />\r
      <Message role="assistant" streaming content="Tomorrow looks like light rain" />\r
    </div>
}`,...(k=(S=n.parameters)==null?void 0:S.docs)==null?void 0:k.source}}};const q=["Assistant","User","System","Streaming","Conversation"];export{s as Assistant,n as Conversation,a as Streaming,o as System,t as User,q as __namedExportsOrder,N as default};
