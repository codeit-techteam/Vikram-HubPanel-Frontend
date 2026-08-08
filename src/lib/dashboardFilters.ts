import type {
  DashboardOperationalFilter,
  OutgoingDispatch,
} from "@/types";

export const OPERATIONAL_FILTER_LABELS: Record<
  DashboardOperationalFilter,
  string
> = {
  "emergency-orders": "Emergency Orders",
  "bulk-orders": "Bulk Orders",
  "priority-members": "Priority Members",
  "ready-to-dispatch": "Orders Ready to Dispatch",
};

export function isOperationalKpi(
  kpiId: string
): kpiId is DashboardOperationalFilter {
  return kpiId in OPERATIONAL_FILTER_LABELS;
}

export function matchesOperationalFilter(
  dispatch: OutgoingDispatch,
  filter: DashboardOperationalFilter
): boolean {
  switch (filter) {
    case "emergency-orders":
      return dispatch.operational?.isEmergencyDelivery === true;
    case "bulk-orders":
      return dispatch.operational?.isBulkProcurement === true;
    case "priority-members":
      return (
        dispatch.operational?.isPriorityDelivery === true &&
        Boolean(dispatch.operational?.membershipStatus) &&
        dispatch.operational.membershipStatus !== "Non-Member"
      );
    case "ready-to-dispatch":
      return dispatch.status === "pending" && Boolean(dispatch.dispatchNo);
    default:
      return true;
  }
}

export function filterOutgoingDispatches(
  dispatches: OutgoingDispatch[],
  filter: DashboardOperationalFilter | null
): OutgoingDispatch[] {
  if (!filter) return dispatches;
  return dispatches.filter((dispatch) => matchesOperationalFilter(dispatch, filter));
}
