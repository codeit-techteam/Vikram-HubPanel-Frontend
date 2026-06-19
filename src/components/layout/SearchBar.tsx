"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useDashboardStore, useTransferStore, useDispatchStore, useLedgerStore } from "@/store";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
}

const PLACEHOLDERS: Record<string, string> = {
  "/transfers": "Search Transfer # or Material...",
  "/inventory": "Filter by Product or SKU...",
  "/requisitions": "Search Request ID or Hub...",
  "/dispatch": "Search orders, trucks, or drivers...",
  "/ledger": "Search ledger by SKU, Truck ID, Supplier...",
};

export function SearchBar({ className }: SearchBarProps) {
  const pathname = usePathname();
  const isTransfersPage =
    pathname === "/transfers" || pathname.startsWith("/transfers/");
  const isDispatchPage =
    pathname === "/dispatch" || pathname.startsWith("/dispatch/");
  const isLedgerPage =
    pathname === "/ledger" || pathname.startsWith("/ledger/");

  const dashboardQuery = useDashboardStore((state) => state.searchQuery);
  const setDashboardQuery = useDashboardStore((state) => state.setSearchQuery);
  const transferSearch = useTransferStore((state) => state.filters.search);
  const setTransferSearch = useTransferStore((state) => state.setSearch);
  const dispatchSearch = useDispatchStore((state) => state.globalSearch);
  const setDispatchSearch = useDispatchStore((state) => state.setGlobalSearch);
  const ledgerSearch = useLedgerStore((state) => state.filters.search);
  const setLedgerSearch = useLedgerStore((state) => state.setSearch);

  const searchQuery = isLedgerPage
    ? ledgerSearch
    : isTransfersPage
      ? transferSearch
      : isDispatchPage
        ? dispatchSearch
        : dashboardQuery;
  const setSearchQuery = isLedgerPage
    ? setLedgerSearch
    : isTransfersPage
      ? setTransferSearch
      : isDispatchPage
        ? setDispatchSearch
        : setDashboardQuery;

  const placeholder =
    Object.entries(PLACEHOLDERS).find(([path]) => pathname.startsWith(path))?.[1] ??
    "Search POs, SKU, Trucks...";

  return (
    <div className={cn("relative w-full max-w-xl", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#FF6B00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
      />
    </div>
  );
}
