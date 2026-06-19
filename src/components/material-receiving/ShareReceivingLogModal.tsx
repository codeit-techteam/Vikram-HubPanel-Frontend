"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMaterialReceivingStore } from "@/store";

export function ShareReceivingLogModal() {
  const { isShareOpen, closeShare, shareUrl, receivingRecord } =
    useMaterialReceivingStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Receiving log link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      open={isShareOpen}
      onOpenChange={(open) => !open && closeShare()}
      title="Share Log"
      description="Share this receiving log with stakeholders."
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
              {receivingRecord?.transferNumber}
            </p>
            <p className="text-xs text-gray-500">Shareable receiving log URL</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            readOnly
            value={shareUrl}
            className="rounded-xl border-[#E5E7EB] bg-[#F8F9FB] text-sm"
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              onClick={handleCopy}
              disabled={!shareUrl}
              className="shrink-0 gap-2 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
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
