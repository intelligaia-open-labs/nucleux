import{j as e}from"./jsx-runtime-DFAAy_2V.js";import{B as T}from"./index-CH_MAmOK.js";import{r as d}from"./index-Bc2G9s8g.js";import{c as o}from"./utils-DOIGBiOF.js";const c=d.forwardRef(({className:a,...l},r)=>e.jsx("div",{className:"relative w-full overflow-x-auto",children:e.jsx("table",{ref:r,className:o("w-full caption-bottom text-sm",a),...l})}));c.displayName="Table";const m=d.forwardRef(({className:a,...l},r)=>e.jsx("thead",{ref:r,className:o("[&_tr]:border-b [&_tr]:border-border",a),...l}));m.displayName="TableHeader";const b=d.forwardRef(({className:a,...l},r)=>e.jsx("tbody",{ref:r,className:o("[&_tr:last-child]:border-0",a),...l}));b.displayName="TableBody";const n=d.forwardRef(({className:a,...l},r)=>e.jsx("tr",{ref:r,className:o("border-b border-border transition-colors hover:bg-muted/50",a),...l}));n.displayName="TableRow";const t=d.forwardRef(({className:a,...l},r)=>e.jsx("th",{ref:r,scope:"col",className:o("h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground",a),...l}));t.displayName="TableHead";const s=d.forwardRef(({className:a,...l},r)=>e.jsx("td",{ref:r,className:o("px-4 py-2.5 align-middle text-foreground",a),...l}));s.displayName="TableCell";const h=d.forwardRef(({className:a,...l},r)=>e.jsx("caption",{ref:r,className:o("mt-3 text-xs text-muted-foreground",a),...l}));h.displayName="TableCaption";c.__docgenInfo={description:"Scroll-wrapped table root.",methods:[],displayName:"Table"};m.__docgenInfo={description:"",methods:[],displayName:"TableHeader"};b.__docgenInfo={description:"",methods:[],displayName:"TableBody"};n.__docgenInfo={description:"",methods:[],displayName:"TableRow"};t.__docgenInfo={description:"",methods:[],displayName:"TableHead"};s.__docgenInfo={description:"",methods:[],displayName:"TableCell"};h.__docgenInfo={description:"",methods:[],displayName:"TableCaption"};const N={title:"Data/Table",component:c,parameters:{layout:"padded"}},i={render:()=>e.jsxs(c,{children:[e.jsx(m,{children:e.jsxs(n,{children:[e.jsx(t,{children:"Meeting"}),e.jsx(t,{children:"Duration"}),e.jsx(t,{children:"Status"})]})}),e.jsxs(b,{children:[e.jsxs(n,{children:[e.jsx(s,{className:"font-medium",children:"CPQ Q3 scope review"}),e.jsx(s,{children:"45:00"}),e.jsx(s,{children:e.jsx(T,{variant:"success",children:"Summarized"})})]}),e.jsxs(n,{children:[e.jsx(s,{className:"font-medium",children:"Design sync"}),e.jsx(s,{children:"28:12"}),e.jsx(s,{children:e.jsx(T,{variant:"secondary",children:"Processing"})})]})]})]})};var p,x,f;i.parameters={...i.parameters,docs:{...(p=i.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <Table>\r
      <TableHeader>\r
        <TableRow>\r
          <TableHead>Meeting</TableHead>\r
          <TableHead>Duration</TableHead>\r
          <TableHead>Status</TableHead>\r
        </TableRow>\r
      </TableHeader>\r
      <TableBody>\r
        <TableRow>\r
          <TableCell className="font-medium">CPQ Q3 scope review</TableCell>\r
          <TableCell>45:00</TableCell>\r
          <TableCell>\r
            <Badge variant="success">Summarized</Badge>\r
          </TableCell>\r
        </TableRow>\r
        <TableRow>\r
          <TableCell className="font-medium">Design sync</TableCell>\r
          <TableCell>28:12</TableCell>\r
          <TableCell>\r
            <Badge variant="secondary">Processing</Badge>\r
          </TableCell>\r
        </TableRow>\r
      </TableBody>\r
    </Table>
}`,...(f=(x=i.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};const w=["Meetings"];export{i as Meetings,w as __namedExportsOrder,N as default};
