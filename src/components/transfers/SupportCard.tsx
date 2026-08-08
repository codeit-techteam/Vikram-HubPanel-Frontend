"use client";

import { motion } from "framer-motion";
import { Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SupportCardProps {
  siteId?: string;
}

export function SupportCard({ siteId = "CN-7821" }: SupportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-sm">
        <CardContent className="flex flex-col items-center px-6 py-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Headphones className="h-5 w-5 text-gray-500" />
          </div>
          <h3 className="text-base font-semibold text-[#111827]">Need help?</h3>
          <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-gray-500">
            Our logistics support team is available 24/7 for operational
            assistance.
          </p>
          <motion.div
            className="mt-5 w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="h-11 w-full rounded-xl border-[#FF6B00] text-sm font-semibold text-[#FF6B00] hover:bg-orange-50"
            >
              Contact Site ID: {siteId}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
