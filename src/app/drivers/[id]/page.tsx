"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Star,
  Truck,
  MapPin,
  FileText,
  Award,
} from "lucide-react";
import { driverService } from "@/services/driver.service";
import { fleetService } from "@/services/fleet.service";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DriverStatusBadge } from "@/components/drivers/DriverStatusBadge";
import { DriverContactActions } from "@/components/drivers/DriverContactActions";
import { useDriverStore } from "@/store";
import type { DispatchDriver, DispatchVehicle } from "@/types";

export default function DriverProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { openEditModal } = useDriverStore();
  const [driver, setDriver] = useState<DispatchDriver | null>(null);
  const [vehicle, setVehicle] = useState<DispatchVehicle | null>(null);
  const [loading, setLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const d = await driverService.getDriverById(id);
      setDriver(d ?? null);
      if (d?.assignedVehicle && d.assignedVehicle !== "—") {
        const v = await fleetService.getVehicleById(d.assignedVehicle);
        setVehicle(v ?? null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Driver not found</p>
        <Button variant="outline" onClick={() => router.push("/drivers")}>
          Back to Drivers
        </Button>
      </div>
    );
  }

  const initials = driver.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link href="/drivers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={driver.name}
          description={`License: ${driver.licenseNumber ?? driver.licenseNo ?? "—"}`}
          actions={
            <Button
              onClick={() => openEditModal(driver)}
              className="rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
            >
              Edit Driver
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-[#E5E7EB]">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-50 text-2xl font-bold text-[#FF6B00]">
              {initials}
            </div>
            <h2 className="mt-4 text-xl font-bold text-[#111827]">{driver.name}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {driver.rating} Rating
            </p>
            <div className="mt-3">
              <DriverStatusBadge status={driver.status} />
            </div>
            <p className="mt-4 text-sm text-gray-600">
              {driver.mobile ?? driver.phone}
            </p>
            <div className="mt-4 w-full">
              <DriverContactActions driver={driver} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-[#FF6B00]" />
              Driver Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Email" value={driver.email ?? "—"} />
              <DetailItem
                label="Alternate Number"
                value={driver.alternateMobile ?? "—"}
              />
              <DetailItem label="Blood Group" value={driver.bloodGroup ?? "—"} />
              <DetailItem label="Joining Date" value={driver.joiningDate ?? "—"} />
              <DetailItem label="Assigned Hub" value={driver.assignedHub ?? "—"} />
              <DetailItem
                label="License Expiry"
                value={driver.licenseExpiry ?? "—"}
              />
              <DetailItem
                label="Emergency Contact"
                value={driver.emergencyContactName ?? "—"}
              />
              <DetailItem
                label="Emergency Number"
                value={driver.emergencyContactNumber ?? "—"}
              />
              <DetailItem label="Address" value={driver.address ?? "—"} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Award className="h-5 w-5 text-[#FF6B00]" />}
          label="Trips Completed"
          value={String(driver.completedTrips ?? 0)}
        />
        <StatCard
          icon={<MapPin className="h-5 w-5 text-[#FF6B00]" />}
          label="Total Distance"
          value={`${(driver.totalDistance ?? 0).toLocaleString()} km`}
        />
        <StatCard
          icon={<Star className="h-5 w-5 text-[#FF6B00]" />}
          label="Performance Rating"
          value={`${driver.performanceScore ?? "—"}%`}
        />
        <StatCard
          icon={<Award className="h-5 w-5 text-[#FF6B00]" />}
          label="Delivery Success Rate"
          value={`${driver.deliverySuccessRate ?? "—"}%`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-5 w-5 text-[#FF6B00]" />
              Current Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailItem
              label="Assigned Vehicle"
              value={driver.assignedVehicle ?? "—"}
            />
            <DetailItem
              label="Current Trip"
              value={driver.currentTrip ?? "None"}
              highlight
            />
            {vehicle && (
              <Button variant="outline" asChild className="mt-2 rounded-xl">
                <Link href={`/fleet/${vehicle.id}`}>
                  View Vehicle Profile
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-[#FF6B00]" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DocumentItem
              label="Driving License"
              uploaded={!!driver.documents?.license}
            />
            <DocumentItem label="Aadhaar" uploaded={!!driver.documents?.aadhaar} />
            <DocumentItem
              label="Driver Photo"
              uploaded={!!driver.documents?.photo}
            />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function DetailItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-medium ${highlight ? "text-[#FF6B00]" : "text-[#111827]"}`}
      >
        {value}
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-2xl border-[#E5E7EB]">
      <CardContent className="p-5">
        <div className="flex items-center gap-2">{icon}</div>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="mt-1 text-xl font-bold text-[#111827]">{value}</p>
      </CardContent>
    </Card>
  );
}

function DocumentItem({
  label,
  uploaded,
}: {
  label: string;
  uploaded: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`text-xs font-semibold ${uploaded ? "text-emerald-600" : "text-gray-400"}`}
      >
        {uploaded ? "Uploaded" : "Not uploaded"}
      </span>
    </div>
  );
}
