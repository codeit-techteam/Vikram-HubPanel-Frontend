"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarClock,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Truck,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/page-header";
import { Modal } from "@/components/modals/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, cn } from "@/lib/utils";
import {
  deliveryScheduleService,
  formatDeliveryVehicleLabel,
  formatScheduleAddress,
  type DeliveryScheduleBucket,
  type DeliveryScheduleOrder,
  type DeliveryScheduleResponse,
} from "@/services/deliverySchedule.service";

const BUCKETS: { id: DeliveryScheduleBucket; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "scheduled", label: "Scheduled" },
  { id: "all", label: "All" },
];

const RESCHEDULE_BLOCKED = new Set([
  "DELIVERED",
  "CANCELLED",
  "OUT_FOR_DELIVERY",
  "DISPATCHED",
]);

function todayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function InstructionFlags({ order }: { order: DeliveryScheduleOrder }) {
  const flags: { label: string; active: boolean; variant?: "warning" | "info" | "success" | "secondary" }[] = [
    {
      label: "Call on Arrival",
      active: Boolean(order.deliveryCallOnArrival),
      variant: "info",
    },
    {
      label: "Leave at Security",
      active: Boolean(order.deliveryLeaveAtSecurity),
      variant: "secondary",
    },
    {
      label: "Heavy Vehicle Access",
      active: Boolean(order.deliveryHeavyVehicleAccess),
      variant: "warning",
    },
    {
      label: "Open Area",
      active: Boolean(order.openAreaConfirmed),
      variant: "success",
    },
  ];

  const active = flags.filter((f) => f.active);
  if (active.length === 0) {
    return <span className="text-xs text-gray-400">No special instructions</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {active.map((flag) => (
        <Badge key={flag.label} variant={flag.variant ?? "secondary"}>
          {flag.label}
        </Badge>
      ))}
    </div>
  );
}

function statusBadgeVariant(
  status: string,
): "default" | "success" | "warning" | "destructive" | "info" | "secondary" {
  const s = status.toUpperCase();
  if (s === "DELIVERED") return "success";
  if (s === "CANCELLED") return "destructive";
  if (s === "RESCHEDULE_REQUESTED") return "warning";
  if (s === "OUT_FOR_DELIVERY" || s === "DISPATCHED") return "info";
  return "secondary";
}

function paymentBadgeVariant(
  status?: string | null,
): "success" | "warning" | "destructive" | "secondary" {
  const s = (status ?? "").toUpperCase();
  if (s === "PAID" || s === "CAPTURED" || s === "SUCCESS") return "success";
  if (s === "PENDING" || s === "CREATED") return "warning";
  if (s === "FAILED" || s === "REFUNDED") return "destructive";
  return "secondary";
}

export default function DeliverySchedulePage() {
  const [bucket, setBucket] = useState<DeliveryScheduleBucket>("today");
  const [date, setDate] = useState(todayDateKey);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<DeliveryScheduleResponse | null>(
    null,
  );

  const [rescheduleOrder, setRescheduleOrder] =
    useState<DeliveryScheduleOrder | null>(null);
  const [slotId, setSlotId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadSchedule = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (opts?.silent) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const data = await deliveryScheduleService.getDeliverySchedule({
          bucket,
          date: date || undefined,
          search: search || undefined,
        });
        setSchedule(data);
      } catch (err) {
        const message = deliveryScheduleService.getErrorMessage(err);
        setError(message);
        if (!opts?.silent) setSchedule(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [bucket, date, search],
  );

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const groups = useMemo(() => schedule?.groups ?? [], [schedule]);

  const openReschedule = (order: DeliveryScheduleOrder) => {
    setRescheduleOrder(order);
    setSlotId("");
    setReason("");
  };

  const closeReschedule = () => {
    if (submitting) return;
    setRescheduleOrder(null);
    setSlotId("");
    setReason("");
  };

  const submitReschedule = async () => {
    if (!rescheduleOrder) return;
    const trimmedSlot = slotId.trim();
    if (!trimmedSlot) {
      toast.error("Enter a delivery slot ID (UUID)");
      return;
    }
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(trimmedSlot)) {
      toast.error("Slot ID must be a valid UUID");
      return;
    }

    setSubmitting(true);
    try {
      await deliveryScheduleService.requestReschedule(rescheduleOrder.id, {
        slotId: trimmedSlot,
        reason: reason.trim() || undefined,
      });
      toast.success(
        `Reschedule requested for ${rescheduleOrder.orderNumber}. Customer must accept.`,
      );
      setRescheduleOrder(null);
      setSlotId("");
      setReason("");
      await loadSchedule({ silent: true });
    } catch (err) {
      toast.error(deliveryScheduleService.getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !schedule) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <PageHeader
          title="Delivery Schedule"
          description="View hub deliveries by time slot and propose reschedules for customers to accept."
          actions={
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-[#E5E7EB]"
              onClick={() => void loadSchedule({ silent: true })}
              disabled={refreshing}
            >
              <RefreshCw
                className={cn("h-4 w-4", refreshing && "animate-spin")}
              />
              Refresh
            </Button>
          }
        />

        <div className="flex gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
          {BUCKETS.map((tab) => {
            const isActive = bucket === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBucket(tab.id)}
                className={cn(
                  "relative flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-white" : "text-gray-500 hover:text-gray-900",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="delivery-schedule-tab"
                    className="absolute inset-0 rounded-lg bg-[#FF6B00]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:flex-row sm:items-end">
          <div className="min-w-45 flex-1 space-y-1.5">
            <Label htmlFor="schedule-date">Date</Label>
            <Input
              id="schedule-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="flex-2 space-y-1.5">
            <Label htmlFor="schedule-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="schedule-search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Order number, customer, phone…"
                className="rounded-xl pl-9"
              />
            </div>
          </div>
        </div>

        {schedule && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#111827]">
              <CalendarClock className="h-4 w-4 text-[#FF6B00]" />
              {schedule.dateLabel}
            </span>
            <span>·</span>
            <span>{schedule.total} order{schedule.total === 1 ? "" : "s"}</span>
            <span>·</span>
            <span className="uppercase tracking-wide text-xs">
              {schedule.timezone}
            </span>
          </div>
        )}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!error && groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-6 py-16 text-center">
            <p className="text-sm font-medium text-gray-700">
              No deliveries in this view
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Try another tab, date, or search.
            </p>
          </div>
        ) : null}

        <div className="space-y-5">
          {groups.map((group) => (
            <section
              key={`${group.startMinutes}-${group.endMinutes}-${group.label}`}
              className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F8F9FB] px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#111827]">
                    {group.label}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {group.orders.length} order
                    {group.orders.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-[#F3F4F6]">
                {group.orders.map((order) => {
                  const canReschedule = !RESCHEDULE_BLOCKED.has(
                    order.orderStatus?.toUpperCase?.() ?? "",
                  );
                  const address = formatScheduleAddress(order.address);

                  return (
                    <div
                      key={order.id}
                      className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between"
                    >
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-sm font-bold text-[#111827] hover:text-[#FF6B00]"
                          >
                            {order.orderNumber}
                          </Link>
                          <Badge variant={statusBadgeVariant(order.orderStatus)}>
                            {order.orderStatus.replaceAll("_", " ")}
                          </Badge>
                          {order.paymentStatus ? (
                            <Badge
                              variant={paymentBadgeVariant(order.paymentStatus)}
                            >
                              {order.paymentStatus}
                            </Badge>
                          ) : null}
                          {order.orderStatus === "RESCHEDULE_REQUESTED" ? (
                            <Badge variant="warning">Awaiting customer</Badge>
                          ) : null}
                        </div>

                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                          <div className="flex items-start gap-2 text-gray-600">
                            <User className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B00]" />
                            <div>
                              <p className="font-medium text-[#111827]">
                                {order.customer?.fullName || "Customer"}
                              </p>
                              {order.customer?.phone ? (
                                <p className="inline-flex items-center gap-1 text-xs text-gray-400">
                                  <Phone className="h-3 w-3" />
                                  {order.customer.phone}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-start gap-2 text-gray-600">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B00]" />
                            <p className="text-sm">{address}</p>
                          </div>
                          <div className="flex items-start gap-2 text-gray-600">
                            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B00]" />
                            <div>
                              <p className="font-medium text-[#111827]">
                                {formatDeliveryVehicleLabel(
                                  order.deliveryVehicleType,
                                )}
                              </p>
                              {order.assignedVehicle?.registration ||
                              order.assignedDriver?.name ? (
                                <p className="text-xs text-gray-400">
                                  {[
                                    order.assignedVehicle?.registration,
                                    order.assignedDriver?.name,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Amount</p>
                            <p className="font-semibold text-[#111827]">
                              {formatCurrency(order.grandTotal)}
                            </p>
                            {order.scheduledSlotLabel ? (
                              <p className="text-xs text-gray-400">
                                Slot: {order.scheduledSlotLabel}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <InstructionFlags order={order} />

                        {order.deliveryCustomerRemark ? (
                          <p className="rounded-xl bg-[#F8F9FB] px-3 py-2 text-xs text-gray-600">
                            Remark: {order.deliveryCustomerRemark}
                          </p>
                        ) : null}

                        {order.rescheduleReason ? (
                          <p className="text-xs text-amber-700">
                            Proposed reschedule: {order.rescheduleReason}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          asChild
                        >
                          <Link href={`/orders/${order.id}`}>View</Link>
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-xl"
                          disabled={!canReschedule}
                          onClick={() => openReschedule(order)}
                        >
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </motion.div>

      <Modal
        open={Boolean(rescheduleOrder)}
        onOpenChange={(open) => !open && closeReschedule()}
        title="Request reschedule"
        description={
          rescheduleOrder
            ? `${rescheduleOrder.orderNumber} — customer must accept the new slot`
            : undefined
        }
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="slot-id">Delivery slot ID (UUID)</Label>
            <Input
              id="slot-id"
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              className="rounded-xl font-mono text-xs"
              disabled={submitting}
            />
            <p className="text-xs text-gray-400">
              Use a slot UUID from delivery options for this hub.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reschedule-reason">Reason (optional)</Label>
            <Textarea
              id="reschedule-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this delivery being moved?"
              maxLength={500}
              className="rounded-xl"
              disabled={submitting}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={closeReschedule}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl"
              onClick={() => void submitReschedule()}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Send request"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
