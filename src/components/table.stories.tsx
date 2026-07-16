import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const meta = {
  title: "Data/Table",
  component: Table,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Meetings: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Meeting</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">CPQ Q3 scope review</TableCell>
          <TableCell>45:00</TableCell>
          <TableCell>
            <Badge variant="success">Summarized</Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Design sync</TableCell>
          <TableCell>28:12</TableCell>
          <TableCell>
            <Badge variant="secondary">Processing</Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
