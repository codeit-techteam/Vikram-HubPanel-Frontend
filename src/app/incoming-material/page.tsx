"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import type { IncomingMaterial } from "@/types";
import { incomingMaterialService } from "@/services/incomingMaterial.service";
import { formatNumber } from "@/lib/utils";

const columns: ColumnDef<IncomingMaterial>[] = [
  {
    accessorKey: "shipmentNo",
    header: "Transfer ID",
    cell: ({ row }) => (
      <Link
        href={`/transfers/${row.original.id}`}
        className="font-medium text-[#FF6B00] hover:underline"
      >
        {row.original.shipmentNo}
      </Link>
    ),
  },
  { accessorKey: "supplier", header: "Source" },
  { accessorKey: "hubName", header: "Destination Hub" },
  { accessorKey: "materialCount", header: "Materials" },
  {
    accessorKey: "totalQuantity",
    header: "Total Qty",
    cell: ({ row }) => formatNumber(row.original.totalQuantity),
  },
  { accessorKey: "carrier", header: "Vehicle" },
  { accessorKey: "expectedDate", header: "Expected" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function IncomingMaterialPage() {
  const [shipments, setShipments] = useState<IncomingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await incomingMaterialService.getAll();
        if (!cancelled) setShipments(data);
      } catch {
        if (!cancelled) {
          setError("Failed to load incoming materials from transfers.");
          setShipments([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incoming Material"
        description="Live transfers en route to your hub"
        actions={
          <Button variant="outline" asChild>
            <Link href="/transfers">Open Transfers</Link>
          </Button>
        }
      />
      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
          {error}
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={shipments}
          searchKey="shipmentNo"
          searchPlaceholder="Search transfers..."
        />
      )}
    </div>
  );
}
