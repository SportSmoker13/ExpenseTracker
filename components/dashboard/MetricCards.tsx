"use client";

import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyInvested: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const cards = (props: MetricCardsProps) => [
  {
    id: "metric-balance",
    label: "Total Balance",
    value: props.totalBalance,
    icon: Wallet,
    color: "from-[oklch(0.55_0.22_280)] to-[oklch(0.45_0.2_300)]",
    iconBg: "bg-white/20",
    trend: props.totalBalance >= 0 ? "positive" : "negative",
    trendIcon: props.totalBalance >= 0 ? ArrowUpRight : ArrowDownRight,
  },
  {
    id: "metric-income",
    label: "Monthly Income",
    value: props.monthlyIncome,
    icon: TrendingUp,
    color: "from-[oklch(0.45_0.18_155)] to-[oklch(0.38_0.16_165)]",
    iconBg: "bg-white/20",
    trend: "positive",
    trendIcon: ArrowUpRight,
  },
  {
    id: "metric-expenses",
    label: "Monthly Expenses",
    value: props.monthlyExpenses,
    icon: TrendingDown,
    color: "from-[oklch(0.55_0.22_25)] to-[oklch(0.48_0.2_15)]",
    iconBg: "bg-white/20",
    trend: "negative",
    trendIcon: ArrowDownRight,
  },
  {
    id: "metric-invested",
    label: "Total Invested",
    value: props.monthlyInvested,
    icon: PiggyBank,
    color: "from-[oklch(0.5_0.2_320)] to-[oklch(0.42_0.18_290)]",
    iconBg: "bg-white/20",
    trend: "positive",
    trendIcon: ArrowUpRight,
  },
];

export function MetricCards(props: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards(props).map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trendIcon;
        return (
          <div
            key={card.id}
            id={card.id}
            className={cn(
              "relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-xl",
              card.color
            )}
          >
            {/* Background decoration */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
            <div className="absolute -bottom-4 -right-2 w-16 h-16 rounded-full bg-white/5" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", card.iconBg)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                  card.trend === "positive" ? "bg-white/20" : "bg-white/20"
                )}>
                  <TrendIcon className="w-3 h-3" />
                  <span>This month</span>
                </div>
              </div>
              <p className="text-white/70 text-sm font-medium mb-1">{card.label}</p>
              <p className="text-2xl font-bold tracking-tight">
                {formatCurrency(card.value)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
