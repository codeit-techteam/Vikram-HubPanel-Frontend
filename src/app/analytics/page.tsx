"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/page-header";
import { DashboardSkeleton } from "@/components/common/loading-skeleton";
import {
  DispatchTrendChart,
  HubEfficiencyChart,
  InventoryTrendChart,
  MaterialFlowChart,
  MonthlyPerformanceChart,
  RequisitionTrendChart,
} from "@/components/charts/dashboard-charts";
import { analyticsService } from "@/services/analytics.service";
import { DateRangePicker } from "@/components/filters/date-range-picker";
import { useDashboardStore } from "@/store";
import { DateRange } from "react-day-picker";

export default function AnalyticsPage() {
  const { dateRange, setDateRange } = useDashboardStore();

  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => analyticsService.getDashboardAnalytics(),
  });

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange({
      from: range?.from,
      to: range?.to,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hub Performance"
        description="Analytics and performance metrics across all hubs"
        actions={
          <DateRangePicker
            dateRange={
              dateRange.from
                ? { from: dateRange.from, to: dateRange.to }
                : undefined
            }
            onDateRangeChange={handleDateChange}
          />
        }
      />
      {isLoading || !data ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <InventoryTrendChart data={data.inventoryTrend} />
            <RequisitionTrendChart data={data.requisitionTrend} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <DispatchTrendChart data={data.dispatchTrend} />
            <MonthlyPerformanceChart data={data.monthlyPerformance} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <HubEfficiencyChart data={data.hubEfficiency} />
            <MaterialFlowChart data={data.materialFlow} />
          </div>
        </>
      )}
    </div>
  );
}
