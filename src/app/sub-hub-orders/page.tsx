"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable } from "@/components/tables/data-table";
import type { HubOrder } from "@/types";
import { ordersService } from "@/services/orders.service";
import { formatCurrency } from "@/lib/utils";

const columns: ColumnDef<HubOrder>[] = [
  { accessorKey: "orderNo", header: "Order No." },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => row.original.customer.name,
  },
  { accessorKey: "location", header: "Location" },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => formatCurrency(row.original.value),
  },
  { accessorKey: "orderDate", header: "Order Date" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function SubHubOrdersPage() {
  const [orders, setOrders] = useState<HubOrder[]>([]);

  useEffect(() => {
    ordersService.getOrders({ pageSize: 100 }).then((res) => {
      setOrders(res.data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sub Hub Orders"
        description="Manage orders from sub-hub locations"
      />
      <DataTable columns={columns} data={orders} />
    </div>
  );
}
