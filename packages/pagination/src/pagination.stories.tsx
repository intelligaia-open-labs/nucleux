import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from "./index";

const meta = {
  title: "Primitives/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

const stub = { page: 1, count: 1, onPageChange: () => {} };

export const Default: Story = {
  args: stub,
  render: () => {
    const [page, setPage] = useState(4);
    return <Pagination page={page} count={12} onPageChange={setPage} />;
  },
};

export const Few: Story = {
  args: stub,
  render: () => {
    const [page, setPage] = useState(1);
    return <Pagination page={page} count={3} onPageChange={setPage} />;
  },
};
