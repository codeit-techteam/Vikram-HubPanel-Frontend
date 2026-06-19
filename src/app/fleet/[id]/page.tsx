"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Truck,
  User,
  Wrench,
  FileText,
  Shield,
} from "lucide-react";
import { fleetService } from "@/services/fleet.service";
import { driverService } from "@/services/driver.service";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VehicleStatusBadge } from "@/components/fleet/VehicleStatusBadge";
import { DriverContactActions } from "@/components/drivers/DriverContactActions";
import { useFleetStore } from "@/store";
import type { DispatchDriver, DispatchVehicle } from "@/types";

export default function VehicleProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { openEditModal } = useFleetStore();
  const [vehicle, setVehicle] = useState<DispatchVehicle | null>(null);
  const [driver, setDriver] = useState<DispatchDriver | null>(null);
  const [loading, setLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const v = await fleetService.getVehicleById(id);
      setVehicle(v ?? null);
      if (v?.driverId) {
        const d = await driverService.getDriverById(v.driverId);
        setDriver(d ?? null);
      } else if (v?.assignedDriver && v.assignedDriver !== "—") {
        const d = await driverService.getDriverById(v.assignedDriver);
        setDriver(d ?? null);
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

  if (!vehicle) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Vehicle not found</p>
        <Button variant="outline" onClick={() => router.push("/fleet")}>
          Back to Fleet
        </Button>
      </div>
    );
  }

  const vehicleNo = vehicle.vehicleNumber ?? vehicle.registrationNo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link href="/fleet">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={vehicleNo}
          description={`${vehicle.type ?? "Truck"} · ${vehicle.capacity}`}
          actions={
            <Button
              onClick={() => openEditModal(vehicle)}
              className="rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
            >
              Edit Vehicle
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-[#E5E7EB] lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-5 w-5 text-[#FF6B00]" />
              Vehicle Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Vehicle Number" value={vehicleNo} />
              <DetailItem label="Type" value={vehicle.type ?? "—"} />
              <DetailItem label="Capacity" value={vehicle.capacity} />
              <DetailItem label="Fuel Type" value={vehicle.fuelType ?? "—"} />
              <DetailItem label="Assigned Hub" value={vehicle.assignedHub ?? "—"} />
              <DetailItem
                label="GPS"
                value={vehicle.gpsEnabled ? "Enabled" : "Disabled"}
              />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Status
                </p>
                <div className="mt-1">
                  <VehicleStatusBadge status={vehicle.status} />
                </div>
              </div>
              <DetailItem
                label="Current Trip"
                value={vehicle.currentTrip ?? "None"}
                highlight
              />
              <DetailItem label="Trips Today" value={String(vehicle.tripsToday ?? 0)} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-[#FF6B00]" />
              Assigned Driver
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {driver ? (
              <>
                <div>
                  <p className="text-lg font-bold text-[#111827]">{driver.name}</p>
                  <p className="text-sm text-gray-500">
                    {driver.mobile ?? driver.phone}
                  </p>
                </div>
                <DriverContactActions driver={driver} />
              </>
            ) : (
              <p className="text-sm text-gray-500">
                {vehicle.assignedDriver ?? "No driver assigned"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-[#FF6B00]" />
              Insurance & RC
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="RC Number" value={vehicle.rcNumber ?? "—"} />
            <DetailItem label="RC Expiry" value={vehicle.rcExpiry ?? "—"} />
            <DetailItem
              label="Insurance Number"
              value={vehicle.insuranceNumber ?? "—"}
            />
            <DetailItem
              label="Insurance Expiry"
              value={vehicle.insuranceExpiry ?? "—"}
            />
            <DetailItem
              label="Fitness Expiry"
              value={vehicle.fitnessExpiry ?? "—"}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="h-5 w-5 text-[#FF6B00]" />
              Maintenance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(vehicle.maintenanceHistory ?? []).length > 0 ? (
              <div className="space-y-3">
                {vehicle.maintenanceHistory!.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-xl border border-[#E5E7EB] px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{record.type}</p>
                      <p className="text-xs text-gray-400">{record.date}</p>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {record.description}
                    </p>
                    {record.cost && (
                      <p className="mt-1 text-xs font-medium text-[#FF6B00]">
                        ₹{record.cost.toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No maintenance records</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-[#FF6B00]" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <DocumentItem label="RC Document" uploaded={!!vehicle.documents?.rc} />
            <DocumentItem
              label="Insurance Document"
              uploaded={!!vehicle.documents?.insurance}
            />
          </div>
          {vehicle.remarks && (
            <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Remarks
              </p>
              <p className="mt-1 text-sm text-gray-600">{vehicle.remarks}</p>
            </div>
          )}
        </CardContent>
      </Card>
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
