import {
  ArrowLeftRight,
  BookOpen,
  Boxes,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  Package,
  Send,
  Truck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavSubItem {
  title: string;
  href: string;
  tab?: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: NavSubItem[];
  section?: string;
}

export const NAV_SECTIONS = [
  { label: undefined },
  { label: "Operations" },
  { label: undefined },
] as const;

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Inventory", href: "/inventory", icon: Boxes },
  { title: "Requisitions", href: "/requisitions", icon: ClipboardList },
  { title: "Transfers", href: "/transfers", icon: ArrowLeftRight },
  {
    title: "Orders",
    href: "/orders",
    icon: Package,
    children: [
      { title: "All Orders", href: "/orders" },
      { title: "Active Orders", href: "/orders", tab: "active" },
      { title: "Completed Orders", href: "/orders", tab: "completed" },
      { title: "New Request", href: "/orders/create" },
    ],
  },
  {
    title: "Dispatch Planning",
    href: "/dispatch",
    icon: Send,
    section: "Operations",
  },
  {
    title: "Fleet Management",
    href: "/fleet",
    icon: Truck,
    section: "Operations",
  },
  {
    title: "Driver Management",
    href: "/drivers",
    icon: Users,
    section: "Operations",
  },
  { title: "Ledger", href: "/ledger", icon: BookOpen },
  { title: "Reports", href: "/reports", icon: FileBarChart },
];

export const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  inventory: "Inventory",
  requisitions: "Requisitions",
  "[requestId]": "Requisition Details",
  create: "New Requisition",
  transfers: "Transfers",
  "[transferId]": "Transfer Details",
  orders: "Orders",
  "[id]": "Order Details",
  dispatch: "Dispatch Planning",
  "[dispatchId]": "Dispatch Details",
  tracking: "Delivery Tracking",
  complete: "Delivery Confirmation",
  fleet: "Fleet Management",
  drivers: "Driver Management",
  ledger: "Ledger",
  reports: "Reports",
  "material-receiving": "Material Receiving",
  "incoming-material": "Incoming Material",
  settings: "Settings",
};
