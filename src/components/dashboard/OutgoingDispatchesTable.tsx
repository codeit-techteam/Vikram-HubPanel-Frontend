"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import type { OutgoingDispatch, OutgoingDispatchStatus } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const OUTGOING_DISPATCHES: OutgoingDispatch[] = [
  {
    id: "d1",
    orderId: "BJW-ORD-7741",
    customerName: "Prime Construction Ltd.",
    eta: "13:50 PM",
    material: "Cement Grade 53",
    quantity: "200 Bags",
    destination: "Skyline Tower Site, Andheri East",
    status: "in_transit",
  },
  {
    id: "d2",
    orderId: "BJW-ORD-7742",
    customerName: "Kumar Builders & Co.",
    eta: "15:30 PM",
    material: "TMT Steel Bars (12mm)",
    quantity: "5 Tons",
    destination: "Worli Project Site, Mumbai",
    status: "loading",
  },
  {
    id: "d3",
    orderId: "BJW-ORD-7743",
    customerName: "Anita Desai Infra",
    eta: "17:15 PM",
    material: "Ready Mix Concrete",
    quantity: "3 Mixers",
    destination: "New Harbor Bridge, Sector 18",
    status: "dispatched",
  },
  {
    id: "d4",
    orderId: "BJW-ORD-7744",
    customerName: "Sanjay Gupta Constructions",
    eta: "18:40 PM",
    material: "Red Clay Bricks ISI",
    quantity: "8,000 pcs",
    destination: "Mumbai Metro P-4 Site",
    status: "pending",
  },
  {
    id: "d5",
    orderId: "BJW-ORD-7745",
    customerName: "Vikram Malhotra Group",
    eta: "20:00 PM",
    material: "Stone Aggregate 20mm",
    quantity: "6 MT",
    destination: "Skyline Tower Site, Andheri East",
    status: "in_transit",
  },
];

const STATUS_STYLES: Record<
  OutgoingDispatchStatus,
  { label: string; className: string }
> = {
  in_transit: {
    label: "IN-TRANSIT",
    className: "bg-orange-100 text-[#FF6B00]",
  },
  loading: {
    label: "LOADING",
    className: "bg-sky-100 text-sky-700",
  },
  dispatched: {
    label: "DISPATCHED",
    className: "bg-emerald-100 text-emerald-700",
  },
  pending: {
    label: "PENDING",
    className: "bg-gray-100 text-gray-500",
  },
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

function ActionsMenu({ dispatchId }: { dispatchId: string }) {
  const trackDispatch = () =>
    toast.success(`Tracking dispatch ${dispatchId}…`);
  const viewOrderDetails = () =>
    toast.success(`Opening order details for ${dispatchId}…`);
  const contactCustomer = () =>
    toast.success(`Contacting customer for ${dispatchId}…`);
  const printInvoice = () =>
    toast.success(`Preparing invoice for ${dispatchId}…`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="More actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={trackDispatch}>
          Track Dispatch
        </DropdownMenuItem>
        <DropdownMenuItem onClick={viewOrderDetails}>
          View Order Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={contactCustomer}>
          Contact Customer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printInvoice}>Print Invoice</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface OutgoingDispatchesTableProps {
  dispatches?: OutgoingDispatch[];
}

export function OutgoingDispatchesTable({
  dispatches = OUTGOING_DISPATCHES,
}: OutgoingDispatchesTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3">ETA</th>
              <th className="px-5 py-3">Order / Customer</th>
              <th className="px-5 py-3">Material</th>
              <th className="px-5 py-3">Destination</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((dispatch) => (
              <tr
                key={dispatch.id}
                className="border-b border-gray-50 last:border-0"
              >
                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                  {dispatch.eta}
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-900">
                    {dispatch.orderId}
                  </p>
                  <p className="text-xs text-gray-400">
                    {dispatch.customerName}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-900">
                    {dispatch.material}
                  </p>
                  <p className="text-xs text-gray-400">{dispatch.quantity}</p>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  {dispatch.destination}
                </td>
                <td className="px-5 py-4">
                  <StatusPill status={dispatch.status} />
                </td>
                <td className="px-5 py-4 text-right">
                  <ActionsMenu dispatchId={dispatch.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
