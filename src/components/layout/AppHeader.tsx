"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  Download,
  LogOut,
  Menu,
  Truck,
  UserRound,
} from "lucide-react";
import { SearchBar } from "@/components/layout/SearchBar";
import {
  useAuthStore,
  useSidebarStore,
  useUserStore,
  useNotificationStore,
} from "@/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleCollapsed, setMobileOpen } = useSidebarStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const {
    notifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();
  const [notifOpen, setNotifOpen] = useState(false);

  const isInventoryPage =
    pathname === "/inventory" || pathname.startsWith("/inventory/");

  useEffect(() => {
    void loadNotifications();
    const id = window.setInterval(() => {
      void loadNotifications();
    }, 30_000);
    return () => window.clearInterval(id);
  }, [loadNotifications]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

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

      <div className="relative flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-gray-500 hover:text-gray-900"
          aria-label="Notifications"
          onClick={() => {
            setNotifOpen((open) => !open);
            void loadNotifications();
          }}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>

        {notifOpen ? (
          <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="text-xs font-medium text-[#FF6B00]"
                  onClick={() => void markAllAsRead()}
                >
                  Mark all read
                </button>
              ) : null}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-400">
                  No notifications yet
                </p>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={`block w-full border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50 ${
                      n.read ? "opacity-70" : ""
                    }`}
                    onClick={() => {
                      void markAsRead(n.id);
                      if (n.actionRoute) {
                        window.location.href = n.actionRoute;
                      }
                    }}
                  >
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                      {n.message}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
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
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="border-b border-gray-100 px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-gray-900">
                {currentUser.name}
              </p>
              <p className="truncate text-xs text-gray-500">{currentUser.role}</p>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <UserRound className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={() => void handleLogout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
