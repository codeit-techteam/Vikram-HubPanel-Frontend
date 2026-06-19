"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Package,
  User,
} from "lucide-react";
import { Modal } from "@/components/modals/modal";
import { useOrdersStore } from "@/store";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function OrderDetailsModal() {
  const { isDetailsOpen, closeDetails, selectedOrder } = useOrdersStore();

  if (!selectedOrder) return null;

  const order = selectedOrder;

  return (
    <Modal
      open={isDetailsOpen}
      onOpenChange={(open) => !open && closeDetails()}
      title="Order Details"
      description={`${order.orderNo} — ${order.customer.name}`}
      className="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-[#111827]">{order.orderNo}</p>
            <p className="text-sm text-gray-500">{order.orderDate}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <section className="rounded-2xl border border-[#E5E7EB] bg-[#F8F9FB] p-4">
          <div className="mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-[#FF6B00]" />
            <h3 className="text-sm font-semibold text-[#111827]">
              Customer Details
            </h3>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400">Name</p>
              <p className="font-medium text-[#111827]">{order.customer.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Type</p>
              <p className="font-medium text-[#111827]">{order.customer.type}</p>
            </div>
            {order.customer.email && (
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="font-medium text-[#111827]">
                  {order.customer.email}
                </p>
              </div>
            )}
            {order.customer.phone && (
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="font-medium text-[#111827]">
                  {order.customer.phone}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-[#FF6B00]" />
            <h3 className="text-sm font-semibold text-[#111827]">
              Material List
            </h3>
          </div>
          <div className="space-y-2">
            {order.materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between rounded-xl bg-[#F8F9FB] px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-[#111827]">{material.name}</p>
                  <p className="text-xs text-gray-400">
                    {material.sku} · {material.quantity} {material.unit}
                  </p>
                </div>
                <p className="font-semibold text-[#111827]">
                  {formatCurrency(material.totalPrice)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#111827]">
            Payment Information
          </h3>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400">Method</p>
              <p className="font-medium">{order.payment.method}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <p className="font-medium">{order.payment.status}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Amount</p>
              <p className="font-semibold text-[#111827]">
                {formatCurrency(order.payment.amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Paid</p>
              <p className="font-semibold text-emerald-600">
                {formatCurrency(order.payment.paidAmount)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] p-4">
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#FF6B00]" />
            <h3 className="text-sm font-semibold text-[#111827]">
              Delivery Address
            </h3>
          </div>
          <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] p-4">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#FF6B00]" />
            <h3 className="text-sm font-semibold text-[#111827]">Timeline</h3>
          </div>
          <div className="space-y-0">
            {order.timeline.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  {event.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                  ) : event.status === "active" ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B00]">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                  {index < order.timeline.length - 1 && (
                    <div
                      className={cn(
                        "my-1 w-0.5 flex-1 min-h-[24px]",
                        event.status === "completed"
                          ? "bg-[#22C55E]"
                          : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
                <div className="pb-4">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      event.status === "pending"
                        ? "text-gray-400"
                        : "text-[#111827]"
                    )}
                  >
                    {event.title}
                  </p>
                  {event.timestamp && (
                    <p className="text-xs text-gray-400">{event.timestamp}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </motion.div>
    </Modal>
  );
}
