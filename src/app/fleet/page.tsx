"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { useFleetStore } from "@/store";
import { PageHeader } from "@/components/common/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VehicleTable } from "@/components/fleet/VehicleTable";
import { VehicleModal } from "@/components/fleet/VehicleModal";

export default function FleetPage() {
  const {
    loading,
    search,
    statusFilter,
    loadFleet,
    setSearch,
    setStatusFilter,
    getFilteredVehicles,
    openAddModal,
  } = useFleetStore();

  useEffect(() => {
    loadFleet();
  }, [loadFleet]);

  const vehicles = getFilteredVehicles();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <PageHeader
        title="Fleet Management"
        description="Manage vehicles, capacity, maintenance status, and availability."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={openAddModal}
              className="h-10 gap-2 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
            >
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vehicle number, type, or driver..."
            className="h-11 rounded-xl pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 w-full rounded-xl sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {vehicles.length > 0 ? (
        <VehicleTable vehicles={vehicles} />
      ) : (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB]">
          <p className="text-sm text-gray-500">No vehicles match your filters.</p>
        </div>
      )}

      <VehicleModal />
    </motion.div>
  );
}
