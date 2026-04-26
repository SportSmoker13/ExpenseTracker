import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FullTransaction } from "@/lib/types";

interface RecentTransactionsProps {
  transactions: FullTransaction[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const typeConfig = {
  INCOME: { label: "Income", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  EXPENSE: { label: "Expense", className: "bg-red-500/10 text-red-500 border-red-500/20" },
  INVESTMENT: { label: "Invest", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  TRANSFER: { label: "Pay/Transfer", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-3xl mb-2">📭</p>
        <p className="text-sm font-medium">No transactions yet</p>
        <p className="text-xs mt-1">Click "New Transaction" to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const config = typeConfig[tx.type];
        const isDeduction = tx.type === "EXPENSE" || tx.type === "TRANSFER";
        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-base flex-shrink-0">
              {tx.category?.icon ?? (tx.type === "TRANSFER" ? "🔄" : "💳")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {tx.description || tx.category?.name || (tx.type === "TRANSFER" ? `Paid to ${tx.toSource?.name || "Credit Card"}` : "Uncategorized")}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {tx.type === "TRANSFER" 
                  ? `From ${tx.source?.name || "Bank"}`
                  : tx.category?.name || "General"} · {format(new Date(tx.date), "MMM d, yy")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={cn(
                "text-sm font-semibold",
                isDeduction ? "text-red-500" : tx.type === "INCOME" ? "text-green-500" : "text-purple-500"
              )}>
                {isDeduction ? "-" : "+"}{formatCurrency(tx.amount)}
              </span>
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", config.className)}>
                {config.label}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
