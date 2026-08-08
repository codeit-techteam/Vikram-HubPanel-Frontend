import type { QuickOperation } from "@/types";

/** Static nav shortcuts for the dashboard Quick Operations panel. */
export const QUICK_OPERATIONS: QuickOperation[] = [
  {
    id: "create-dispatch",
    label: "Create Dispatch",
    icon: "truck",
    href: "/dispatch",
  },
  {
    id: "view-inventory",
    label: "View Inventory",
    icon: "layout-grid",
    href: "/inventory",
  },
  {
    id: "raise-request",
    label: "Raise Request",
    icon: "user-plus",
    href: "/requisitions/create",
  },
  {
    id: "receive-material",
    label: "Receive Material",
    icon: "package-check",
    href: "/transfers",
  },
];
