export interface HubManager {
  id: string;
  name: string;
  fullName: string;
  employeeId: string;
  email?: string | null;
  mobile?: string | null;
  phone?: string | null;
  role: string;
  hubId: string;
  hubName?: string;
  /** Allocated at hub creation (Hub.code) — shown in sidebar badge */
  hubCode?: string;
  warehouseCode?: string | null;
  lastLoginAt?: string | null;
}

export interface HubAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface HubLoginResponse extends HubAuthTokens {
  manager: HubManager;
}
