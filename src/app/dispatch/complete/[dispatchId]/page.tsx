"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Camera, CheckCircle2, PenLine } from "lucide-react";
import toast from "react-hot-toast";
import { dispatchService } from "@/services/dispatch.service";
import { useDeliveryStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { DeliveryRecord, DispatchRecord } from "@/types";

export default function DeliveryConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const dispatchId = params.dispatchId as string;
  const { loadDelivery, markDelivered, isSubmitting, reportIssue } =
    useDeliveryStore();

  const [dispatch, setDispatch] = useState<DispatchRecord | null>(null);
  const [delivery, setDelivery] = useState<DeliveryRecord | null>(null);
  const [otp, setOtp] = useState("");
  const [signature, setSignature] = useState("");
  const [notes, setNotes] = useState("");
  const [photoProof, setPhotoProof] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const d = await dispatchService.getById(dispatchId);
      setDispatch(d ?? null);
      const del = await loadDelivery(dispatchId);
      setDelivery(del ?? null);
      setLoading(false);
    }
    if (dispatchId) load();
  }, [dispatchId, loadDelivery]);

  const handleMarkDelivered = async () => {
    if (!otp.trim()) {
      toast.error("Please enter customer OTP");
      return;
    }
    const result = await markDelivered(dispatchId, {
      otp,
      signature,
      photoProof,
      notes,
    });
    if (result) {
      router.push(`/dispatch/${dispatchId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  if (!dispatch) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-500">Dispatch not found.</p>
        <Button variant="outline" asChild>
          <Link href="/dispatch">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-2xl space-y-6 pb-8"
    >
      <div>
        <button
          type="button"
          onClick={() => router.push(`/dispatch/${dispatch.dispatchNo}`)}
          className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#FF6B00]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dispatch
        </button>
        <h1 className="text-2xl font-bold text-[#111827]">Delivery Confirmation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Finalize delivery and generate proof of delivery
        </p>
      </div>

      <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Dispatch Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-400">Dispatch ID</p>
            <p className="font-semibold">{dispatch.dispatchNo}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Order</p>
            <p className="font-semibold">{dispatch.orderNo}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Customer</p>
            <p className="font-semibold">{dispatch.customer}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Delivery Timestamp</p>
            <p className="font-semibold">{new Date().toLocaleString("en-IN")}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Customer OTP
            </Label>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder={delivery?.otp ? "Enter OTP from customer" : "Enter OTP"}
              className="h-11 rounded-xl"
              maxLength={4}
            />
            {delivery?.otp && (
              <p className="text-xs text-gray-400">
                Demo OTP: {delivery.otp}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <PenLine className="h-3.5 w-3.5" />
              Customer Signature
            </Label>
            <Input
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Customer name for signature"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Camera className="h-3.5 w-3.5" />
              Photo Proof Upload
            </Label>
            <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-[#E5E7EB] bg-[#F8F9FB]">
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-[#FF6B00]"
                onClick={() => {
                  setPhotoProof("delivery-photo-mock.jpg");
                  toast.success("Photo uploaded (mock)");
                }}
              >
                {photoProof || "Tap to upload delivery photo"}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Delivery Notes
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any delivery remarks..."
              className="min-h-[80px] rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          className="h-12 flex-1 gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700"
          disabled={isSubmitting}
          onClick={handleMarkDelivered}
        >
          <CheckCircle2 className="h-4 w-4" />
          {isSubmitting ? "Processing..." : "Mark Delivered"}
        </Button>
        <Button
          variant="outline"
          className="h-12 flex-1 gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => reportIssue(dispatch.dispatchNo, "Delivery issue at site")}
        >
          <AlertTriangle className="h-4 w-4" />
          Raise Delivery Issue
        </Button>
      </div>
    </motion.div>
  );
}
