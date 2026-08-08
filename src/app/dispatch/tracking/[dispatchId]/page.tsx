"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Live tracking is not used — redirect to dispatch details for hub-managed updates. */
export default function DeliveryTrackingRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const dispatchId = params.dispatchId as string;

  useEffect(() => {
    if (dispatchId) {
      router.replace(`/dispatch/${dispatchId}`);
    }
  }, [dispatchId, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
    </div>
  );
}
