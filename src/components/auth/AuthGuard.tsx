"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { canAccessHubPath } from "@/constants/hub-rbac";
import { useAuthStore } from "@/store/authStore";
import { clearStoredTokens } from "@/services/auth.service";
import { clearAuthCookies } from "@/utils/auth-cookies";

const PUBLIC_PATHS = ["/login"];

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) return;

    if (!isAuthenticated) {
      // Clear stale cookies so middleware cannot bounce us back to /dashboard
      clearStoredTokens();
      clearAuthCookies();
      window.location.replace(
        `/login?callbackUrl=${encodeURIComponent(pathname)}`,
      );
      return;
    }

    const role = user?.role ?? "HUB_MANAGER";
    if (!canAccessHubPath(role, pathname)) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, router, user?.role]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  if (
    !PUBLIC_PATHS.some((path) => pathname.startsWith(path)) &&
    !isAuthenticated
  ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
        <p className="text-sm text-gray-500">Redirecting to login…</p>
      </div>
    );
  }

  return children;
}
