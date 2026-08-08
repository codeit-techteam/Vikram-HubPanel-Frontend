"use client";

import { useRouter } from "next/navigation";
import { useRequisitionStore } from "@/store";
import { Button } from "@/components/ui/button";
import { RequisitionStatusBadge } from "./RequisitionStatusBadge";
import { cn } from "@/lib/utils";
import type { RequisitionRequest } from "@/types";

const COLUMNS = [
  "Request ID",
  "Date",
  "Hub Location",
  "Items",
  "Value",
  "Status",
] as const;

interface RequisitionTableProps {
  onSelect?: (request: RequisitionRequest) => void;
}

export function RequisitionTable({ onSelect }: RequisitionTableProps) {
  const router = useRouter();
  const {
    requests,
    pagination,
    currentPage,
    selectedRequest,
    setCurrentPage,
    setSelectedRequest,
    openDetailModal,
  } = useRequisitionStore();

  const pageNumbers = Array.from(
    { length: pagination.totalPages },
    (_, i) => i + 1
  );

  const handleSelect = (request: RequisitionRequest) => {
    setSelectedRequest(request);
    openDetailModal();
    router.replace(`/requisitions?selected=${encodeURIComponent(request.requestId)}`, {
      scroll: false,
    });
    onSelect?.(request);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {COLUMNS.map((column) => (
                <th key={column} className="px-5 py-3">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-5 py-12 text-center text-sm text-gray-500"
                >
                  No requisitions match your filters.
                </td>
              </tr>
            ) : (
              requests.map((request) => {
                const isSelected = selectedRequest?.id === request.id;
                return (
                  <tr
                    key={request.id}
                    onClick={() => handleSelect(request)}
                    className={cn(
                      "cursor-pointer border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50",
                      isSelected && "bg-orange-50/50"
                    )}
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="text-sm font-semibold text-blue-600">
                        {request.requestId}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      {request.date}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      {request.hubLocation}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {request.items.quantity}
                      </p>
                      <p className="text-xs text-gray-400">
                        ({request.items.material})
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900">
                      {request.value}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <RequisitionStatusBadge status={request.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Showing {requests.length} of {pagination.totalOpen} open requisitions
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-600"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>

          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant="outline"
              size="sm"
              className={cn(
                "min-w-9 border-gray-200",
                currentPage === page &&
                  "border-[#FF6B00] bg-[#FF6B00] text-white hover:bg-[#E55F00] hover:text-white"
              )}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-600"
            disabled={currentPage >= pagination.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
