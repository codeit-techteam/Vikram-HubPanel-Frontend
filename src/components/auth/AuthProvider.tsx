"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

const HYDRATE_TIMEOUT_MS = 8_000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      void useAuthStore.getState().hydrateSession();
    };

    // Cover both cases: hydration already done, or still pending.
    const unsub = useAuthStore.persist.onFinishHydration(finish);
    if (useAuthStore.persist.hasHydrated()) {
      finish();
    }

    // Never leave the UI on an infinite spinner if /me or refresh hangs.
    const timeout = window.setTimeout(() => {
      if (cancelled) return;
      const { isLoading } = useAuthStore.getState();
      if (isLoading) {
        useAuthStore.setState({ isLoading: false });
      }
    }, HYDRATE_TIMEOUT_MS);

    return () => {
      cancelled = true;
      unsub();
      window.clearTimeout(timeout);
    };
  }, []);

  return children;
}
