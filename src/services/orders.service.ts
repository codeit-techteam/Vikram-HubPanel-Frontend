import type {
  ApiFilters,
  CreateDispatchPayload,
  Dispatch,
  HubOrder,
  OrderFilterTab,
  OrderSummaryData,
  OrdersData,
  PaginatedResponse,
} from "@/types";
import { delay } from "@/lib/utils";
import { erpDatabase } from "./erpDatabase";

export const ORDER_ACTIVE_STATUSES: HubOrder["status"][] = [
  "new",
  "processing",
  "packed",
  "out_for_delivery",
];

export const ORDER_COMPLETED_STATUSES: HubOrder["status"][] = ["delivered"];

export function filterOrdersByTab(
  orders: HubOrder[],
  tab: OrderFilterTab
): HubOrder[] {
  if (tab === "all") return orders;
  if (tab === "active")
    return orders.filter((o) => ORDER_ACTIVE_STATUSES.includes(o.status));
  return orders.filter((o) => ORDER_COMPLETED_STATUSES.includes(o.status));
}

function buildTimelineForDispatch(): HubOrder["timeline"] {
  const now = new Date().toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return [
    {
      id: "tl-1",
      title: "Order Created",
      timestamp: "Earlier",
      status: "completed" as const,
    },
    {
      id: "tl-2",
      title: "Approved",
      timestamp: "Earlier",
      status: "completed" as const,
    },
    {
      id: "tl-3",
      title: "Packed",
      timestamp: "Earlier",
      status: "completed" as const,
    },
    {
      id: "tl-4",
      title: "Assigned To Vehicle",
      timestamp: `Today, ${now}`,
      status: "completed" as const,
    },
    {
      id: "tl-5",
      title: "Out For Delivery",
      timestamp: `Today, ${now}`,
      status: "active" as const,
    },
    {
      id: "tl-6",
      title: "Delivered",
      status: "pending" as const,
    },
  ];
}

export const ordersService = {
  async getOrders(
    filters?: ApiFilters & { tab?: OrderFilterTab }
  ): Promise<PaginatedResponse<HubOrder> & { summary: OrderSummaryData }> {
    await delay(300);
    let data = [...erpDatabase.getOrders()];

    if (filters?.tab) {
      data = filterOrdersByTab(data, filters.tab);
    }

    if (filters?.status) {
      data = data.filter((o) => o.status === filters.status);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      data = data.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(search) ||
          o.customer.name.toLowerCase().includes(search) ||
          o.location.toLowerCase().includes(search)
      );
    }

    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 5;
    const start = (page - 1) * pageSize;

    return {
      data: data.slice(start, start + pageSize),
      total: data.length,
      page,
      pageSize,
      totalPages: Math.ceil(data.length / pageSize),
      summary: erpDatabase.getSummary(),
    };
  },

  async getOrderById(id: string): Promise<HubOrder | undefined> {
    await delay(200);
    return erpDatabase.getOrderById(id);
  },

  async getSummary(): Promise<OrderSummaryData> {
    await delay(150);
    return erpDatabase.getSummary();
  },

  async createDispatch(
    payload: CreateDispatchPayload
  ): Promise<{ order: HubOrder; dispatch: Dispatch }> {
    await delay(400);
    const order = erpDatabase.getOrderById(payload.orderId);
    if (!order) throw new Error("Order not found");

    const dispatchNo = `DSP-${Date.now().toString().slice(-6)}`;
    const dispatchId = `dsp-${order.orderNo.toLowerCase()}`;

    const dispatch: Dispatch = {
      id: dispatchId,
      dispatchNo,
      orderNo: order.orderNo,
      destination: order.location,
      vehicleNo: payload.vehicle,
      driver: payload.driver,
      items: order.materials.length,
      status: "dispatched",
      dispatchDate: payload.dispatchDate,
      estimatedArrival: payload.expectedDeliveryTime,
    };

    erpDatabase.addDispatch(dispatch);

    const updatedOrder = erpDatabase.updateOrder(order.id, {
      status: "out_for_delivery",
      dispatchId,
      timeline: buildTimelineForDispatch(),
    });

    if (!updatedOrder) throw new Error("Failed to update order");

    erpDatabase.reduceStockFromDispatch(
      order.materials.map((m) => ({
        sku: m.sku,
        quantity: m.quantity,
        unit: m.unit,
      })),
      dispatch.dispatchNo,
      payload.driver
    );

    const summary = erpDatabase.getSummary();
    erpDatabase.updateSummary({
      pendingDeliveries: Math.max(0, summary.pendingDeliveries - 1),
    });

    return { order: updatedOrder, dispatch };
  },

  async updateOrderStatus(
    orderId: string,
    status: HubOrder["status"]
  ): Promise<HubOrder | undefined> {
    await delay(200);
    return erpDatabase.updateOrder(orderId, { status });
  },

  async downloadInvoice(orderId: string): Promise<HubOrder> {
    await delay(300);
    const order = erpDatabase.getOrderById(orderId);
    if (!order) throw new Error("Order not found");
    return order;
  },

  async getDispatchHistory(orderNo: string) {
    await delay(150);
    return erpDatabase.getDispatchesByOrderNo(orderNo);
  },

  getAllOrdersData(): OrdersData {
    return {
      summary: erpDatabase.getSummary(),
      orders: erpDatabase.getOrders(),
    };
  },
};
