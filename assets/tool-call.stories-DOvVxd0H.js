import{j as t}from"./jsx-runtime-DFAAy_2V.js";import{T as g}from"./index-PV9wSYDP.js";import"./index-Bc2G9s8g.js";import"./utils-DOIGBiOF.js";import"./circle-alert-CrM0R4cc.js";import"./createLucideIcon-Br12VlPe.js";import"./check-DYrJOilm.js";import"./loader-circle-ce2YPMvU.js";import"./wrench-DwLdfYdB.js";import"./chevron-right-w7uIHj32.js";const T={title:"Agent/ToolCall",component:g,tags:["autodocs"],parameters:{layout:"centered"},decorators:[p=>t.jsx("div",{className:"w-[28rem]",children:t.jsx(p,{})})]},e={args:{defaultOpen:!0,toolCall:{id:"1",name:"search_web",status:"running",args:{query:"latest Nucleux release notes",limit:5}}}},r={args:{defaultOpen:!0,toolCall:{id:"2",name:"get_weather",status:"success",args:{city:"Tokyo"},result:{tempC:24,condition:"clear"}}}},a={args:{defaultOpen:!0,toolCall:{id:"3",name:"charge_card",status:"error",args:{amount:4200,currency:"USD"},result:"PaymentError: card declined"}}};var n,s,o;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    toolCall: {
      id: "1",
      name: "search_web",
      status: "running",
      args: {
        query: "latest Nucleux release notes",
        limit: 5
      }
    }
  }
}`,...(o=(s=e.parameters)==null?void 0:s.docs)==null?void 0:o.source}}};var c,l,u;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    toolCall: {
      id: "2",
      name: "get_weather",
      status: "success",
      args: {
        city: "Tokyo"
      },
      result: {
        tempC: 24,
        condition: "clear"
      }
    }
  }
}`,...(u=(l=r.parameters)==null?void 0:l.docs)==null?void 0:u.source}}};var m,i,d;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    toolCall: {
      id: "3",
      name: "charge_card",
      status: "error",
      args: {
        amount: 4200,
        currency: "USD"
      },
      result: "PaymentError: card declined"
    }
  }
}`,...(d=(i=a.parameters)==null?void 0:i.docs)==null?void 0:d.source}}};const j=["Running","Success","Error"];export{a as Error,e as Running,r as Success,j as __namedExportsOrder,T as default};
