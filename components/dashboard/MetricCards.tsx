"use client";

import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyInvested: number;
  totalLent?: number;
  totalCardDue?: number;
}

export function MetricCards(props: MetricCardsProps) {
  const { totalBalance, monthlyIncome, monthlyExpenses, monthlyInvested, totalLent, totalCardDue } = props;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* 2. Pulse Grid: Monthly Activity */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Income", val: monthlyIncome, color: "text-green-500", bg: "bg-green-500/10", icon: ArrowUpRight },
          { label: "Expenses", val: monthlyExpenses, color: "text-red-500", bg: "bg-red-500/10", icon: ArrowDownRight },
          { label: "Invested", val: monthlyInvested, color: "text-purple-500", bg: "bg-purple-500/10", icon: ArrowUpRight },
          { label: "Savings", val: (monthlyIncome - monthlyExpenses), color: "text-blue-500", bg: "bg-blue-500/10", icon: Landmark }
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-card/40 backdrop-blur-xl border border-border/40 rounded-3xl p-5 shadow-sm space-y-2">
               <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", item.bg)}>
                 <Icon className={cn("w-4 h-4", item.color)} />
               </div>
               <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{item.label}</p>
                  <p className="text-base font-black tracking-tight">₹{Math.abs(item.val).toLocaleString()}</p>
               </div>
            </div>
          )
        })}
      </div>

      {/* 3. Health Summary: Liabilities & Assets */}
      <div className="bg-secondary/40 rounded-[2.5rem] p-6 border border-border/40 flex gap-6 overflow-x-auto no-scrollbar">
         <div className="flex-1 min-w-[140px] space-y-3">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_oklch(0.65_0.22_40)]" />
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Lent Out</p>
            </div>
            <p className="text-xl font-black text-orange-500">₹{(totalLent ?? 0).toLocaleString()}</p>
            <p className="text-[10px] font-medium text-muted-foreground leading-tight">Owed to you by friends or family.</p>
         </div>

         <div className="w-px bg-border/50 self-stretch" />

         <div className="flex-1 min-w-[140px] space-y-3">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_oklch(0.6_0.22_30)]" />
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60">CC Dues</p>
            </div>
            <p className="text-xl font-black text-rose-500">₹{(totalCardDue ?? 0).toLocaleString()}</p>
            <p className="text-[10px] font-medium text-muted-foreground leading-tight">Current total credit card liability.</p>
         </div>
      </div>
    </div>
  );
}

// Add a standalone Hero component to be used at the "Extreme Bottom"
export function TotalWealthHero({ totalBalance }: { totalBalance: number }) {
  return (
    <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/80 to-indigo-600 p-8 text-primary-foreground shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all my-8">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-black/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Total Available Wealth</p>
        <h2 className="text-4xl font-black tracking-tightest">
          ₹{totalBalance.toLocaleString()}
        </h2>
        <div className="flex items-center gap-2 pt-4">
           <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-2/3 shadow-[0_0_10px_white]" />
           </div>
           <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Financial Foundation</p>
        </div>
      </div>
    </div>
  );
}
