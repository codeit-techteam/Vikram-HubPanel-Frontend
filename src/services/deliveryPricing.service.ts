/**
 * Hub reads central delivery pricing from the backend.
 * Do not maintain a separate Hub price table.
 * Historical orders keep deliveryCharge snapshot on the order record.
 */

export type HubDeliveryVehicleType =
  | "BIKE"
  | "E_LOADER"
  | "THREE_WHEELER_LOADER"
  | "PICK_UP_VAN"
  | "FULL_TRUCK";

export interface HubDeliveryPricingRule {
  id: string;
  vehicleType: HubDeliveryVehicleType;
  vehicleDisplayName: string;
  distanceFromKm: number;
  distanceToKm: number;
  distanceSlab: string;
  price: number;
  currency: string;
  status: "ACTIVE" | "INACTIVE";
  version: number;
}

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

function resolveApiBase(): string {
  const configured =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
    "/backend-api/v1";
  if (configured.startsWith("http")) return configured;
  // Rewrites only apply to browser→Next; server fetch must hit upstream directly.
  if (typeof window === "undefined") {
    const target =
      process.env.API_PROXY_TARGET ??
      "https://bajriwala-backend-zkuxd.ondigitalocean.app";
    return `${target.replace(/\/$/, "")}/api/v1`;
  }
  return configured;
}

async function hubFetch<T>(path: string, token: string): Promise<T> {
  const base = resolveApiBase();
  const res = await fetch(`${base}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load delivery pricing (${res.status})`);
  }
  const json = (await res.json()) as ApiEnvelope<T>;
  return json.data;
}

export async function fetchHubDeliveryPricing(
  token: string,
): Promise<HubDeliveryPricingRule[]> {
  return hubFetch<HubDeliveryPricingRule[]>("/hub/delivery-pricing", token);
}
