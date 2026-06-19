import { create } from "zustand";
import { erpDatabase } from "@/services/erpDatabase";

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

interface UserState {
  currentUser: HubUser;
  setCurrentUser: (user: HubUser) => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: erpDatabase.getCurrentUser() as HubUser,
  setCurrentUser: (currentUser) => set({ currentUser }),
}));
