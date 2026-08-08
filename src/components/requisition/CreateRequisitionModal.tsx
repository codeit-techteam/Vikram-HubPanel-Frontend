"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequisitionStore } from "@/store";

/**
 * Legacy modal entrypoint — redirects to the API-backed create page.
 */
export function CreateRequisitionModal() {
  const router = useRouter();
  const { isCreateModalOpen, closeCreateModal } = useRequisitionStore();

  useEffect(() => {
    if (!isCreateModalOpen) return;
    closeCreateModal();
    router.push("/requisitions/create");
  }, [isCreateModalOpen, closeCreateModal, router]);

  return null;
}
