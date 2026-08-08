"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VehicleStatusBadge } from "./VehicleStatusBadge";
import { ConfirmationDialog } from "@/components/modals/confirmation-dialog";
import { useFleetStore } from "@/store";
import type { DispatchVehicle } from "@/types";
import { useState } from "react";

interface VehicleTableProps {
  vehicles: DispatchVehicle[];
}

export function VehicleTable({ vehicles }: VehicleTableProps) {
  const { openEditModal, deleteVehicle } = useFleetStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-gray-50/80">
                    {[
                      "Vehicle Number",
                      "Vehicle Type",
                      "Capacity",
                      "Assigned Driver",
                      "Status",
                      "Availability",
                      "RC Expiry",
                      "Insurance Expiry",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="border-b border-[#E5E7EB] last:border-0 hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-[#111827]">
                        {vehicle.vehicleNumber ?? vehicle.registrationNo}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {vehicle.type ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {vehicle.capacity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {vehicle.assignedDriver ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <VehicleStatusBadge status={vehicle.status} />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#FF6B00]">
                        {vehicle.availability ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {vehicle.rcExpiry ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {vehicle.insuranceExpiry ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <Link href={`/fleet/${vehicle.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditModal(vehicle)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => setDeleteId(vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Vehicle"
        description="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) {
            deleteVehicle(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </>
  );
}
