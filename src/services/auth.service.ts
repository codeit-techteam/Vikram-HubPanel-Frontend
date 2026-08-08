import { env } from "@/config/env";
import api from "@/services/axios";
import type { ApiResponse } from "@/types/api";
import type { HubLoginResponse, HubManager } from "@/types/auth";

export const authService = {
  login: async (
    employeeId: string,
    password: string,
  ): Promise<HubLoginResponse> => {
    const { data } = await api.post<ApiResponse<HubLoginResponse>>(
      "/hub/auth/login",
      { employeeId, password },
    );
    return data.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/hub/auth/logout", { refreshToken });
  },

  getMe: async (): Promise<HubManager> => {
    const { data } = await api.get<ApiResponse<HubManager>>("/hub/auth/me");
    return data.data;
  },

  refreshToken: async (
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    const { data } = await api.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >("/hub/auth/refresh", { refreshToken });
    return data.data;
  },

  forgotPassword: async (employeeId: string): Promise<void> => {
    await api.post("/hub/auth/forgot-password", { employeeId });
  },
};

export const getStoredAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(env.authTokenKey);
};

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(env.authRefreshTokenKey);
};

export const setStoredTokens = (
  accessToken: string,
  refreshToken: string,
): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(env.authTokenKey, accessToken);
  localStorage.setItem(env.authRefreshTokenKey, refreshToken);
};

export const clearStoredTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(env.authTokenKey);
  localStorage.removeItem(env.authRefreshTokenKey);
};
