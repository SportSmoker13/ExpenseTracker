import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Transaction, Category } from "@/lib/types";

interface RecentTransactionsProps {
  transactions: (Transaction & { category: Category })[];
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
        const isExpense = tx.type === "EXPENSE";
        return (
          <div
            key={tx.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg flex-shrink-0">
              {tx.category.icon ?? "💳"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {tx.description ?? tx.category.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {tx.category.name} · {format(new Date(tx.date), "MMM d, yyyy")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={cn(
                "text-sm font-semibold",
                isExpense ? "text-red-500" : tx.type === "INCOME" ? "text-green-500" : "text-purple-500"
              )}>
                {isExpense ? "-" : "+"}{formatCurrency(tx.amount)}
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
