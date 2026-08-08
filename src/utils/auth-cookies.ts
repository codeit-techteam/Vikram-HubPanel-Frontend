export const setAuthCookies = (
  accessToken: string,
  refreshToken: string,
  role?: string,
) => {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `hub_access_token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `hub_refresh_token=${refreshToken}; path=/; max-age=${maxAge * 4}; SameSite=Lax`;
  if (role) {
    document.cookie = `hub_user_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
};

export const clearAuthCookies = () => {
  if (typeof document === "undefined") return;
  document.cookie = "hub_access_token=; path=/; max-age=0";
  document.cookie = "hub_refresh_token=; path=/; max-age=0";
  document.cookie = "hub_user_role=; path=/; max-age=0";
};
