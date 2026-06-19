"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReceivingDocument } from "@/types";
import { useMaterialReceivingStore } from "@/store";
import { cn } from "@/lib/utils";

interface ReceivingDocumentsUploaderProps {
  documents: ReceivingDocument[];
}

const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_SIZE_MB = 25;

export function ReceivingDocumentsUploader({
  documents,
}: ReceivingDocumentsUploaderProps) {
  const { addDocument, removeDocument } = useMaterialReceivingStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => {
        const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
        if (!ACCEPTED_EXTENSIONS.includes(ext)) return;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) return;
        addDocument(file);
      });
    },
    [addDocument]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.14 }}
    >
      <Card className="h-full rounded-2xl border-[#E5E7EB] bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#111827]">
            <FileText className="h-4 w-4 text-[#FF6B00]" />
            Receiving Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            whileHover={{ borderColor: "#FF6B00", backgroundColor: "#FFF4EC" }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-[#F8F9FB] px-6 py-10 transition-colors",
              isDragging && "border-[#FF6B00] bg-orange-50"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <Upload className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <p className="text-center text-sm font-medium text-[#111827]">
              Upload signed GRN or Gate Pass
            </p>
            <p className="mt-1 text-center text-xs text-gray-400">
              PDF, DOC · UP TO {MAX_SIZE_MB}MB
            </p>
          </motion.div>

          {documents.length > 0 && (
            <div className="space-y-2">
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                      <FileText className="h-4 w-4 text-[#FF6B00]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#111827]">
                        {doc.name}
                      </p>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                        {doc.size} · Uploaded {doc.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.id)}
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#EF4444]",
                      "transition-colors hover:bg-red-50"
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
