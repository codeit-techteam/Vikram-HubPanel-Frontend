"use client";

import { useState } from "react";
import { CheckCircle2, KeyRound, MapPin, ShieldCheck, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { ordersService } from "@/services/orders.service";
import { getApiErrorMessage } from "@/services/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HubOrder } from "@/types";

interface DeliveryCompletionCardProps {
  order: HubOrder;
  onUpdated: (order: HubOrder) => void;
}

export function DeliveryCompletionCard({
  order,
  onUpdated,
}: DeliveryCompletionCardProps) {
  const delivery = order.delivery;
  const isDelivered = order.status === "delivered";
  const reached = Boolean(delivery?.driverReachedAt);
  const otpGenerated = Boolean(delivery?.deliveryOtpGenerated);
  const otpVerified = Boolean(delivery?.deliveryOtpVerified) || isDelivered;

  const [busy, setBusy] = useState<string | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const refresh = async () => {
    const updated = await ordersService.getOrderById(order.id);
    if (updated) onUpdated(updated);
  };

  const handleMarkReached = async () => {
    setBusy("reached");
    try {
      const updated = await ordersService.markDriverReached(order.id);
      if (updated) onUpdated(updated);
      toast.success("Driver marked as reached");
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Failed to mark driver reached");
    } finally {
      setBusy(null);
    }
  };

  const handleGenerateOtp = async () => {
    setBusy("otp");
    try {
      await ordersService.generateDeliveryOtp(order.id);
      await refresh();
      toast.success("Generated Successfully. Customer receives OTP.");
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Failed to generate OTP");
    } finally {
      setBusy(null);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError("Enter a valid 6-digit OTP");
      return;
    }
    setBusy("verify");
    setOtpError(null);
    try {
      const updated = await ordersService.verifyDeliveryOtp(order.id, otp.trim());
      if (updated) onUpdated(updated);
      setVerifyOpen(false);
      setOtp("");
      toast.success("OTP Verified Successfully");
    } catch (err) {
      setOtpError(getApiErrorMessage(err) || "Invalid OTP");
    } finally {
      setBusy(null);
    }
  };

  const handleComplete = async () => {
    setBusy("complete");
    try {
      const updated = await ordersService.completeDelivery(order.id);
      if (updated) onUpdated(updated);
      toast.success("Delivery completed");
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Failed to complete delivery");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-[#FF6B00]" />
            Delivery Completion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow
              label="Current Status"
              value={isDelivered ? "Delivered" : "Out For Delivery"}
            />
            <InfoRow label="Driver" value={delivery?.driverName || "—"} />
            <InfoRow label="Vehicle" value={delivery?.vehicleNumber || "—"} />
            <InfoRow
              label="Reached Customer"
              value={reached ? "Yes" : "Not yet"}
            />
          </div>

          <div className="rounded-xl bg-[#F8F9FB] px-4 py-3">
            <p className="text-xs text-gray-400">Customer OTP</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">
              {otpVerified
                ? "Verified"
                : otpGenerated
                  ? "Generated — Waiting for OTP Verification"
                  : "Not Generated"}
            </p>
            {otpGenerated && !otpVerified && (
              <p className="mt-1 text-xs text-gray-500">
                OTP sent to the customer&apos;s registered phone number.
              </p>
            )}
          </div>

          {otpGenerated && !isDelivered && (
            <div className="space-y-1">
              <p className="text-xs text-gray-400">Delivery Verification Link</p>
              <a
                href={delivery?.deliveryVerificationLink}
                target="_blank"
                rel="noreferrer"
                className="break-all text-sm font-medium text-[#FF6B00] hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  toast("Verification page coming soon — use Verify Delivery OTP");
                  setVerifyOpen(true);
                }}
              >
                {delivery?.deliveryVerificationLink}
              </a>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              className="gap-2 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
              disabled={reached || isDelivered || busy !== null}
              onClick={handleMarkReached}
            >
              <MapPin className="h-4 w-4" />
              {busy === "reached" ? "Updating..." : "Mark Reached"}
            </Button>

            <Button
              variant="outline"
              className="gap-2 rounded-xl border-[#E5E7EB]"
              disabled={!reached || otpGenerated || isDelivered || busy !== null}
              onClick={handleGenerateOtp}
            >
              <KeyRound className="h-4 w-4" />
              {busy === "otp" ? "Generating..." : "Generate OTP"}
            </Button>

            <Button
              variant="outline"
              className="gap-2 rounded-xl border-[#E5E7EB]"
              disabled={!otpGenerated || otpVerified || isDelivered || busy !== null}
              onClick={() => {
                setOtp("");
                setOtpError(null);
                setVerifyOpen(true);
              }}
            >
              <ShieldCheck className="h-4 w-4" />
              Verify Delivery OTP
            </Button>

            <Button
              className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700"
              disabled={!otpVerified || isDelivered || busy !== null}
              onClick={handleComplete}
            >
              <CheckCircle2 className="h-4 w-4" />
              {busy === "complete" ? "Completing..." : "Complete Delivery"}
            </Button>
          </div>

          {isDelivered && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <Truck className="h-4 w-4" />
              Delivery completed
              {delivery?.deliveryCompletedAt
                ? ` · ${new Date(delivery.deliveryCompletedAt).toLocaleString("en-IN")}`
                : ""}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Delivery OTP</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Enter OTP
            </Label>
            <Input
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                setOtpError(null);
              }}
              placeholder="XXXXXX"
              className="h-12 rounded-xl text-center text-lg tracking-[0.4em]"
              maxLength={6}
              inputMode="numeric"
              autoFocus
            />
            {otpError && (
              <p className="text-sm text-red-600">{otpError}</p>
            )}
            <p className="text-xs text-gray-400">
              Ask the customer for the 6-digit OTP sent to their phone.
            </p>
            {process.env.NODE_ENV !== "production" && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                Dev OTP: use <span className="font-mono">123456</span>
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setVerifyOpen(false)}
              disabled={busy === "verify"}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
              onClick={handleVerifyOtp}
              disabled={busy === "verify"}
            >
              {busy === "verify" ? "Verifying..." : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium text-[#111827]">{value}</p>
    </div>
  );
}
