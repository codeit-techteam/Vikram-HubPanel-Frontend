import { useQuery } from "@tanstack/react-query";

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      const { analyticsService } = await import("@/services/analytics.service");
      return analyticsService.getDashboardAnalytics();
    },
  });
}
