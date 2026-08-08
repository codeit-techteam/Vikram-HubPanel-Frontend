"use client";

import { motion } from "framer-motion";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsExportActionsProps {
  onExportExcel: () => void;
  onDownloadPDF: () => void;
  exporting?: boolean;
}

export function AnalyticsExportActions({
  onExportExcel,
  onDownloadPDF,
  exporting = false,
}: AnalyticsExportActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          className="gap-2 border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F8F9FB]"
          onClick={onExportExcel}
          disabled={exporting}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          className="gap-2 bg-[#FF6B00] hover:bg-[#E55F00]"
          onClick={onDownloadPDF}
          disabled={exporting}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </motion.div>
    </div>
  );
}
