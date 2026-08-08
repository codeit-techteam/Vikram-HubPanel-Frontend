"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTransferStore } from "@/store";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function ShareTrackingModal() {
  const { isShareOpen, closeShare, selectedTransfer, shareUrl, shareTransfer } =
    useTransferStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isShareOpen && selectedTransfer) {
      shareTransfer(selectedTransfer.transferId);
    }
  }, [isShareOpen, selectedTransfer, shareTransfer]);

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Tracking link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      open={isShareOpen}
      onOpenChange={(open) => !open && closeShare()}
      title="Share Tracking"
      description="Share this link to allow real-time tracking of the transfer."
      className="max-w-md"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6B00]">
            <Link2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">
              {selectedTransfer?.transferId}
            </p>
            <p className="text-xs text-gray-500">Live tracking URL</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            readOnly
            value={shareUrl}
            placeholder="Generating tracking link..."
            className="rounded-xl border-[#E5E7EB] bg-[#F8F9FB] text-sm"
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              onClick={handleCopy}
              disabled={!shareUrl}
              className="shrink-0 gap-2 rounded-xl"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copy
            </Button>
          </motion.div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={closeShare}>
            Done
          </Button>
        </div>
      </motion.div>
    </Modal>
  );
}
