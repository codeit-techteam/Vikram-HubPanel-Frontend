"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useSidebarStore } from "@/store";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={null}>
        <AppSidebar />
      </Suspense>
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          isCollapsed ? "md:pl-[72px]" : "md:pl-[280px]"
        )}
      >
        <AppHeader />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-4 md:p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
