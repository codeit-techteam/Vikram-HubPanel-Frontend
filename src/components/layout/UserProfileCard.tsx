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
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-[#FF6B00] text-sm font-semibold text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">
          {currentUser.name}
        </p>
        <p className="truncate text-xs text-gray-500">{currentUser.role}</p>
      </div>
      <Link
        href="/settings"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </Link>
    </div>
  );
}
