"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, MapPin } from "lucide-react";
import type { IncomingTransfer } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TransferStatusBadge } from "./TransferStatusBadge";
import { cn } from "@/lib/utils";

interface TransferCardProps {
  transfer: IncomingTransfer;
  index?: number;
}

export function TransferCard({ transfer, index = 0 }: TransferCardProps) {
  const isReceived = transfer.status === "received";
  const isReady = transfer.status === "ready";
  const isDelayed = transfer.isDelayed || transfer.status === "delayed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="mb-4 flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-[#FF6B00]">
              {transfer.transferId}
            </h3>
            <TransferStatusBadge status={transfer.status} />
          </div>

          <div
            className={cn(
              "mb-4 flex items-center gap-2 text-sm",
              isDelayed ? "text-red-600" : "text-gray-600"
            )}
          >
            {isDelayed ? (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            ) : (
              <Clock className="h-4 w-4 shrink-0 text-gray-400" />
            )}
            <span className="font-medium">
              {transfer.etaDisplay}
              {isDelayed && " (Delayed)"}
            </span>
          </div>

          <div className="mb-4 flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
              <span className="my-1 h-8 w-px bg-gray-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B00]" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Source
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {transfer.source}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Destination
                </p>
                <p className="flex items-center gap-1 text-sm font-medium text-gray-900">
                  <MapPin className="h-3.5 w-3.5 text-[#FF6B00]" />
                  {transfer.destination}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Vehicle
              </p>
              <p
                className={cn(
                  "mt-0.5 text-sm font-medium",
                  isReady ? "text-gray-400" : "text-gray-900"
                )}
              >
                {transfer.vehicle}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Driver
              </p>
              <p
                className={cn(
                  "mt-0.5 text-sm font-medium",
                  isReady ? "text-gray-400" : "text-gray-900"
                )}
              >
                {transfer.driver.name}
              </p>
              {!isReady && transfer.driver.phone !== "—" && (
                <p className="text-xs text-gray-500">{transfer.driver.phone}</p>
              )}
            </div>
          </div>

          <div className="mb-5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Materials
            </p>
            <div className="flex flex-wrap gap-2">
              {transfer.materials.map((material) => (
                <span
                  key={material.id}
                  className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                >
                  {material.quantity}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-gray-200"
              asChild
            >
              <Link href={`/transfers/${transfer.transferId}`}>
                View Transfer
              </Link>
            </Button>
            <Button
              className="flex-1 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
              disabled={isReceived || isReady}
              asChild
            >
              <Link href={`/material-receiving/${transfer.transferId}`}>
                Receive Material
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
