"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserStore } from "@/store";

export function UserProfileCard() {
  const currentUser = useUserStore((state) => state.currentUser);

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
      <Link
        href="/settings"
        className="shrink-0 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
        aria-label="Open profile"
      >
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-[#FF6B00] text-sm font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>
      <Link href="/settings" className="min-w-0 flex-1 outline-none">
        <p className="truncate text-sm font-semibold text-gray-900 hover:text-[#FF6B00]">
          {currentUser.name}
        </p>
        <p className="truncate text-xs text-gray-500">{currentUser.role}</p>
      </Link>
      <Link
        href="/settings"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
        aria-label="Profile settings"
      >
        <Settings className="h-4 w-4" />
      </Link>
    </div>
  );
}
