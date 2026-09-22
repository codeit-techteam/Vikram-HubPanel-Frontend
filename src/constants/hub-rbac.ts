/** Hub panel route → permission mapping (aligned with backend HUB_ROLE_PERMISSIONS) */

export const HUB_PERMISSIONS = {
  DASHBOARD: "dashboard",
  ORDERS: "orders",
  INVENTORY: "inventory",
  PRODUCTS: "products",
  DISPATCH: "dispatch",
  DRIVERS: "drivers",
  VEHICLES: "vehicles",
  LOADING: "loading",
  REPORTS: "reports",
  PROFILE: "profile",
} as const;

export type HubPermission = (typeof HUB_PERMISSIONS)[keyof typeof HUB_PERMISSIONS];

export const HUB_ROLE_PERMISSIONS: Record<string, string[]> = {
  HUB_MANAGER: ["*"],
  HUB_OPERATOR: ["dashboard", "profile", "orders", "timeline", "search", "notifications", "reports"],
  WAREHOUSE_MANAGER: ["dashboard", "profile", "inventory", "products", "loading", "unloading", "search", "notifications", "reports"],
  INVENTORY_STAFF: ["inventory", "products", "search", "notifications"],
  DISPATCH_MANAGER: ["dashboard", "dispatch", "drivers", "vehicles", "assignments", "orders", "search", "notifications", "reports"],
  LOADING_SUPERVISOR: ["loading", "unloading", "orders", "assignments"],
  DELIVERY_SUPERVISOR: ["dispatch", "orders", "pod", "assignments"],
  WAREHOUSE_STAFF: ["inventory", "loading"],
  LOADING_STAFF: ["loading", "unloading"],
  DISPATCH_STAFF: ["dispatch", "drivers", "vehicles", "assignments"],
  DRIVER: ["orders.read", "dispatch.read"],
};

export const HUB_ROUTE_PERMISSIONS: Record<string, HubPermission | HubPermission[]> = {
  "/dashboard": HUB_PERMISSIONS.DASHBOARD,
  "/orders": HUB_PERMISSIONS.ORDERS,
  "/delivery-schedule": HUB_PERMISSIONS.ORDERS,
  "/inventory": HUB_PERMISSIONS.INVENTORY,
  "/requisitions": HUB_PERMISSIONS.INVENTORY,
  "/transfers": HUB_PERMISSIONS.INVENTORY,
  "/dispatch": HUB_PERMISSIONS.DISPATCH,
  "/fleet": HUB_PERMISSIONS.VEHICLES,
  "/drivers": HUB_PERMISSIONS.DRIVERS,
  "/reports": HUB_PERMISSIONS.REPORTS,
  "/analytics": HUB_PERMISSIONS.REPORTS,
  "/settings": HUB_PERMISSIONS.PROFILE,
};

export function hubHasPermission(role: string, permission: string): boolean {
  const perms = HUB_ROLE_PERMISSIONS[role] ?? [];
  if (perms.includes("*")) return true;
  return perms.includes(permission);
}

export function canAccessHubPath(role: string, pathname: string): boolean {
  const rule = Object.entries(HUB_ROUTE_PERMISSIONS).find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!rule) return true;
  const required = Array.isArray(rule[1]) ? rule[1] : [rule[1]];
  return required.some((perm) => hubHasPermission(role, perm));
}
