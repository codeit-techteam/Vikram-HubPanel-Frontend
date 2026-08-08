"use client";

import { Filter, Search } from "lucide-react";
import { useInventoryStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InventoryFilters() {
  const {
    categories,
    statuses,
    selectedCategory,
    selectedStatus,
    filters,
    setSearch,
    setSelectedCategory,
    setSelectedStatus,
    resetFilters,
  } = useInventoryStore();

  return (
    <div className="sticky top-16 z-10 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Filter by Product or SKU..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 border-gray-200 bg-gray-50 pl-9 focus-visible:bg-white"
        />
      </div>

      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="h-10 w-full border-gray-200 bg-white sm:w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger className="h-10 w-full border-gray-200 bg-white sm:w-[160px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0 border-gray-200"
        onClick={resetFilters}
        aria-label="Reset filters"
      >
        <Filter className="h-4 w-4" />
      </Button>
    </div>
  );
}
