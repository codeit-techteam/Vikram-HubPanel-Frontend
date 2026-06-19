"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartDataPoint } from "@/types";

const COLORS = ["#FF6B00", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, children, className }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function InventoryTrendChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Inventory Trend">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#FF6B00"
            fill="#FFF4EC"
            name="Total Inventory"
          />
          <Area
            type="monotone"
            dataKey="inbound"
            stroke="#10B981"
            fill="#D1FAE5"
            name="Inbound"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function RequisitionTrendChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Requisition Trend">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="approved" fill="#10B981" name="Approved" radius={[4, 4, 0, 0]} />
          <Bar dataKey="rejected" fill="#EF4444" name="Rejected" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DispatchTrendChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Dispatch Trend">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="onTime"
            stroke="#10B981"
            strokeWidth={2}
            name="On Time"
          />
          <Line
            type="monotone"
            dataKey="delayed"
            stroke="#EF4444"
            strokeWidth={2}
            name="Delayed"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MonthlyPerformanceChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Monthly Performance">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="efficiency" fill="#FF6B00" name="Efficiency %" radius={[4, 4, 0, 0]} />
          <Bar dataKey="accuracy" fill="#3B82F6" name="Accuracy %" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function HubEfficiencyChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Hub Efficiency">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
          <Tooltip />
          <Bar dataKey="value" fill="#FF6B00" name="Efficiency %" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MaterialFlowChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <ChartCard title="Material Flow Analytics">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
