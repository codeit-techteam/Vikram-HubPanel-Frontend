"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EllipsisVertical } from "lucide-react";
import toast from "react-hot-toast";
import type { HubOrder, OutgoingDispatch, OutgoingDispatchStatus } from "@/types";
import {
  DashboardTimeFilter,
  isWithinDashboardPeriod,
  type DashboardTimePeriod,
} from "@/components/dashboard/DashboardTimeFilter";
import { ContactCustomerModal } from "@/components/orders/ContactCustomerModal";
import { HUB_OPERATION_STATUS_CONFIG } from "@/constants/operationStatus";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateInvoicePdf } from "@/lib/generateInvoicePdf";
import { printInvoice } from "@/lib/printInvoice";
import { ordersService } from "@/services/orders.service";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
  OutgoingDispatchStatus,
  { label: string; className: string }
> = {
  ...HUB_OPERATION_STATUS_CONFIG,
};

function StatusPill({ status }: { status: OutgoingDispatchStatus }) {
  const config = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-[10px] font-bold tracking-wide",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

function DispatchRowActions({ dispatch }: { dispatch: OutgoingDispatch }) {
  const router = useRouter();
  const [contactOpen, setContactOpen] = useState(false);
  const [contactOrder, setContactOrder] = useState<HubOrder | null>(null);

  const loadOrder = async () => {
    const order = await ordersService.getOrderById(dispatch.orderId);
    return order ?? null;
  };

  const handleTrackDispatch = () => {
    router.push(`/dispatch?search=${encodeURIComponent(dispatch.orderId)}`);
  };

  const handleViewOrderDetails = () => {
    router.push(`/orders/${dispatch.orderId}`);
  };

  const handleContactCustomer = async () => {
    const order = await loadOrder();
    if (order) {
      setContactOrder(order);
      setContactOpen(true);
      return;
    }

    setContactOrder({
      id: dispatch.id,
      orderNo: dispatch.orderId,
      customer: {
        name: dispatch.customerName,
        type: "Customer",
      },
      location: dispatch.destination,
      value: 0,
      status: dispatch.status,
      materials: [],
      payment: { method: "—", status: "—", amount: 0, paidAmount: 0 },
      deliveryAddress: dispatch.destination,
      timeline: [],
      orderDate: dispatch.scheduledDate,
      createdAt: dispatch.scheduledDate,
    });
    setContactOpen(true);
  };

  const handlePrintInvoice = async () => {
    const order = await loadOrder();
    if (!order) {
      toast.error(`Order ${dispatch.orderId} not found`);
      return;
    }
    printInvoice(order);
    toast.success(`Print dialog opened for ${dispatch.orderId}`);
  };

  const handleDownloadInvoice = async () => {
    const order = await loadOrder();
    if (!order) {
      toast.error(`Order ${dispatch.orderId} not found`);
      return;
    }
    generateInvoicePdf(order);
    toast.success(`Invoice ${dispatch.orderId} downloaded as PDF`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label={`Actions for ${dispatch.orderId}`}
          >
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onClick={handleTrackDispatch}
          >
            Track Dispatch
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onClick={handleViewOrderDetails}
          >
            View Order Details
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onClick={handleContactCustomer}
          >
            Contact Customer
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onClick={handlePrintInvoice}
          >
            Print Invoice
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onClick={handleDownloadInvoice}
          >
            Download PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {contactOrder && (
        <ContactCustomerModal
          open={contactOpen}
          onOpenChange={setContactOpen}
          customer={contactOrder.customer}
          orderNo={contactOrder.orderNo}
        />
      )}
    </>
  );
}

interface OutgoingDispatchesTableProps {
  dispatches?: OutgoingDispatch[];
  period: DashboardTimePeriod;
  selectedMonth: number;
  onPeriodChange: (period: DashboardTimePeriod) => void;
  onMonthChange: (month: number) => void;
}

export function OutgoingDispatchesTable({
  dispatches = [],
  period,
  selectedMonth,
  onPeriodChange,
  onMonthChange,
}: OutgoingDispatchesTableProps) {
  const filteredDispatches = dispatches.filter((dispatch) =>
    isWithinDashboardPeriod(dispatch.scheduledDate, period, selectedMonth)
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Outgoing Dispatches
          </h3>
          <Link
            href="/orders?tab=active"
            className="text-xs font-semibold text-[#FF6B00] hover:underline"
          >
            View All Orders
          </Link>
        </div>
        <div className="mt-3">
          <DashboardTimeFilter
            period={period}
            selectedMonth={selectedMonth}
            onPeriodChange={onPeriodChange}
            onMonthChange={onMonthChange}
            compact
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3">Delivery</th>
              <th className="px-5 py-3">Order ID</th>
              <th className="px-5 py-3">Customer Name</th>
              <th className="px-5 py-3">Destination</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDispatches.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-sm text-gray-400"
                >
                  No dispatches for the selected period.
                </td>
              </tr>
            ) : (
              filteredDispatches.map((dispatch) => (
                <tr
                  key={dispatch.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                    <Link
                      href={`/orders?tab=active&search=${dispatch.orderId}`}
                      className="hover:text-[#FF6B00] hover:underline"
                    >
                      {dispatch.orderReceiveTime}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/orders/${dispatch.orderId}`}
                      className="text-sm font-medium text-[#FF6B00] hover:underline"
                    >
                      {dispatch.orderId}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {dispatch.customerName}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {dispatch.destination}
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={dispatch.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <DispatchRowActions dispatch={dispatch} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
