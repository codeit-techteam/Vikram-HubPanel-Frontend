import type {
  ApiFilters,
  CreateDispatchPayload,
  Dispatch,
  HubOrder,
  OrderFilterTab,
  OrderMaterial,
  OrderStatus,
  OrderSummaryData,
  OrderTimelineEvent,
  PaginatedResponse,
} from "@/types";
import api from "./axios";
import type { ApiResponse } from "@/types/api";
import { HUB_OPERATION_ACTIVE_STATUSES } from "@/constants/operationStatus";

export const ORDER_ACTIVE_STATUSES: HubOrder["status"][] =
  HUB_OPERATION_ACTIVE_STATUSES;

/** Delivered + cancelled (mapped to delivered UI bucket). */
export const ORDER_COMPLETED_STATUSES: HubOrder["status"][] = ["delivered"];

/** Status aliases accepted by PATCH /hub/orders/:id/status */
export type HubStatusAlias =
  | "AcceptedByHub"
  | "Picking"
  | "Packed"
  | "DriverAssigned"
  | "OutForDelivery"
  | "Delivered"
  | "Cancelled";

type BackendOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "HUB_ASSIGNED"
  | "AWAITING_HUB_ALLOCATION"
  | "ACCEPTED_BY_HUB"
  | "PROCESSING"
  | "PICKING"
  | "PACKED"
  | "READY_FOR_DISPATCH"
  | "DRIVER_ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

interface BackendOrderListItem {
  id: string;
  orderNumber: string;
  orderStatus: BackendOrderStatus;
  statusLabel?: string;
  grandTotal: number | string;
  createdAt: string;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  expectedDeliveryAt?: string | null;
  deliveryAddress?: {
    city?: string;
    line1?: string;
    pincode?: string;
  } | null;
  customer?: { id: string; fullName: string; phone: string } | null;
  _count?: { items: number };
  assignedDriver?: { id: string; name: string; phone: string } | null;
  assignedVehicle?: { id: string; registration: string } | null;
}

interface BackendOrderDetail extends BackendOrderListItem {
  items?: Array<{
    id: string;
    productId: string;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number | string;
    subtotal: number | string;
  }>;
  timeline?: Array<{
    id: string;
    status: string;
    statusLabel?: string;
    message?: string;
    remarks?: string | null;
    createdAt: string;
    updatedBy?: string;
  }>;
  paymentStatus?: string;
  paymentMethod?: string;
  dispatchedAt?: string | null;
  deliveredAt?: string | null;
  driverReachedAt?: string | null;
  deliveryOtpGenerated?: boolean;
  deliveryOtpGeneratedAt?: string | null;
  deliveryOtpVerified?: boolean;
  deliveryVerifiedBy?: string | null;
  deliveryCompletedAt?: string | null;
  paymentCollectedAt?: string | null;
  deliveryVerificationLink?: string;
  driver?: { id: string; name: string; phone?: string } | null;
  vehicle?: { id: string; registration: string } | null;
  assignedDriver?: { id: string; name: string; phone: string } | null;
  assignedVehicle?: { id: string; registration: string } | null;
  deliveryCharge?: number | string | null;
  deliveryVehicleType?: string | null;
  deliveryVehicleCount?: number | null;
  deliveryDistanceKm?: number | string | null;
  deliveryTotalWeightKg?: number | string | null;
  deliveryTotalVolumeCft?: number | string | null;
  deliveryCapacityUsed?: number | string | null;
  deliveryCapacityLimit?: number | string | null;
  freeDeliveryApplied?: boolean;
  deliveryMultiVehicle?: boolean;
  dispatchHistory?: Array<{
    dispatchNo: string;
    status: string;
    vehicle: string;
    driver: string;
    dispatchedAt?: string | null;
    reachedAt?: string | null;
    deliveredAt?: string | null;
    deliveryOtpVerified?: boolean;
  }>;
}

const DELIVERY_VEHICLE_LABELS: Record<string, string> = {
  BIKE: "Bike",
  E_LOADER: "E-Loader",
  THREE_WHEELER_LOADER: "3 Wheeler Loader",
  PICK_UP_VAN: "Pick Up Van",
  FULL_TRUCK: "Full Truck",
};

const PENDING_BACKEND: BackendOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "HUB_ASSIGNED",
  "AWAITING_HUB_ALLOCATION",
];

const LOADING_BACKEND: BackendOrderStatus[] = [
  "ACCEPTED_BY_HUB",
  "PROCESSING",
  "PICKING",
  "PACKED",
  "READY_FOR_DISPATCH",
  "DRIVER_ASSIGNED",
];

const DISPATCH_BACKEND: BackendOrderStatus[] = [
  "OUT_FOR_DELIVERY",
  "DISPATCHED",
];

function mapStatus(status: BackendOrderStatus | string): OrderStatus {
  const value = String(status).toUpperCase() as BackendOrderStatus;
  if (DISPATCH_BACKEND.includes(value)) return "dispatch";
  if (value === "DELIVERED" || value === "CANCELLED") return "delivered";
  if (LOADING_BACKEND.includes(value)) return "loading";
  if (PENDING_BACKEND.includes(value)) return "pending";
  return "pending";
}

function mapFilterToBackend(filter?: OrderFilterTab | string) {
  if (!filter || filter === "all") return undefined;
  if (filter === "active") return "pending";
  if (filter === "completed") return undefined;
  return filter;
}

function mapMaterials(
  items: BackendOrderDetail["items"] = [],
): OrderMaterial[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    sku: item.productId.slice(0, 8),
    quantity: item.quantity,
    unit: item.unit,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.subtotal),
  }));
}

function mapTimeline(
  timeline: BackendOrderDetail["timeline"] = [],
  orderStatus?: string,
): OrderTimelineEvent[] {
  const delivered = String(orderStatus || "").toUpperCase() === "DELIVERED";
  return timeline.map((entry, index) => {
    const isLast = index === timeline.length - 1;
    return {
      id: entry.id || `tl-${index}`,
      title:
        entry.message ||
        entry.statusLabel ||
        entry.remarks ||
        entry.status,
      timestamp: new Date(entry.createdAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status:
        delivered || !isLast
          ? ("completed" as const)
          : ("active" as const),
    };
  });
}

function mapOrder(order: BackendOrderDetail): HubOrder {
  const address = order.deliveryAddress;
  const location =
    [address?.line1, address?.city, address?.pincode].filter(Boolean).join(", ") ||
    "Delivery site";

  const driverName =
    order.driver?.name || order.assignedDriver?.name || undefined;
  const vehicleNumber =
    order.vehicle?.registration ||
    order.assignedVehicle?.registration ||
    undefined;

  const paymentStatus = order.paymentStatus || "pending";
  const isDelivered =
    String(order.orderStatus).toUpperCase() === "DELIVERED";
  const paidAmount =
    paymentStatus.toUpperCase() === "PAID" ||
    paymentStatus.toUpperCase() === "COLLECTED"
      ? Number(order.grandTotal) || 0
      : 0;

  return {
    id: order.id,
    orderNo: order.orderNumber,
    customer: {
      name: order.customer?.fullName || "Customer",
      type: "retail",
      phone: order.customer?.phone || "",
    },
    location,
    value: Number(order.grandTotal) || 0,
    status: mapStatus(order.orderStatus),
    backendStatus: order.orderStatus,
    statusLabel: order.statusLabel,
    invoiceId: order.invoiceId ?? undefined,
    invoiceNumber: order.invoiceNumber ?? undefined,
    expectedDeliveryAt: order.expectedDeliveryAt ?? undefined,
    materials: mapMaterials(order.items),
    payment: {
      method: order.paymentMethod || "cash",
      status: paymentStatus,
      amount: Number(order.grandTotal) || 0,
      paidAmount,
    },
    deliveryAddress: location,
    timeline: mapTimeline(order.timeline, order.orderStatus),
    orderDate: order.createdAt,
    createdAt: order.createdAt,
    dispatchId: undefined,
    dispatchedAt: order.dispatchedAt ?? null,
    deliveredAt: order.deliveredAt ?? null,
    dispatchHistory: (order.dispatchHistory ?? []).map((d) => ({
      dispatchNo: d.dispatchNo,
      status: d.status,
      vehicle: d.vehicle,
      driver: d.driver,
      dispatchedAt: d.dispatchedAt
        ? new Date(d.dispatchedAt).toLocaleString("en-IN")
        : "—",
      reachedAt: d.reachedAt
        ? new Date(d.reachedAt).toLocaleString("en-IN")
        : null,
      deliveredAt: d.deliveredAt
        ? new Date(d.deliveredAt).toLocaleString("en-IN")
        : null,
      deliveryOtpVerified: d.deliveryOtpVerified,
    })),
    inventoryAllocation: order.items?.map((m) => ({
      sku: m.productId.slice(0, 8),
      name: m.name,
      allocated: m.quantity,
      unit: m.unit,
    })),
    delivery: {
      driverReachedAt: order.driverReachedAt ?? null,
      deliveryOtpGenerated: order.deliveryOtpGenerated ?? false,
      deliveryOtpGeneratedAt: order.deliveryOtpGeneratedAt ?? null,
      deliveryOtpVerified: order.deliveryOtpVerified ?? false,
      deliveryVerifiedBy: order.deliveryVerifiedBy ?? null,
      deliveryCompletedAt: order.deliveryCompletedAt ?? null,
      paymentCollectedAt: order.paymentCollectedAt ?? null,
      deliveryVerificationLink:
        order.deliveryVerificationLink ||
        `https://delivery.bajriwala.in/verify/${order.orderNumber}`,
      driverName,
      vehicleNumber,
    },
    deliveryPricing: {
      vehicleType: order.deliveryVehicleType ?? null,
      vehicleDisplayName: order.deliveryVehicleType
        ? DELIVERY_VEHICLE_LABELS[order.deliveryVehicleType] ??
          String(order.deliveryVehicleType).replaceAll("_", " ")
        : null,
      vehicleCount: order.deliveryVehicleCount ?? 1,
      distanceKm:
        order.deliveryDistanceKm != null
          ? Number(order.deliveryDistanceKm)
          : null,
      totalWeightKg:
        order.deliveryTotalWeightKg != null
          ? Number(order.deliveryTotalWeightKg)
          : null,
      totalVolumeCft:
        order.deliveryTotalVolumeCft != null
          ? Number(order.deliveryTotalVolumeCft)
          : null,
      capacityUsed:
        order.deliveryCapacityUsed != null
          ? Number(order.deliveryCapacityUsed)
          : null,
      capacityLimit:
        order.deliveryCapacityLimit != null
          ? Number(order.deliveryCapacityLimit)
          : null,
      deliveryCharge:
        order.deliveryCharge != null ? Number(order.deliveryCharge) : null,
      freeDeliveryApplied: order.freeDeliveryApplied ?? false,
      multiVehicle: order.deliveryMultiVehicle ?? false,
    },
  };
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export function filterOrdersByTab(
  orders: HubOrder[],
  tab: OrderFilterTab,
): HubOrder[] {
  if (tab === "all") return orders;
  if (tab === "active") {
    return orders.filter((o) => ORDER_ACTIVE_STATUSES.includes(o.status));
  }
  // Completed includes delivered + cancelled (cancelled maps to delivered bucket)
  return orders.filter(
    (o) =>
      ORDER_COMPLETED_STATUSES.includes(o.status) ||
      o.backendStatus === "CANCELLED",
  );
}

export const ordersService = {
  async getOrders(
    filters?: ApiFilters & { tab?: OrderFilterTab },
  ): Promise<PaginatedResponse<HubOrder> & { summary: OrderSummaryData }> {
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 20;

    const { data } = await api.get<
      ApiResponse<{
        data: BackendOrderListItem[];
        meta: { page: number; limit: number; total: number; totalPages: number };
      }>
    >("/hub/orders", {
      params: {
        page,
        limit: pageSize,
        search: filters?.search,
        filter: mapFilterToBackend(filters?.tab),
        status: filters?.status
          ? String(filters.status).toUpperCase()
          : undefined,
      },
    });

    let orders = data.data.data.map((row) => mapOrder(row));
    if (filters?.tab) {
      orders = filterOrdersByTab(orders, filters.tab);
    }

    const summary = await this.getSummary();
    cachedOrders = orders;
    cachedSummary = summary;

    return {
      data: orders,
      total: data.data.meta.total,
      page: data.data.meta.page,
      pageSize: data.data.meta.limit,
      totalPages: data.data.meta.totalPages,
      summary,
    };
  },

  async getOrderById(id: string): Promise<HubOrder | undefined> {
    const { data } = await api.get<ApiResponse<BackendOrderDetail>>(
      `/hub/orders/${id}`,
    );
    return mapOrder(data.data);
  },

  async getSummary(): Promise<OrderSummaryData> {
    try {
      const { data } = await api.get<
        ApiResponse<{
          todaysOrders: number;
          pendingOrders: number;
          ordersDelivered: number;
          todaysRevenue: number;
        }>
      >("/hub/dashboard");
      const d = data.data;
      return {
        todaysOrders: d.todaysOrders,
        dailyTarget: Math.max(d.todaysOrders, 20),
        revenue: d.todaysRevenue,
        revenueChangePercent: 0,
        pendingDeliveries: d.pendingOrders,
        etaAvgHours: 2,
        completedOrders: d.ordersDelivered,
        totalOrders: d.todaysOrders,
      };
    } catch {
      return {
        todaysOrders: 0,
        dailyTarget: 20,
        revenue: 0,
        revenueChangePercent: 0,
        pendingDeliveries: 0,
        etaAvgHours: 0,
        completedOrders: 0,
        totalOrders: 0,
      };
    }
  },

  async acceptOrder(orderId: string): Promise<void> {
    await api.patch(`/hub/orders/${orderId}/accept`, {});
  },

  async rejectOrder(orderId: string, reason: string): Promise<void> {
    await api.patch(`/hub/orders/${orderId}/reject`, { reason });
  },

  async updateStatus(
    orderId: string,
    status: HubStatusAlias,
    extras?: {
      driverId?: string;
      vehicleId?: string;
      expectedDeliveryAt?: string;
      remarks?: string;
    },
  ): Promise<HubOrder | undefined> {
    await api.patch(`/hub/orders/${orderId}/status`, {
      status,
      ...extras,
    });
    return this.getOrderById(orderId);
  },

  async markPicking(orderId: string): Promise<HubOrder | undefined> {
    return this.updateStatus(orderId, "Picking");
  },

  async markPacked(orderId: string): Promise<HubOrder | undefined> {
    return this.updateStatus(orderId, "Packed");
  },

  async markReady(orderId: string): Promise<void> {
    await this.updateStatus(orderId, "Packed");
  },

  async dispatchOrder(orderId: string): Promise<void> {
    await this.updateStatus(orderId, "OutForDelivery");
  },

  async deliverOrder(orderId: string): Promise<HubOrder | undefined> {
    // Direct deliver is blocked on backend without OTP — use completeDelivery
    return this.completeDelivery(orderId);
  },

  async markDriverReached(orderId: string): Promise<HubOrder | undefined> {
    await api.patch(`/hub/orders/${orderId}/driver-reached`, {});
    return this.getOrderById(orderId);
  },

  async generateDeliveryOtp(orderId: string): Promise<{
    deliveryVerificationLink?: string;
    status?: string;
  }> {
    const { data } = await api.post<
      ApiResponse<{
        deliveryVerificationLink?: string;
        status?: string;
        message?: string;
      }>
    >(`/hub/orders/${orderId}/generate-delivery-otp`, {});
    return data.data;
  },

  async verifyDeliveryOtp(
    orderId: string,
    otp: string,
  ): Promise<HubOrder | undefined> {
    await api.post(`/hub/orders/${orderId}/verify-delivery-otp`, { otp });
    return this.getOrderById(orderId);
  },

  async completeDelivery(orderId: string): Promise<HubOrder | undefined> {
    await api.patch(`/hub/orders/${orderId}/complete-delivery`, {});
    return this.getOrderById(orderId);
  },

  async cancelOrder(
    orderId: string,
    remarks?: string,
  ): Promise<HubOrder | undefined> {
    return this.updateStatus(orderId, "Cancelled", { remarks });
  },

  async createDispatch(payload: CreateDispatchPayload): Promise<{
    order: HubOrder;
    dispatch: Dispatch;
  }> {
    let expectedDeliveryAt: string | undefined;
    if (payload.expectedDeliveryTime) {
      const parsed = new Date(payload.expectedDeliveryTime);
      if (!Number.isNaN(parsed.getTime())) {
        expectedDeliveryAt = parsed.toISOString();
      }
    }

    if (payload.driver) {
      await api.patch(`/hub/orders/${payload.orderId}/assign-driver`, {
        driverId: payload.driver,
        ...(payload.vehicle ? { vehicleId: payload.vehicle } : {}),
        ...(expectedDeliveryAt ? { expectedDeliveryAt } : {}),
      });
    }

    await this.updateStatus(payload.orderId, "OutForDelivery", {
      remarks: payload.remarks,
      ...(payload.driver ? { driverId: payload.driver } : {}),
      ...(payload.vehicle ? { vehicleId: payload.vehicle } : {}),
      ...(expectedDeliveryAt ? { expectedDeliveryAt } : {}),
    });

    const order = await this.getOrderById(payload.orderId);
    const dispatch: Dispatch = {
      id: payload.orderId,
      dispatchNo: `DSP-${payload.orderId.slice(0, 6).toUpperCase()}`,
      orderNo: order?.orderNo || payload.orderId,
      destination: order?.location || "",
      vehicleNo: payload.vehicle,
      driver: payload.driver,
      items: order?.materials.length ?? 0,
      status: "active",
      dispatchDate: payload.dispatchDate,
      estimatedArrival: payload.expectedDeliveryTime,
    };

    return { order: order!, dispatch };
  },

  async updateOrderStatus(
    orderId: string,
    status: HubOrder["status"],
  ): Promise<HubOrder | undefined> {
    const aliasMap: Partial<Record<HubOrder["status"], HubStatusAlias>> = {
      loading: "Picking",
      dispatch: "OutForDelivery",
      // Delivered must go through OTP verification — do not call Delivered alias
    };
    const alias = aliasMap[status];
    if (!alias) {
      if (status === "delivered") {
        return this.completeDelivery(orderId);
      }
      return this.getOrderById(orderId);
    }
    return this.updateStatus(orderId, alias);
  },

  async getDispatchHistory(_orderNo: string) {
    return [] as HubOrder["dispatchHistory"];
  },

  /** Fetch the canonical backend PDF and trigger a browser download. */
  async downloadInvoice(orderId: string): Promise<HubOrder | undefined> {
    const order = await this.getOrderById(orderId);
    const { data } = await api.get<Blob>(`/hub/orders/${orderId}/invoice/pdf`, {
      responseType: "blob",
    });
    const filename =
      order?.invoiceNumber
        ? `${order.invoiceNumber}.pdf`
        : `invoice-${order?.orderNo ?? orderId}.pdf`;
    triggerBrowserDownload(data, filename);
    return order;
  },

  async exportOrdersCsv(orders: HubOrder[]): Promise<void> {
    const headers = [
      "Order No",
      "Customer",
      "Phone",
      "Location",
      "Status",
      "Value",
      "Payment",
      "Order Date",
      "Expected Delivery",
    ];
    const rows = orders.map((order) => [
      order.orderNo,
      order.customer.name,
      order.customer.phone ?? "",
      order.location,
      order.statusLabel || order.status,
      String(order.value),
      order.payment?.method ?? "",
      order.orderDate || order.createdAt,
      order.expectedDeliveryAt ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    triggerBrowserDownload(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `orders-export-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  },

  getAllOrdersData(): { orders: HubOrder[]; summary: OrderSummaryData } {
    return {
      orders: cachedOrders,
      summary: cachedSummary,
    };
  },
};

let cachedOrders: HubOrder[] = [];
let cachedSummary: OrderSummaryData = {
  todaysOrders: 0,
  dailyTarget: 20,
  revenue: 0,
  revenueChangePercent: 0,
  pendingDeliveries: 0,
  etaAvgHours: 0,
  completedOrders: 0,
  totalOrders: 0,
};
