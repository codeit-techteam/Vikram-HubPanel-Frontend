"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Package, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReceivingRecord } from "@/types";

interface ReceivingSummaryCardProps {
  record: ReceivingRecord;
}

const WORKFLOW_STEPS = [
  { key: "requisition", label: "Requisition", href: "/requisitions" },
  { key: "transfer", label: "Transfer", href: "/transfers" },
  { key: "receiving", label: "Receiving", href: null },
  { key: "inventory", label: "Inventory", href: "/inventory" },
  { key: "dispatch", label: "Dispatch", href: "/dispatch" },
] as const;

export function ReceivingSummaryCard({ record }: ReceivingSummaryCardProps) {
  const links = {
    requisition: `/requisitions?selected=${encodeURIComponent(record.requisitionId)}`,
    transfer: `/transfers/${record.transferId}`,
    inventory: `/inventory`,
    dispatch: `/dispatch`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.04 }}
    >
      <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
            <Package className="h-4 w-4 text-[#FF6B00]" />
            ERP Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {WORKFLOW_STEPS.map((step, index) => {
              const isActive = step.key === "receiving";
              const href =
                step.key === "requisition"
                  ? links.requisition
                  : step.key === "transfer"
                    ? links.transfer
                    : step.key === "inventory"
                      ? links.inventory
                      : step.key === "dispatch"
                        ? links.dispatch
                        : null;

              return (
                <div key={step.key} className="flex items-center gap-2">
                  {href ? (
                    <Link
                      href={href}
                      className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                        isActive
                          ? "bg-[#FF6B00] text-white"
                          : "bg-[#F8F9FB] text-gray-600 hover:bg-orange-50 hover:text-[#FF6B00]"
                      }`}
                    >
                      {step.label}
                    </Link>
                  ) : (
                    <span
                      className={`rounded-lg px-2.5 py-1 font-medium ${
                        isActive
                          ? "bg-[#FF6B00] text-white"
                          : "bg-[#F8F9FB] text-gray-600"
                      }`}
                    >
                      {step.label}
                    </span>
                  )}
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-gray-300" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#F8F9FB] p-3 text-xs sm:grid-cols-4">
            <div>
              <p className="text-gray-400">Requisition</p>
              <Link
                href={`/requisitions?selected=${encodeURIComponent(record.requisitionId)}`}
                className="font-semibold text-[#FF6B00] hover:underline"
              >
                {record.requisitionId}
              </Link>
            </div>
            <div>
              <p className="text-gray-400">Transfer</p>
              <Link
                href={`/transfers/${record.transferId}`}
                className="font-semibold text-[#FF6B00] hover:underline"
              >
                {record.transferId}
              </Link>
            </div>
            <div>
              <p className="text-gray-400">Dispatch</p>
              <Link
                href="/dispatch"
                className="font-semibold text-[#FF6B00] hover:underline"
              >
                {record.dispatchId}
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="h-3 w-3 text-gray-400" />
              <div>
                <p className="text-gray-400">Status</p>
                <p className="font-semibold capitalize text-[#111827]">
                  {record.status.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
