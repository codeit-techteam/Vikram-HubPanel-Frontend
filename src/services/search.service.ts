import api from "./axios";
import type { ApiResponse } from "@/types/api";

export type HubSearchHitType =
  | "orders"
  | "inventory"
  | "products"
  | "drivers"
  | "vehicles"
  | "dispatches"
  | "requisitions";

export interface HubSearchHit {
  id: string;
  type: HubSearchHitType;
  title: string;
  subtitle: string;
  href: string;
  meta?: Record<string, string | number | null | undefined>;
}

export interface HubSearchGroup {
  type: HubSearchHitType;
  label: string;
  items: HubSearchHit[];
  total: number;
}

export interface HubSearchResult {
  query: string;
  results: HubSearchHit[];
  groups: HubSearchGroup[];
  meta: { total: number; shown: number };
}

export const searchService = {
  async searchHub(q: string): Promise<HubSearchResult> {
    const trimmed = q.trim();
    if (!trimmed) {
      return { query: "", results: [], groups: [], meta: { total: 0, shown: 0 } };
    }

    const { data } = await api.get<ApiResponse<HubSearchResult>>("/hub/search", {
      params: { type: "all", q: trimmed, limit: 5 },
    });

    return (
      data.data ?? {
        query: trimmed,
        results: [],
        groups: [],
        meta: { total: 0, shown: 0 },
      }
    );
  },
};
