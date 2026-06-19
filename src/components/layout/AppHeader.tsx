"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  Download,
  HelpCircle,
  Menu,
  Printer,
  Truck,
} from "lucide-react";
import { SearchBar } from "@/components/layout/SearchBar";
import { useSidebarStore, useUserStore, useLedgerStore } from "@/store";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const pathname = usePathname();
  const { toggleCollapsed, setMobileOpen } = useSidebarStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const { exportLedger, openPrint } = useLedgerStore();
  const isInventoryPage =
    pathname === "/inventory" || pathname.startsWith("/inventory/");
  const isLedgerPage =
    pathname === "/ledger" || pathname.startsWith("/ledger/");

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="hidden shrink-0 md:flex"
        onClick={toggleCollapsed}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex min-w-0 flex-1 justify-center md:justify-start">
        <SearchBar />
      </div>

      {isLedgerPage && (
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            variant="outline"
            className="gap-2 border-gray-200 bg-white"
            onClick={exportLedger}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-gray-200 bg-white"
            onClick={openPrint}
          >
            <Printer className="h-4 w-4" />
            Print Ledger
          </Button>
        </div>
      )}

      {isInventoryPage && (
        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="outline" className="gap-2 border-gray-200 bg-white">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              asChild
              className="gap-2 bg-[#FF6B00] hover:bg-[#E55F00]"
            >
              <Link href="/dispatch">
                <Truck className="h-4 w-4" />
                Dispatch Truck
              </Link>
            </Button>
          </motion.div>
        </div>
      )}

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-500 hover:text-gray-900"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-500 hover:text-gray-900"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 overflow-hidden rounded-full p-0"
          aria-label="Profile"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF6B00] text-xs font-bold text-white">
            {currentUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
        </Button>
      </div>
    </header>
  );
}
