"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Pencil, Trash2, ChevronDown, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { TransactionType, type Source, type Person } from "@/lib/types";
import type { Transaction, Category, FullTransaction } from "@/lib/types";

import { deleteTransaction } from "@/app/actions/transactionActions";
import { NewTransactionSheet } from "@/components/transactions/NewTransactionSheet";
import { ExportMenu } from "@/components/transactions/ExportMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

// type FullTransaction is now imported from @/lib/types

interface TransactionTableProps {
  transactions: FullTransaction[];
  categories: Category[];
  sources: Source[];
  people: Person[];
  loans: Loan[];
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

export function TransactionTable({ transactions, categories, sources, people, loans }: TransactionTableProps) {
  const [isPending, startTransition] = useTransition();
  const [editTx, setEditTx] = useState<FullTransaction | null>(null);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== "ALL" && tx.type !== typeFilter) return false;
    if (categoryFilter !== "ALL" && tx.categoryId !== categoryFilter) return false;
    if (search && !(
      tx.description?.toLowerCase().includes(search.toLowerCase()) ||
      tx.category?.name.toLowerCase().includes(search.toLowerCase())
    )) return false;
    if (dateRange?.from && new Date(tx.date) < dateRange.from) return false;
    if (dateRange?.to && new Date(tx.date) > dateRange.to) return false;
    return true;
  });

  const handleDelete = () => {
    if (!deleteTxId) return;
    startTransition(async () => {
      try {
        await deleteTransaction(deleteTxId);
        toast.success("Transaction deleted");
        setDeleteTxId(null);
      } catch {
        toast.error("Failed to delete transaction");
      }
    });
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setCategoryFilter("ALL");
    setDateRange(undefined);
  };

  const hasFilters = search || typeFilter !== "ALL" || categoryFilter !== "ALL" || dateRange?.from;

  return (
    <>
      {/* Mobile Filter Bar */}
      <div className="space-y-3 mb-6 px-1">
        <div className="relative">
          <Input
            id="tx-search"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 rounded-2xl bg-muted/30 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
          />
          <Filter className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Select value={typeFilter} onValueChange={(v) => { if (v) setTypeFilter(v); }}>
            <SelectTrigger id="tx-type-filter" className="h-9 w-auto min-w-[100px] rounded-full text-xs font-medium bg-muted/40 border-none">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value={TransactionType.INCOME}>Income</SelectItem>
              <SelectItem value={TransactionType.EXPENSE}>Expense</SelectItem>
              <SelectItem value={TransactionType.INVESTMENT}>Investment</SelectItem>
              <SelectItem value={TransactionType.TRANSFER}>Pay/Transfer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={(v) => { if (v) setCategoryFilter(v); }}>
            <SelectTrigger id="tx-category-filter" className="h-9 w-auto min-w-[100px] rounded-full text-xs font-medium bg-muted/40 border-none">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger id="tx-date-filter" className="h-9 whitespace-nowrap px-4 rounded-full text-xs font-medium bg-muted/40 border-none flex items-center gap-1.5 hover:bg-muted/60 transition-colors">
              {dateRange?.from ? format(dateRange.from, "MMM d") : "Date"}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="range" selected={dateRange} onSelect={setDateRange} initialFocus />
            </PopoverContent>
          </Popover>

          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-9 rounded-full text-xs text-primary font-bold" onClick={clearFilters}>
              <X className="w-3 h-3 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Transaction Cards List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in zoom-in duration-300">
          <p className="text-4xl mb-3 font-emoji">🔍</p>
          <p className="text-sm font-semibold">No transactions found</p>
          <p className="text-xs opacity-60">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => {
            const config = typeConfig[tx.type];
            const isExpense = tx.type === "EXPENSE" || tx.type === "TRANSFER";
            return (
              <div 
                key={tx.id} 
                className="bg-card/40 border border-border/5 rounded-2xl p-2.5 flex items-center gap-3 transition-all active:scale-[0.98] active:bg-muted/30"
                onClick={() => setEditTx(tx)}
              >
                <div className="w-9 h-9 rounded-2xl bg-muted/50 flex items-center justify-center text-lg shadow-sm">
                  {tx.category?.icon ?? (tx.type === "TRANSFER" ? "🔄" : "📁")}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-sm font-bold text-foreground truncate">
                      {tx.description || tx.category?.name || (tx.type === "TRANSFER" ? "Transfer" : "General")}
                    </p>
                    <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-3.5 uppercase font-black tracking-tighter leading-none border-none", config.className)}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium opacity-60">
                    {format(new Date(tx.date), "MMM d, yy")} · {tx.category?.name || "Uncategorized"}
                  </p>
                </div>

                <div className="text-right">
                  <p className={cn(
                    "text-sm font-black",
                    tx.type === "INCOME" ? "text-green-500" : isExpense ? "text-red-500" : "text-purple-500"
                  )}>
                    {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeleteTxId(tx.id); }}
                    className="text-[10px] text-muted-foreground hover:text-destructive font-bold uppercase tracking-widest mt-1 opacity-40 hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Sheet */}
      <NewTransactionSheet
        open={!!editTx}
        onOpenChange={(open) => !open && setEditTx(null)}
        categories={categories}
        sources={sources}
        people={people}
        loans={loans}
        editTransaction={editTx ?? undefined}
      />

      {/* Delete confirm Dialog */}
      <Dialog open={!!deleteTxId} onOpenChange={(open: boolean) => !open && setDeleteTxId(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Delete Transaction</DialogTitle>
            <DialogDescription className="text-sm">
              Are you absolute sure? This will permanently remove the record.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 rounded-2xl h-12" onClick={() => setDeleteTxId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-2xl h-12 shadow-lg shadow-destructive/20"
              onClick={handleDelete}
              disabled={isPending}
              id="confirm-delete-btn"
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
