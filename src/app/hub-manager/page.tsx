"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  UserRound,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hubService } from "@/services/hub.service";
import { formatNumber } from "@/lib/utils";

export default function HubManagerPage() {
  const { data: hub, isLoading, error } = useQuery({
    queryKey: ["assigned-hub"],
    queryFn: () => hubService.getAssignedHub(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Hub"
        description="Live profile for your assigned hub"
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings">Edit contact details</Link>
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton />
      ) : error || !hub ? (
        <Card className="rounded-2xl border-red-100">
          <CardContent className="py-10 text-center text-sm text-red-600">
            Unable to load hub profile. Please try again.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-2xl border-[#E5E7EB] shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Hub Code
                </p>
                <CardTitle className="mt-1 text-2xl text-[#111827]">
                  {hub.name}
                </CardTitle>
                <p className="mt-1 font-mono text-sm text-[#FF6B00]">
                  {hub.code}
                </p>
              </div>
              <StatusBadge status={hub.status} />
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Detail
                icon={MapPin}
                label="Location"
                value={`${hub.city}, ${hub.state}`}
              />
              <Detail
                icon={Building2}
                label="Address"
                value={hub.location || "—"}
              />
              <Detail
                icon={UserRound}
                label="Manager"
                value={hub.manager}
              />
              <Detail
                icon={Warehouse}
                label="Capacity"
                value={
                  hub.capacity > 0 ? formatNumber(hub.capacity) : "Not set"
                }
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Quick links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/inventory">View inventory</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/transfers">Incoming transfers</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard">Operations dashboard</Link>
              </Button>
              <p className="pt-2 text-xs text-gray-500">
                Creating or editing hubs is handled by Central Admin. This
                panel only shows your assigned hub.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone | typeof Mail | typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-gray-500 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
