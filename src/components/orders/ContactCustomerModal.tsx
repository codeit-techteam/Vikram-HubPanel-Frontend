"use client";

import { Mail, MessageCircle, Phone, User } from "lucide-react";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";

export interface ContactCustomerInfo {
  name: string;
  type?: string;
  phone?: string;
  email?: string;
}

interface ContactCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: ContactCustomerInfo;
  orderNo?: string;
}

export function ContactCustomerModal({
  open,
  onOpenChange,
  customer,
  orderNo,
}: ContactCustomerModalProps) {
  const phoneDigits = customer.phone?.replace(/\s/g, "").replace(/^\+/, "") ?? "";

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Contact Customer"
      description={
        orderNo
          ? `Reach out regarding order ${orderNo}`
          : "Choose how you'd like to contact this customer"
      }
      className="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-[#F8F9FB] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6B00]/10">
            <User className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <div>
            <p className="font-semibold text-[#111827]">{customer.name}</p>
            {customer.type && (
              <p className="text-xs text-gray-500">{customer.type}</p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          {customer.phone ? (
            <Button
              variant="outline"
              className="h-11 justify-start gap-3 rounded-xl border-[#E5E7EB]"
              asChild
            >
              <a href={`tel:${customer.phone.replace(/\s/g, "")}`}>
                <Phone className="h-4 w-4 text-[#FF6B00]" />
                Call {customer.phone}
              </a>
            </Button>
          ) : (
            <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
              No phone number on file
            </p>
          )}

          {customer.email ? (
            <Button
              variant="outline"
              className="h-11 justify-start gap-3 rounded-xl border-[#E5E7EB]"
              asChild
            >
              <a href={`mailto:${customer.email}?subject=Regarding Order ${orderNo ?? ""}`}>
                <Mail className="h-4 w-4 text-[#FF6B00]" />
                Email {customer.email}
              </a>
            </Button>
          ) : null}

          {phoneDigits ? (
            <Button
              variant="outline"
              className="h-11 justify-start gap-3 rounded-xl border-[#E5E7EB]"
              asChild
            >
              <a
                href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(
                  `Hello ${customer.name}, regarding your order ${orderNo ?? ""} from HubOps Central.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                WhatsApp Message
              </a>
            </Button>
          ) : null}
        </div>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}
