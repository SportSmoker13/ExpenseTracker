"use client";

import { Landmark, Receipt, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoanSummaryCardProps {
  totalLoanAmount: number;
  totalLoanRepaid: number;
}

export function LoanSummaryCard({ totalLoanAmount, totalLoanRepaid }: LoanSummaryCardProps) {
  const remaining = Math.max(0, totalLoanAmount - totalLoanRepaid);
  const progress = totalLoanAmount > 0 ? (totalLoanRepaid / totalLoanAmount) * 100 : 0;

  return (
    <div className="relative group overflow-hidden rounded-[2.5rem] bg-card/40 border border-border/40 p-8 shadow-sm my-8">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 italic">Debt Overview</p>
              <h2 className="text-2xl font-black tracking-tightest uppercase italic">Total Liabilities</h2>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <Landmark className="w-6 h-6 text-indigo-500" />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
           <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Initial Debt</p>
              <p className="text-xl font-black italic tabular-nums">₹{totalLoanAmount.toLocaleString()}</p>
           </div>
           <div className="space-y-1 text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Total Repaid</p>
              <p className="text-xl font-black italic tabular-nums text-emerald-500">₹{totalLoanRepaid.toLocaleString()}</p>
           </div>
        </div>

        <div className="space-y-3">
           <div className="flex justify-between items-end">
              <div className="space-y-1">
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Remaining Principle</p>
                 <p className="text-3xl font-black tracking-tighter text-indigo-600 italic">₹{remaining.toLocaleString()}</p>
              </div>
              <div className="text-right">
                 <p className="text-[20px] font-black italic tabular-nums leading-none">{Math.round(progress)}%</p>
                 <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Settled</p>
              </div>
           </div>

           <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden p-[1px]">
              <div 
                className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
           </div>
        </div>

        <div className="pt-2 flex items-center gap-4 border-t border-border/20">
           <div className="flex items-center gap-2">
              <Receipt className="w-3 h-3 text-muted-foreground" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">All-time loan activity tracked</p>
           </div>
           <div className="ml-auto flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
              <p className="text-[8px] font-black uppercase tracking-widest italic">Live Balance</p>
              <ArrowUpRight className="w-3 h-3" />
           </div>
        </div>
      </div>
    </div>
  );
}
