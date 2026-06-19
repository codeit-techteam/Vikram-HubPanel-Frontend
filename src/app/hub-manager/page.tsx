"use client";

import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { hubService } from "@/services/hub.service";
import type { Hub } from "@/types";
import { formatNumber } from "@/lib/utils";

const columns: ColumnDef<Hub>[] = [
  { accessorKey: "code", header: "Hub Code" },
  { accessorKey: "name", header: "Hub Name" },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => `${row.original.city}, ${row.original.state}`,
  },
  { accessorKey: "manager", header: "Manager" },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => formatNumber(row.original.capacity),
  },
  {
    accessorKey: "utilization",
    header: "Utilization",
    cell: ({ row }) => `${row.original.utilization}%`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function HubManagerPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["hubs"],
    queryFn: () => hubService.getAll({ pageSize: 50 }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hub Manager"
        description="Manage and monitor all hub operations"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Hub
          </Button>
        }
      />
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          searchKey="name"
          searchPlaceholder="Search hubs..."
        />
      )}
    </div>
  );
}
