const getEnv = (key: string, fallback = ""): string => {
  const value = process.env[key];
  return value ?? fallback;
};

export const env = {
  appName: getEnv("NEXT_PUBLIC_APP_NAME", "HubOps Central"),
  apiBaseUrl: getEnv(
    "NEXT_PUBLIC_API_BASE_URL",
    "http://localhost:8000/api/v1",
  ),
  authTokenKey: getEnv("NEXT_PUBLIC_AUTH_TOKEN_KEY", "hub_access_token"),
  authRefreshTokenKey: getEnv(
    "NEXT_PUBLIC_AUTH_REFRESH_TOKEN_KEY",
    "hub_refresh_token",
  ),
} as const;
