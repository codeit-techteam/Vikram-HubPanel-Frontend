"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { DataTable } from "@/components/tables/data-table";
import type { IncomingMaterial } from "@/types";
import { incomingMaterialService } from "@/services/incomingMaterial.service";
import { formatNumber } from "@/lib/utils";

const columns: ColumnDef<IncomingMaterial>[] = [
  { accessorKey: "shipmentNo", header: "Shipment No." },
  { accessorKey: "supplier", header: "Supplier" },
  { accessorKey: "hubName", header: "Destination Hub" },
  { accessorKey: "materialCount", header: "Materials" },
  {
    accessorKey: "totalQuantity",
    header: "Total Qty",
    cell: ({ row }) => formatNumber(row.original.totalQuantity),
  },
  { accessorKey: "carrier", header: "Carrier" },
  { accessorKey: "expectedDate", header: "Expected Date" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function IncomingMaterialPage() {
  const [shipments, setShipments] = useState<IncomingMaterial[]>([]);

  useEffect(() => {
    incomingMaterialService.getAll().then(setShipments);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incoming Material"
        description="Track incoming shipments and deliveries"
      />
      <DataTable
        columns={columns}
        data={shipments}
        searchKey="shipmentNo"
        searchPlaceholder="Search shipments..."
      />
    </div>
  );
}
