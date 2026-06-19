"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, ImagePlus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReceivingPhoto } from "@/types";
import { useMaterialReceivingStore } from "@/store";
import { cn } from "@/lib/utils";

interface DeliveryPhotoUploaderProps {
  photos: ReceivingPhoto[];
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE_MB = 10;

export function DeliveryPhotoUploader({ photos }: DeliveryPhotoUploaderProps) {
  const { addPhoto, removePhoto } = useMaterialReceivingStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) return;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) return;
        addPhoto(file);
      });
    },
    [addPhoto]
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
      transition={{ duration: 0.35, delay: 0.12 }}
    >
      <Card className="h-full rounded-2xl border-[#E5E7EB] bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#111827]">
            <Camera className="h-4 w-4 text-[#FF6B00]" />
            Delivery Photos
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
              accept=".jpeg,.jpg,.png"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <ImagePlus className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <p className="text-center text-sm font-medium text-[#111827]">
              Drag and drop or click to upload
            </p>
            <p className="mt-1 text-center text-xs text-gray-400">
              JPEG, PNG · UP TO {MAX_SIZE_MB}MB
            </p>
          </motion.div>

          {photos.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative h-24 w-24 overflow-hidden rounded-xl border border-[#E5E7EB]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
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