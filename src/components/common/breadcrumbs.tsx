"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-sm", className)}>
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
          {item.href && !item.active ? (
            <Link
              href={item.href}
              className="text-gray-500 transition-colors hover:text-gray-900"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                item.active ? "font-medium text-[#FF6B00]" : "text-gray-500"
              )}
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
