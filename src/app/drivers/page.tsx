"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { useDriverStore } from "@/store";
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
import { DriverTable } from "@/components/drivers/DriverTable";
import { DriverModal } from "@/components/drivers/DriverModal";

export default function DriversPage() {
  const {
    loading,
    search,
    statusFilter,
    loadDrivers,
    setSearch,
    setStatusFilter,
    getFilteredDrivers,
    openAddModal,
  } = useDriverStore();

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const drivers = getFilteredDrivers();

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
        title="Driver Management"
        description="Manage drivers, licenses, assignments, and performance."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={openAddModal}
              className="h-10 gap-2 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
            >
              <Plus className="h-4 w-4" />
              Add Driver
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
            placeholder="Search by name, license, mobile, or vehicle..."
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
            <SelectItem value="on_trip">On Trip</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {drivers.length > 0 ? (
        <DriverTable drivers={drivers} />
      ) : (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB]">
          <p className="text-sm text-gray-500">No drivers match your filters.</p>
        </div>
      )}

      <DriverModal />
    </motion.div>
  );
}
