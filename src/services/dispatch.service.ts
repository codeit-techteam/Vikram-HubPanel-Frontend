import type {
  ApiFilters,
  CreateDispatchFormPayload,
  Dispatch,
  DispatchDriver,
  DispatchQueueStatus,
  DispatchRecord,
  DispatchRoute,
  DispatchSortField,
  DispatchVehicle,
  FleetStats,
  InitiateDispatchPayload,
  PaginatedResponse,
  PendingDispatchOrder,
} from "@/types";
import { delay } from "@/lib/utils";
import { erpDatabase } from "./erpDatabase";

function formatEta(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function parseEtaMinutes(eta: string): number {
  const hourMatch = eta.match(/(\d+)h/);
  const minMatch = eta.match(/(\d+)\s*min/);
  let total = 0;
  if (hourMatch) total += parseInt(hourMatch[1], 10) * 60;
  if (minMatch) total += parseInt(minMatch[1], 10);
  return total || 999;
}

function priorityWeight(priority: string): number {
  if (priority === "urgent") return 3;
  if (priority === "high") return 2;
  return 1;
}

function sortQueue(
  items: DispatchRecord[],
  sortBy: DispatchSortField
): DispatchRecord[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case "eta":
        return parseEtaMinutes(a.eta) - parseEtaMinutes(b.eta);
      case "priority":
        return priorityWeight(b.priority) - priorityWeight(a.priority);
      case "driver":
        return a.driver.localeCompare(b.driver);
      case "vehicle":
        return a.vehicle.localeCompare(b.vehicle);
      default:
        return 0;
    }
  });
}

function checkVehicleAvailable(registrationNo: string): boolean {
  const vehicle = erpDatabase.getVehicleByRegistration(registrationNo);
  return vehicle?.status === "available";
}

function checkDriverAvailable(name: string): boolean {
  const driver = erpDatabase.getDriverByName(name);
  return driver?.status === "available";
}

export const dispatchService = {
  async getDispatches(
    filters?: ApiFilters
  ): Promise<PaginatedResponse<Dispatch>> {
    await delay(300);
    let data = [...erpDatabase.getDispatches()];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      data = data.filter(
        (d) =>
          d.dispatchNo.toLowerCase().includes(search) ||
          d.destination.toLowerCase().includes(search) ||
          d.vehicleNo.toLowerCase().includes(search) ||
          d.driver.toLowerCase().includes(search) ||
          d.orderNo.toLowerCase().includes(search)
      );
    }

    if (filters?.status) {
      data = data.filter((d) => d.status === filters.status);
    }

    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 10;
    const start = (page - 1) * pageSize;

    return {
      data: data.slice(start, start + pageSize),
      total: data.length,
      page,
      pageSize,
      totalPages: Math.ceil(data.length / pageSize),
    };
  },

  async getById(id: string): Promise<DispatchRecord | undefined> {
    await delay(200);
    return erpDatabase.getQueueItemById(id);
  },

  async getByOrderNo(orderNo: string): Promise<Dispatch | undefined> {
    await delay(200);
    return erpDatabase.getDispatchByOrderNo(orderNo);
  },

  async getQueue(
    tab?: string,
    search?: string,
    sortBy: DispatchSortField = "eta"
  ): Promise<DispatchRecord[]> {
    await delay(250);
    let data = [...erpDatabase.getQueue()];

    if (tab && tab !== "all") {
      const statusMap: Record<string, DispatchQueueStatus[]> = {
        pending: ["pending"],
        preparing: ["preparing"],
        assigned: ["assigned", "dispatched"],
        in_transit: ["in_transit", "arrived"],
      };
      const statuses = statusMap[tab];
      if (statuses) {
        data = data.filter((d) => statuses.includes(d.status));
      }
    }

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (d) =>
          d.orderNo.toLowerCase().includes(q) ||
          d.customer.toLowerCase().includes(q) ||
          d.vehicle.toLowerCase().includes(q) ||
          d.driver.toLowerCase().includes(q)
      );
    }

    return sortQueue(data, sortBy);
  },

  async getPendingOrders(): Promise<PendingDispatchOrder[]> {
    await delay(150);
    return erpDatabase.getPendingOrders();
  },

  async getVehicles(): Promise<DispatchVehicle[]> {
    await delay(150);
    return erpDatabase.getVehicles();
  },

  async getDrivers(): Promise<DispatchDriver[]> {
    await delay(150);
    return erpDatabase.getDrivers();
  },

  async getRoutes(): Promise<DispatchRoute[]> {
    await delay(150);
    return erpDatabase.getRoutes();
  },

  async getFleetStats(): Promise<FleetStats> {
    await delay(150);
    return erpDatabase.getFleet();
  },

  async createDispatch(
    payload: CreateDispatchFormPayload
  ): Promise<DispatchRecord> {
    await delay(400);

    if (!checkVehicleAvailable(payload.vehicle)) {
      throw new Error("Vehicle is not available for dispatch");
    }
    if (!checkDriverAvailable(payload.driver)) {
      throw new Error("Driver is not available for dispatch");
    }

    const route = erpDatabase
      .getRoutes()
      .find((r) => r.via === payload.route || r.name === payload.route);
    const etaMinutes = route?.estimatedMinutes ?? 60;

    const dispatchNo = `DSP-${Date.now().toString().slice(-6)}`;
    const id = `dsp-${Date.now()}`;

    const now = new Date();
    const scheduleTime = payload.dispatchTime || "02:30 PM";

    const record: DispatchRecord = {
      id,
      dispatchNo,
      orderNo: payload.orderNo,
      orderId: payload.orderId,
      status: "assigned",
      customer: payload.customer,
      customerDetails: {
        name: payload.customer,
        address: payload.customer,
      },
      schedule: `${scheduleTime} Today`,
      scheduledTime: scheduleTime,
      vehicle: payload.vehicle,
      driver: payload.driver,
      route: payload.route,
      eta: formatEta(etaMinutes),
      priority: payload.priority,
      remarks: payload.remarks,
      items: 1,
      timeline: erpDatabase.buildDefaultTimeline(),
      documents: [
        { id: "doc-new-1", name: "Delivery Challan", type: "PDF" },
      ],
      dispatchDate: now.toISOString().split("T")[0],
    };

    erpDatabase.addToQueue(record);
    erpDatabase.removePendingOrder(payload.orderId);

    const dispatch: Dispatch = {
      id,
      dispatchNo,
      orderNo: payload.orderNo,
      destination: payload.customer,
      vehicleNo: payload.vehicle,
      driver: payload.driver,
      items: 1,
      status: "dispatched",
      dispatchDate: record.dispatchDate!,
      estimatedArrival: formatEta(etaMinutes),
    };
    erpDatabase.addDispatch(dispatch);

    const order = erpDatabase.getOrderById(payload.orderId);
    if (order?.materials?.length) {
      erpDatabase.reduceStockFromDispatch(
        order.materials.map((m) => ({
          sku: m.sku,
          quantity: m.quantity,
          unit: m.unit,
        })),
        dispatchNo,
        payload.driver
      );
    }

    const vehicle = erpDatabase.getVehicleByRegistration(payload.vehicle);
    if (vehicle) {
      erpDatabase.updateVehicle(vehicle.id, {
        status: "assigned",
        availability: "Assigned",
        currentTrip: dispatchNo,
      });
    }
    const driver = erpDatabase.getDriverByName(payload.driver);
    if (driver) {
      erpDatabase.updateDriver(driver.id, {
        status: "on_trip",
        availability: "On Trip",
        currentTrip: dispatchNo,
        assignedVehicle: payload.vehicle,
      });
      if (vehicle) {
        erpDatabase.updateVehicle(vehicle.id, {
          driverId: driver.id,
          assignedDriver: driver.name,
        });
      }
    }

    const fleet = erpDatabase.getFleet();
    erpDatabase.updateFleet({
      activeTransits: fleet.activeTransits + 1,
      activeFleet: {
        ...fleet.activeFleet,
        current: Math.min(
          fleet.activeFleet.current + 1,
          fleet.activeFleet.total
        ),
      },
    });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    erpDatabase.addDelivery({
      id: `del-${Date.now()}`,
      dispatchId: id,
      dispatchNo,
      orderNo: payload.orderNo,
      customerName: payload.customer,
      status: "assigned",
      otp,
      podGenerated: false,
    });

    if (order) {
      erpDatabase.updateOrder(payload.orderId, {
        status: "out_for_delivery",
        dispatchId: id,
        dispatchHistory: [
          ...(order.dispatchHistory ?? []),
          {
            dispatchNo,
            status: "assigned",
            vehicle: payload.vehicle,
            driver: payload.driver,
            dispatchedAt: now.toISOString(),
          },
        ],
      });
    }

    return record;
  },

  async initiateDispatch(
    payload: InitiateDispatchPayload
  ): Promise<DispatchRecord> {
    await delay(400);

    const pendingOrder = erpDatabase
      .getPendingOrders()
      .find((o) => o.id === payload.orderId);
    if (!pendingOrder) throw new Error("Order not found");

    if (!checkVehicleAvailable(payload.vehicle)) {
      throw new Error("Vehicle is not available");
    }
    if (!checkDriverAvailable(payload.driver)) {
      throw new Error("Driver is not available");
    }

    const routes = erpDatabase.getRoutes();
    const route = routes[Math.floor(Math.random() * routes.length)];

    return dispatchService.createDispatch({
      orderId: pendingOrder.id,
      orderNo: pendingOrder.orderNo,
      customer: pendingOrder.customer,
      vehicle: payload.vehicle,
      driver: payload.driver,
      priority: "normal",
      route: route.via,
      dispatchTime: payload.deliverySlot,
    });
  },

  async assignVehicle(
    dispatchId: string,
    vehicle: string
  ): Promise<DispatchRecord | undefined> {
    await delay(200);
    if (!checkVehicleAvailable(vehicle)) {
      throw new Error("Vehicle is not available");
    }
    return erpDatabase.updateQueueItem(dispatchId, { vehicle });
  },

  async assignDriver(
    dispatchId: string,
    driver: string
  ): Promise<DispatchRecord | undefined> {
    await delay(200);
    if (!checkDriverAvailable(driver)) {
      throw new Error("Driver is not available");
    }
    return erpDatabase.updateQueueItem(dispatchId, { driver });
  },

  async updateDispatchStatus(
    dispatchId: string,
    status: DispatchQueueStatus
  ): Promise<DispatchRecord | undefined> {
    await delay(300);
    const item = erpDatabase.getQueueItemById(dispatchId);
    if (!item) return undefined;

    const timeline = item.timeline.map((t) => {
      const now = "Just now";
      if (status === "preparing" && t.title === "Loading Started") {
        return { ...t, status: "active" as const, timestamp: now };
      }
      if (status === "dispatched" && t.title === "Dispatched") {
        return { ...t, status: "completed" as const, timestamp: now };
      }
      if (status === "in_transit" && t.title === "In Transit") {
        return { ...t, status: "active" as const, timestamp: now };
      }
      if (status === "arrived" && t.title === "Delivered") {
        return { ...t, status: "pending" as const };
      }
      if (status === "delivered" && t.title === "Delivered") {
        return { ...t, status: "completed" as const, timestamp: now };
      }
      return t;
    });

    return erpDatabase.updateQueueItem(dispatchId, { status, timeline });
  },

  async completeDelivery(
    dispatchId: string
  ): Promise<{ record: DispatchRecord; orderValue: number }> {
    await delay(400);
    const item = erpDatabase.getQueueItemById(dispatchId);
    if (!item) throw new Error("Dispatch not found");

    const timeline = item.timeline.map((t) => ({
      ...t,
      status:
        t.title === "Delivered"
          ? ("completed" as const)
          : t.status === "pending"
            ? ("completed" as const)
            : t.status,
      timestamp: t.title === "Delivered" ? "Just now" : t.timestamp,
    }));

    const record = erpDatabase.updateQueueItem(dispatchId, {
      status: "delivered",
      timeline,
    })!;

    const fleet = erpDatabase.getFleet();
    erpDatabase.updateFleet({
      activeTransits: Math.max(0, fleet.activeTransits - 1),
    });

    const vehicle = erpDatabase.getVehicleByRegistration(item.vehicle);
    if (vehicle) {
      erpDatabase.updateVehicle(vehicle.id, {
        status: "available",
        availability: "Available",
        currentTrip: null,
        tripsToday: (vehicle.tripsToday ?? 0) + 1,
      });
    }
    const driver = erpDatabase.getDriverByName(item.driver);
    if (driver) {
      erpDatabase.updateDriver(driver.id, {
        status: "available",
        availability: "Available",
        currentTrip: null,
        completedTrips: (driver.completedTrips ?? 0) + 1,
      });
    }

    erpDatabase.addLedgerEntry({
      id: `led-${Date.now()}`,
      transactionNo: `TXN-${Date.now().toString().slice(-6)}`,
      materialName: `Delivery — ${item.orderNo}`,
      sku: item.orderNo,
      hubName: "Noida (UP-04) Dark Store #422",
      type: "outbound",
      quantity: -1,
      balance: 0,
      reference: item.dispatchNo,
      performedBy: item.driver,
      timestamp: new Date().toISOString(),
    });

    const summary = erpDatabase.getSummary();
    erpDatabase.updateSummary({
      completedOrders: summary.completedOrders + 1,
      pendingDeliveries: Math.max(0, summary.pendingDeliveries - 1),
    });

    return { record, orderValue: 85000 };
  },
};
