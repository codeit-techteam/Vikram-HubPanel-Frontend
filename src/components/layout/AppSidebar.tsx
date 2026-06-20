"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronDown,
  CircleHelp,
  LogOut,
  Plus,
  X,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { NAV_ITEMS } from "@/constants/navigation";
import { useAuthStore, useInventoryStore, useSidebarStore } from "@/store";
import { useUserStore } from "@/store/userStore";
import { UserProfileCard } from "@/components/layout/UserProfileCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isCollapsed, isMobileOpen, toggleCollapsed, setMobileOpen } =
    useSidebarStore();
  const logout = useAuthStore((state) => state.logout);
  const openAddMaterialModal = useInventoryStore((state) => state.openAddModal);
  const terminal = useUserStore((state) => state.currentUser.terminal);

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "/orders": true,
  });
  const activeNavRef = useRef<HTMLAnchorElement | null>(null);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const isOrdersSection =
    pathname === "/orders" || pathname.startsWith("/orders/");

  const toggleMenu = (href: string) => {
    setExpandedMenus((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  useLayoutEffect(() => {
    activeNavRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [pathname, searchParams.toString()]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    router.push("/login");
  };

  const sidebarContent = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-gray-200 px-5 py-5">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold text-[#FF6B00]">HubOps</span>
              <span className="text-lg font-semibold text-gray-900">
                {" "}
                Central
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() =>
              isMobileOpen ? setMobileOpen(false) : toggleCollapsed()
            }
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isCollapsed && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#FF6B00] text-sm font-bold text-white">
              {terminal.code}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {terminal.location}
              </p>
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-gray-400">
                {terminal.darkStore}
              </p>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="min-h-0 flex-1 px-3 py-4">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item, index) => {
            const showSectionLabel =
              item.section === "Operations" &&
              (index === 0 || NAV_ITEMS[index - 1]?.section !== "Operations");
            const active = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded =
              expandedMenus[item.href] ?? (item.href === "/orders" && isOrdersSection);

            if (hasChildren && !isCollapsed) {
              return (
                <div key={item.href}>
                  {showSectionLabel && (
                    <p className="mb-2 mt-4 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 first:mt-0">
                      Operations
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active || isOrdersSection
                        ? "bg-[#FF6B00] text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-orange-100 pl-3">
                      {item.children!.map((child) => {
                        const childHref = child.tab
                          ? `${child.href}?tab=${child.tab}`
                          : child.href;
                        const childActive =
                          child.href === "/orders/create"
                            ? pathname === "/orders/create"
                            : pathname === "/orders" &&
                              (child.tab
                                ? searchParams.get("tab") === child.tab ||
                                  (!searchParams.get("tab") &&
                                    child.tab === undefined)
                                : !searchParams.get("tab"));

                        return (
                          <Link
                            key={child.title}
                            ref={childActive ? activeNavRef : undefined}
                            href={childHref}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm transition-colors",
                              childActive
                                ? "bg-orange-50 font-semibold text-[#FF6B00]"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                          >
                            {child.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={item.href}>
                {showSectionLabel && !isCollapsed && (
                  <p className="mb-2 mt-4 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Operations
                  </p>
                )}
                <Link
                  ref={active ? activeNavRef : undefined}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#FF6B00] text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="space-y-3 border-t border-gray-200 p-4">
        {!isCollapsed ? (
          <>
            {pathname === "/inventory" || pathname.startsWith("/inventory/") ? (
              <button
                type="button"
                onClick={() => {
                  openAddMaterialModal();
                  setMobileOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E55F00]"
              >
                <Plus className="h-4 w-4" />
                Add Materials
              </button>
            ) : pathname === "/requisitions" ||
              pathname.startsWith("/requisitions/") ? (
              <Link
                href="/requisitions/create"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E55F00]"
              >
                <Plus className="h-4 w-4" />
                New Request
              </Link>
            ) : pathname === "/orders" || pathname.startsWith("/orders/") ? (
              <Link
                href="/orders/create"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E55F00]"
              >
                <Plus className="h-4 w-4" />
                New Request
              </Link>
            ) : pathname === "/dispatch" ||
              pathname.startsWith("/dispatch/") ? (
              <Link
                href="/dispatch"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E55F00]"
              >
                <Plus className="h-4 w-4" />
                Plan Dispatch
              </Link>
            ) : (
              <Link
                href="/dispatch"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E55F00]"
              >
                <Plus className="h-4 w-4" />
                New Dispatch
              </Link>
            )}
            <UserProfileCard />
            <Link
              href="#"
              className="flex items-center gap-2 px-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              <CircleHelp className="h-4 w-4" />
              Support
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-1 text-sm text-red-500 transition-colors hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-lg p-2 text-red-500 hover:bg-red-50"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 72 : 280,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
