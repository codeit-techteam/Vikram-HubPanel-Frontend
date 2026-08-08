"use client";

import { useTransferStore } from "@/store";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Transfers are created by Central Warehouse when a requisition is dispatched.
 * Hub Panel only receives and verifies incoming transfers.
 */
export function CreateTransferModal() {
  const { isCreateOpen, closeCreate } = useTransferStore();

  return (
    <Modal
      open={isCreateOpen}
      onOpenChange={(open) => {
        if (!open) closeCreate();
      }}
      title="Create Transfer"
      description="Transfers are owned by Central Warehouse"
      className="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          New stock transfers are created when Central Warehouse dispatches your
          requisition. Use Requisitions to request materials, then receive the
          transfer when it arrives.
        </p>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={closeCreate}>
            Close
          </Button>
          <Button className="bg-[#FF6B00] hover:bg-[#E55F00]" asChild>
            <Link href="/requisitions/create" onClick={closeCreate}>
              Create Requisition
            </Link>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
