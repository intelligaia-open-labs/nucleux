import type { Meta, StoryObj } from "@storybook/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./index";

const meta = {
  title: "Data/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { columns: [], data: [] },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

interface Invoice {
  id: string;
  status: string;
  amount: number;
}

const columns: ColumnDef<Invoice>[] = [
  { accessorKey: "id", header: "Invoice" },
  { accessorKey: "status", header: "Status" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => `$${row.original.amount.toFixed(2)}`,
  },
];

const data: Invoice[] = [
  { id: "INV-001", status: "Paid", amount: 250 },
  { id: "INV-002", status: "Pending", amount: 150 },
  { id: "INV-003", status: "Unpaid", amount: 350 },
  { id: "INV-004", status: "Paid", amount: 450 },
];

export const Default: Story = {
  args: { columns: [], data: [] },
  render: () => (
    <div className="w-[32rem]">
      <DataTable columns={columns} data={data} pageSize={3} />
    </div>
  ),
};
