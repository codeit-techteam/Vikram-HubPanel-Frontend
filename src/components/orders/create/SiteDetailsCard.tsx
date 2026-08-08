"use client";

import { Building2, Crosshair, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateOrderStore } from "@/store/createOrderStore";
import toast from "react-hot-toast";

export function SiteDetailsCard() {
  const { siteDetails, setSiteField } = useCreateOrderStore();

  return (
    <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
            <Building2 className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <CardTitle className="text-base font-semibold text-[#111827]">
            Project & Delivery Site
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input
              placeholder="e.g. Skyline Tower Phase 2"
              value={siteDetails.projectName}
              onChange={(e) => setSiteField("projectName", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Site Name / Landmark *</Label>
            <Input
              placeholder="e.g. DLF Phase 5 Construction"
              value={siteDetails.siteName}
              onChange={(e) => setSiteField("siteName", e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Delivery Address *</Label>
          <Textarea
            placeholder="Full street address..."
            value={siteDetails.deliveryAddress}
            onChange={(e) => setSiteField("deliveryAddress", e.target.value)}
            className="min-h-[80px] rounded-xl"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Pin Code</Label>
            <Input
              placeholder="110001"
              value={siteDetails.pinCode}
              onChange={(e) => setSiteField("pinCode", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              placeholder="New Delhi"
              value={siteDetails.city}
              onChange={(e) => setSiteField("city", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input
              placeholder="Delhi"
              value={siteDetails.state}
              onChange={(e) => setSiteField("state", e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="absolute inset-0 opacity-30">
            <div className="grid h-full grid-cols-6 grid-rows-4 gap-px p-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="rounded bg-slate-600/40" />
              ))}
            </div>
          </div>
          <div className="relative flex min-h-[140px] flex-col items-center justify-center gap-3 p-6">
            <MapPin className="h-8 w-8 text-[#FF6B00]" />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-lg bg-white/90 text-gray-900 hover:bg-white"
              onClick={() => toast("Map picker opened (mock).")}
            >
              <Crosshair className="mr-2 h-4 w-4" />
              Select from Map
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Special Delivery Instructions</Label>
          <Textarea
            placeholder="Gate pass requirements, unloading constraints, etc."
            value={siteDetails.specialInstructions}
            onChange={(e) =>
              setSiteField("specialInstructions", e.target.value)
            }
            className="min-h-[72px] rounded-xl"
          />
        </div>
      </CardContent>
    </Card>
  );
}
