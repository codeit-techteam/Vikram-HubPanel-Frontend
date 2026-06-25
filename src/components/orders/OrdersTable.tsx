"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Eye, FileText, Truck } from "lucide-react";
import { useOrdersStore } from "@/store";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { HubOrder } from "@/types";

const COLUMNS = [
  "Order ID",
  "Customer",
  "Site Location",
  "Order Value",
  "Status",
  "Actions",
] as const;

function OrderActions({ order }: { order: HubOrder }) {
  const router = useRouter();
  const { openDispatch, downloadInvoice } = useOrdersStore();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-500 hover:text-[#FF6B00]"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/orders/${order.orderNo}`);
        }}
        aria-label="View order"
      >
        <Eye className="h-4 w-4" />
      </Button>
      {order.status !== "delivered" && order.status !== "dispatch" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-[#FF6B00]"
          onClick={(e) => {
            e.stopPropagation();
            openDispatch(order);
          }}
          aria-label="Create dispatch"
        >
          <Truck className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-500 hover:text-[#FF6B00]"
        onClick={(e) => {
          e.stopPropagation();
          downloadInvoice(order.id);
        }}
        aria-label="Download invoice"
      >
        <FileText className="h-4 w-4" />
      </Button>
    </div>
  );
}

function OrderCard({ order, index }: { order: HubOrder; index: number }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -1 }}
      onClick={() => router.push(`/orders/${order.orderNo}`)}
      className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-blue-600">{order.orderNo}</p>
          <p className="mt-1 text-sm font-medium text-[#111827]">
            {order.customer.name}
          </p>
          <p className="text-xs text-gray-400">{order.customer.type}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-3 space-y-1 text-sm">
        <p className="text-gray-500">
          <span className="text-gray-400">Location: </span>
          {order.location}
        </p>
        <p className="font-semibold text-[#111827]">
          {formatCurrency(order.value)}
        </p>
      </div>
      <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
        <OrderActions order={order} />
      </div>
    </motion.div>
  );
}

export function OrdersTable() {
  const router = useRouter();
  const {
    orders,
    pagination,
    loading,
    filters,
    setPage,
  } = useOrdersStore();

  const emptyLabel =
    filters.tab === "active"
      ? "No active orders found."
      : filters.tab === "completed"
        ? "No completed orders found."
        : "No orders match your filters.";

  const pageNumbers = Array.from(
    { length: Math.min(pagination.totalPages, 5) },
    (_, i) => i + 1
  );

  if (loading && orders.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
        </div>
      )}
      {/* Desktop / Tablet Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {COLUMNS.map((column) => (
                <th key={column} className="px-5 py-3">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-5 py-12 text-center text-sm text-gray-500"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ backgroundColor: "#F9FAFB" }}
                  onClick={() => router.push(`/orders/${order.orderNo}`)}
                  className="cursor-pointer border-b border-gray-50 transition-colors last:border-0"
                >
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="text-sm font-semibold text-blue-600">
                      {order.orderNo}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-[#111827]">
                      {order.customer.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.customer.type}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                    {order.location}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-[#111827]">
                    {formatCurrency(order.value)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <OrderActions order={order} />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 p-4 md:hidden">
        {orders.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            {emptyLabel}
          </p>
        ) : (
          orders.map((order, index) => (
            <OrderCard key={order.id} order={order} index={index} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Showing {orders.length} of {pagination.total} orders
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-600"
            disabled={pagination.page <= 1}
            onClick={() => setPage(pagination.page - 1)}
          >
            Previous
          </Button>

          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant="outline"
              size="sm"
              className={cn(
                "min-w-9 border-gray-200",
                pagination.page === page &&
                  "border-[#FF6B00] bg-[#FF6B00] text-white hover:bg-[#E55F00] hover:text-white"
              )}
              onClick={() => setPage(page)}
            >
              {page}
            </Button>
          ))}

          {pagination.totalPages > 5 && (
            <>
              <span className="px-1 text-gray-400">...</span>
              <Button
                variant="outline"
                size="sm"
                className="min-w-9 border-gray-200"
                onClick={() => setPage(pagination.totalPages)}
              >
                {pagination.totalPages}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-600"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
