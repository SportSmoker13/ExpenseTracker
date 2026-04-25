"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ExpenseDonutProps {
  data: { category: string; amount: number; color: string }[];
}

const RADIAN = Math.PI / 180;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function renderCustomLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx?: number; cy?: number; midAngle?: number;
  innerRadius?: number; outerRadius?: number; percent?: number;
}) {
  if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent || percent < 0.06) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function ExpenseDonut({ data }: ExpenseDonutProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p className="text-4xl mb-3">🪙</p>
        <p className="text-sm font-medium">No expenses this month</p>
        <p className="text-xs mt-1">Add an expense to see breakdown</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
      <div className="relative">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="amount"
              labelLine={false}
              label={renderCustomLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [formatCurrency(Number(value)), "Amount"]}
              contentStyle={{
                background: "oklch(0.14 0.025 280)",
                border: "1px solid oklch(0.22 0.03 280)",
                borderRadius: "12px",
                color: "oklch(0.95 0.01 280)",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: "0px" }}>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Spent</p>
          <p className="text-sm font-bold text-foreground">₹{total.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top Spending</p>
        {data.sort((a,b) => b.amount - a.amount).slice(0, 4).map((entry, index) => (
          <div key={index} className="flex items-center justify-between group">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <p className="text-xs font-medium truncate">{entry.category}</p>
            </div>
            <p className="text-xs font-bold whitespace-nowrap">₹{entry.amount.toLocaleString()}</p>
          </div>
        ))}
        {data.length > 4 && (
          <p className="text-[10px] text-muted-foreground text-center pt-1 border-t border-border/50">+{data.length - 4} more categories</p>
        )}
      </div>
    </div>
  );
}
