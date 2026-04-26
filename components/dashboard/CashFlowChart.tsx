"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CashFlowChartProps {
  data: { month: string; income: number; expense: number }[];
}

function formatK(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.55 0.18 155)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="oklch(0.55 0.18 155)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.6 0.22 25)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="oklch(0.6 0.22 25)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 280)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "oklch(0.6 0.05 280)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatK}
          tick={{ fontSize: 11, fill: "oklch(0.6 0.05 280)" }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any, name: any) => [
            formatCurrency(Number(value)),
            name === "income" ? "Liquid Cash" : "Expenses",
          ]}
          contentStyle={{
            background: "oklch(0.14 0.025 280)",
            border: "1px solid oklch(0.22 0.03 280)",
            borderRadius: "12px",
            color: "oklch(0.95 0.01 280)",
            fontSize: "13px",
          }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: "oklch(0.7 0.05 280)", fontSize: "12px", textTransform: "capitalize" }}>
              {value === "income" ? "Liquid Cash" : "Expenses"}
            </span>
          )}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="oklch(0.55 0.18 155)"
          strokeWidth={2.5}
          fill="url(#incomeGradient)"
          dot={{ fill: "oklch(0.55 0.18 155)", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="oklch(0.6 0.22 25)"
          strokeWidth={2.5}
          fill="url(#expenseGradient)"
          dot={{ fill: "oklch(0.6 0.22 25)", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
