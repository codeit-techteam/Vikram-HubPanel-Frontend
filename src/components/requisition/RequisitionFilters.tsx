"use client";

import { Download, Filter, Search } from "lucide-react";
import { useRequisitionStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function RequisitionFilters() {
  const {
    trackingFilters,
    statusOptions,
    setSearch,
    setStatusFilter,
    resetTrackingFilters,
    isFilterOpen,
    setFilterOpen,
  } = useRequisitionStore();

  return (
    <>
      <div className="sticky top-16 z-10 hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:block">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search Request ID or Hub..."
              value={trackingFilters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 border-gray-200 bg-gray-50 pl-9 focus-visible:bg-white"
            />
          </div>

          <Select value={trackingFilters.status} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full border-gray-200 bg-white sm:w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 border-gray-200"
            onClick={resetTrackingFilters}
            aria-label="Reset filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isFilterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Requisitions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search Request ID or Hub..."
                value={trackingFilters.search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 border-gray-200 bg-gray-50 pl-9"
              />
            </div>

            <Select value={trackingFilters.status} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-full border-gray-200">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetTrackingFilters}>
                Reset
              </Button>
              <Button onClick={() => setFilterOpen(false)}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function RequisitionFilterButton() {
  const setFilterOpen = useRequisitionStore((state) => state.setFilterOpen);

  return (
    <Button
      variant="outline"
      className="border-gray-200"
      onClick={() => setFilterOpen(true)}
    >
      <Filter className="mr-2 h-4 w-4" />
      Filter
    </Button>
  );
}

export function RequisitionExportButton() {
  const { filteredRequests } = useRequisitionStore();

  const handleExport = () => {
    const headers = [
      "Request ID",
      "Date",
      "Hub Location",
      "Items",
      "Material",
      "Value",
      "Status",
    ];
    const rows = filteredRequests.map((r) => [
      r.requestId,
      r.date,
      r.hubLocation,
      r.items.quantity,
      r.items.material,
      r.value,
      r.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "requisitions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      className="border-gray-200"
      onClick={handleExport}
    >
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
