import { create } from "zustand";
import type { HubManager } from "@/types/auth";

export interface Terminal {
  code: string;
  location: string;
  darkStore: string;
}

export interface HubUser {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
  avatar: string | null;
  terminal: Terminal;
}

const defaultTerminal: Terminal = {
  code: "—",
  location: "Hub Terminal",
  darkStore: "Dark Store",
};

const defaultUser: HubUser = {
  id: "",
  name: "Hub Manager",
  email: "",
  role: "HUB_MANAGER",
  employeeId: "",
  avatar: null,
  terminal: defaultTerminal,
};

/** Prefer allocated hub code; never derive from UUID hubId. */
function resolveHubBadgeCode(manager: HubManager): string {
  const allocated = manager.hubCode?.trim();
  if (allocated) return allocated.toUpperCase();
  return "—";
}

function buildTerminalFromManager(manager: HubManager): Terminal {
  const hubLabel = manager.hubName?.trim() || "Assigned Hub";
  const hubCode = resolveHubBadgeCode(manager);
  const warehouse = manager.warehouseCode?.trim();

  return {
    code: hubCode,
    location: hubLabel,
    darkStore: warehouse
      ? `DARK STORE · ${warehouse.toUpperCase()}`
      : hubCode !== "—"
        ? `HUB ${hubCode}`
        : "DARK STORE",
  };
}

export function mapManagerToHubUser(manager: HubManager): HubUser {
  const initials = manager.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: manager.id,
    name: manager.name,
    email: manager.email ?? "",
    role: manager.role,
    employeeId: manager.employeeId,
    avatar: initials || null,
    terminal: buildTerminalFromManager(manager),
  };
}

interface UserState {
  currentUser: HubUser;
  setCurrentUser: (user: HubUser) => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: defaultUser,
  setCurrentUser: (currentUser) => set({ currentUser }),
}));

export function syncUserFromManager(manager: HubManager): void {
  useUserStore.getState().setCurrentUser(mapManagerToHubUser(manager));
}
