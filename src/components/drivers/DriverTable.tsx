"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Pencil, Star, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DriverStatusBadge } from "./DriverStatusBadge";
import { DriverContactActions } from "./DriverContactActions";
import { ConfirmationDialog } from "@/components/modals/confirmation-dialog";
import { useDriverStore } from "@/store";
import type { DispatchDriver } from "@/types";
import { useState } from "react";

interface DriverTableProps {
  drivers: DispatchDriver[];
}

export function DriverTable({ drivers }: DriverTableProps) {
  const { openEditModal, deleteDriver } = useDriverStore();
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
                      "Driver Name",
                      "Mobile Number",
                      "License Number",
                      "Vehicle Assigned",
                      "Status",
                      "Current Trip",
                      "Rating",
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
                  {drivers.map((driver) => (
                    <tr
                      key={driver.id}
                      className="border-b border-[#E5E7EB] last:border-0 hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">
                            {driver.name}
                          </p>
                          <DriverContactActions driver={driver} compact />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {driver.mobile ?? driver.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {driver.licenseNumber ?? driver.licenseNo ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {driver.assignedVehicle ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <DriverStatusBadge status={driver.status} />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#FF6B00]">
                        {driver.currentTrip ?? "None"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-sm font-medium">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {driver.rating}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <Link href={`/drivers/${driver.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditModal(driver)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => setDeleteId(driver.id)}
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
        title="Delete Driver"
        description="Are you sure you want to delete this driver? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) {
            deleteDriver(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </>
  );
}
