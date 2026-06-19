"use client";

import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DispatchDriver } from "@/types";

interface DriverContactActionsProps {
  driver: Pick<DispatchDriver, "name" | "mobile" | "phone">;
  compact?: boolean;
}

function normalizePhone(phone?: string): string {
  if (!phone) return "";
  return phone.replace(/[\s\-()]/g, "");
}

export function DriverContactActions({
  driver,
  compact = false,
}: DriverContactActionsProps) {
  const phone = normalizePhone(driver.mobile ?? driver.phone);
  const hasPhone = phone.length > 0;

  const handleCall = () => {
    if (hasPhone) window.open(`tel:${phone}`, "_self");
  };

  const handleWhatsApp = () => {
    if (!hasPhone) return;
    const waNumber = phone.startsWith("+") ? phone.slice(1) : `91${phone}`;
    window.open(`https://wa.me/${waNumber}`, "_blank");
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
          onClick={handleCall}
          disabled={!hasPhone}
          title="Call"
        >
          <Phone className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-green-600 hover:bg-green-50"
          onClick={handleWhatsApp}
          disabled={!hasPhone}
          title="WhatsApp"
        >
          <MessageCircle className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        onClick={handleCall}
        disabled={!hasPhone}
        className="h-9 gap-2 rounded-xl bg-[#FF6B00] text-sm font-semibold hover:bg-[#E55F00]"
      >
        <Phone className="h-4 w-4" />
        Call
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={handleWhatsApp}
        disabled={!hasPhone}
        className="h-9 gap-2 rounded-xl border-green-200 text-green-700 hover:bg-green-50"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Button>
    </div>
  );
}
