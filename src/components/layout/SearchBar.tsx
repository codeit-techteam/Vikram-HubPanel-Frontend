"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  Loader2,
  Package,
  Search,
  Truck,
  UserRound,
  Warehouse,
} from "lucide-react";
import {
  searchService,
  type HubSearchGroup,
  type HubSearchHit,
  type HubSearchHitType,
} from "@/services/search.service";
import {
  useDashboardStore,
  useDispatchStore,
  useInventoryStore,
  useTransferStore,
  useRequisitionStore,
  useFleetStore,
  useDriverStore,
  useOrdersStore,
} from "@/store";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
}

const PLACEHOLDERS: Record<string, string> = {
  "/transfers": "Search Transfer # or Material...",
  "/inventory": "Filter by Product or SKU...",
  "/requisitions": "Search Request ID or Hub...",
  "/dispatch": "Search orders, trucks, or drivers...",
  "/orders": "Search order # or customer...",
  "/fleet": "Search truck registration...",
  "/drivers": "Search driver name or license...",
};

const TYPE_ICON: Record<HubSearchHitType, typeof Search> = {
  orders: ClipboardList,
  inventory: Package,
  products: Package,
  drivers: UserRound,
  vehicles: Truck,
  dispatches: Truck,
  requisitions: Warehouse,
};

export function SearchBar({ className }: SearchBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<HubSearchGroup[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const setDashboardQuery = useDashboardStore((s) => s.setSearchQuery);
  const setTransferSearch = useTransferStore((s) => s.setSearch);
  const setDispatchSearch = useDispatchStore((s) => s.setGlobalSearch);
  const setInventorySearch = useInventoryStore((s) => s.setSearch);
  const setRequisitionSearch = useRequisitionStore((s) => s.setSearch);
  const setFleetSearch = useFleetStore((s) => s.setSearch);
  const setDriverSearch = useDriverStore((s) => s.setSearch);
  const setOrdersSearch = useOrdersStore((s) => s.setSearch);

  const placeholder =
    Object.entries(PLACEHOLDERS).find(([path]) =>
      pathname.startsWith(path),
    )?.[1] ?? "Search POs, SKU, Trucks...";

  const flatResults = groups.flatMap((g) => g.items);

  const syncPageFilters = useCallback(
    (value: string) => {
      setDashboardQuery(value);
      if (pathname.startsWith("/transfers")) setTransferSearch(value);
      else if (pathname.startsWith("/dispatch")) setDispatchSearch(value);
      else if (pathname.startsWith("/inventory")) setInventorySearch(value);
      else if (pathname.startsWith("/requisitions"))
        setRequisitionSearch(value);
      else if (pathname.startsWith("/fleet")) setFleetSearch(value);
      else if (pathname.startsWith("/drivers")) setDriverSearch(value);
      else if (pathname.startsWith("/orders")) setOrdersSearch(value);
    },
    [
      pathname,
      setDashboardQuery,
      setTransferSearch,
      setDispatchSearch,
      setInventorySearch,
      setRequisitionSearch,
      setFleetSearch,
      setDriverSearch,
      setOrdersSearch,
    ],
  );

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    syncPageFilters(query);

    if (trimmed.length < 2) {
      setGroups([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    const timer = window.setTimeout(async () => {
      try {
        const data = await searchService.searchHub(trimmed);
        if (cancelled) return;
        setGroups(data.groups ?? []);
        setActiveIndex(data.results?.length ? 0 : -1);
        setOpen(true);
      } catch {
        if (cancelled) return;
        setGroups([]);
        setError("Unable to search hub data.");
        setOpen(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, syncPageFilters]);

  const navigateToHit = (hit: HubSearchHit) => {
    setOpen(false);
    setQuery("");
    syncPageFilters("");

    // Apply destination page filter when href carries ?search=
    try {
      const url = new URL(hit.href, window.location.origin);
      const searchParam = url.searchParams.get("search");
      if (searchParam) {
        if (url.pathname.startsWith("/inventory"))
          setInventorySearch(searchParam);
        if (url.pathname.startsWith("/fleet")) setFleetSearch(searchParam);
        if (url.pathname.startsWith("/drivers")) setDriverSearch(searchParam);
        if (url.pathname.startsWith("/dispatch"))
          setDispatchSearch(searchParam);
      }
    } catch {
      /* ignore URL parse issues */
    }

    router.push(hit.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      if (query.trim().length >= 2) setOpen(true);
    }

    if (e.key === "Escape") {
      setOpen(false);
      return;
    }

    if (!flatResults.length) {
      if (e.key === "Enter" && query.trim().length >= 2) {
        // Fallback: go to orders list with search
        setOpen(false);
        setOrdersSearch(query.trim());
        router.push(`/orders?search=${encodeURIComponent(query.trim())}`);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? flatResults.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = flatResults[activeIndex] ?? flatResults[0];
      if (hit) navigateToHit(hit);
    }
  };

  const showDropdown =
    open &&
    (loading || error || query.trim().length >= 2);

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-xl", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (query.trim().length >= 2) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#FF6B00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
      />
      {loading ? (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#FF6B00]" />
      ) : null}

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[420px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {loading && !groups.length ? (
            <p className="px-4 py-6 text-center text-sm text-gray-400">
              Searching hub data…
            </p>
          ) : error ? (
            <p className="px-4 py-6 text-center text-sm text-red-500">{error}</p>
          ) : !groups.length ? (
            <p className="px-4 py-6 text-center text-sm text-gray-400">
              No matches for “{query.trim()}” in this hub
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.type} className="border-b border-gray-100 last:border-0">
                <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {group.label}
                  </p>
                  {group.total > group.items.length ? (
                    <span className="text-[10px] text-gray-400">
                      {group.items.length} of {group.total}
                    </span>
                  ) : null}
                </div>
                <ul>
                  {group.items.map((hit) => {
                    const flatIdx = flatResults.findIndex(
                      (r) => r.id === hit.id && r.type === hit.type,
                    );
                    const Icon = TYPE_ICON[hit.type] ?? Search;
                    const isActive = flatIdx === activeIndex;
                    return (
                      <li key={`${hit.type}-${hit.id}`}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveIndex(flatIdx)}
                          onClick={() => navigateToHit(hit)}
                          className={cn(
                            "flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors",
                            isActive ? "bg-orange-50" : "hover:bg-gray-50",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                              isActive
                                ? "bg-[#FF6B00]/15 text-[#FF6B00]"
                                : "bg-gray-100 text-gray-500",
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-gray-900">
                              {hit.title}
                            </span>
                            {hit.subtitle ? (
                              <span className="mt-0.5 block truncate text-xs text-gray-500">
                                {hit.subtitle}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
