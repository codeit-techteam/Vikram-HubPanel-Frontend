import type { ApiFilters, Hub, PaginatedResponse } from "@/types";
import api from "./axios";
import type { ApiResponse } from "@/types/api";
import { authService } from "./auth.service";

interface BackendHubProfile {
  id: string;
  code: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode?: string;
  phone?: string | null;
  email?: string | null;
  capacity?: number | null;
  isActive?: boolean;
  status?: string;
  createdAt?: string;
  warehouseCode?: string | null;
}

function mapHub(
  profile: BackendHubProfile,
  managerName?: string,
): Hub {
  const capacity = profile.capacity ?? 0;
  return {
    id: profile.id,
    name: profile.name,
    code: profile.code,
    location: [profile.addressLine1, profile.city, profile.state]
      .filter(Boolean)
      .join(", "),
    city: profile.city,
    state: profile.state,
    manager: managerName || "—",
    capacity,
    utilization: 0,
    status:
      profile.isActive === false || profile.status === "INACTIVE"
        ? "inactive"
        : "active",
    warehouseCount: profile.warehouseCode ? 1 : 0,
    createdAt: profile.createdAt ?? new Date().toISOString(),
  };
}

export const hubService = {
  /**
   * Hub Panel is scoped to the logged-in manager's hub (JWT hubId).
   * Returns the assigned hub from `/hub/profile` — not a multi-hub directory.
   */
  async getAll(filters?: ApiFilters): Promise<PaginatedResponse<Hub>> {
    const [profileRes, me] = await Promise.all([
      api.get<ApiResponse<BackendHubProfile>>("/hub/profile"),
      authService.getMe().catch(() => null),
    ]);

    const hub = mapHub(
      profileRes.data.data,
      me?.fullName || me?.name,
    );

    let data = [hub];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      data = data.filter(
        (h) =>
          h.name.toLowerCase().includes(search) ||
          h.code.toLowerCase().includes(search) ||
          h.city.toLowerCase().includes(search),
      );
    }

    if (filters?.status) {
      data = data.filter((h) => h.status === filters.status);
    }

    return {
      data,
      total: data.length,
      page: 1,
      pageSize: data.length || 1,
      totalPages: 1,
    };
  },

  async getById(id: string): Promise<Hub | undefined> {
    const result = await this.getAll();
    return result.data.find((h) => h.id === id);
  },

  async getAssignedHub(): Promise<Hub> {
    const result = await this.getAll();
    if (!result.data[0]) throw new Error("Assigned hub not found");
    return result.data[0];
  },

  async create(_hub: Partial<Hub>): Promise<Hub> {
    void _hub;
    throw new Error(
      "Hub provisioning is managed by Central Admin — not available in Hub Panel.",
    );
  },

  async update(_id: string, _hub: Partial<Hub>): Promise<Hub> {
    void _id;
    void _hub;
    throw new Error(
      "Hub master data is managed by Central Admin — update your contact details in Settings.",
    );
  },
};
