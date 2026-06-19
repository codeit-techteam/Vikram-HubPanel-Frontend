import type { ApiFilters, Hub, PaginatedResponse } from "@/types";
import { delay } from "@/lib/utils";
import hubsData from "@/mock/hubs.json";

export const hubService = {
  async getAll(filters?: ApiFilters): Promise<PaginatedResponse<Hub>> {
    await delay(300);
    let data = [...hubsData] as Hub[];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      data = data.filter(
        (h) =>
          h.name.toLowerCase().includes(search) ||
          h.code.toLowerCase().includes(search) ||
          h.city.toLowerCase().includes(search)
      );
    }

    if (filters?.status) {
      data = data.filter((h) => h.status === filters.status);
    }

    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    const paginated = data.slice(start, start + pageSize);

    return {
      data: paginated,
      total: data.length,
      page,
      pageSize,
      totalPages: Math.ceil(data.length / pageSize),
    };
  },

  async getById(id: string): Promise<Hub | undefined> {
    await delay(200);
    return (hubsData as Hub[]).find((h) => h.id === id);
  },

  // Placeholder for future API integration
  async create(_hub: Partial<Hub>): Promise<Hub> {
    await delay(500);
    throw new Error("API not implemented - use mock data");
  },

  async update(_id: string, _hub: Partial<Hub>): Promise<Hub> {
    await delay(500);
    throw new Error("API not implemented - use mock data");
  },
};
