"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Pencil, Trash2, ChevronDown, Filter, X } from "lucide-react";
import { toast } from "sonner";
import type { Transaction, Category } from "@prisma/client";

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

type FullTransaction = Transaction & { category: Category };

interface TransactionTableProps {
  transactions: FullTransaction[];
  categories: Category[];
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

export function TransactionTable({ transactions, categories }: TransactionTableProps) {
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
      tx.category.name.toLowerCase().includes(search.toLowerCase())
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
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <Input
          id="tx-search"
          placeholder="Search transactions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-48 h-9"
        />

        <Select
          value={typeFilter}
          onValueChange={(v) => { if (v) setTypeFilter(v); }}
        >
          <SelectTrigger id="tx-type-filter" className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INVESTMENT">Investment</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={categoryFilter}
          onValueChange={(v) => { if (v) setCategoryFilter(v); }}
        >
          <SelectTrigger id="tx-category-filter" className="w-40 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger
            id="tx-date-filter"
            className="h-9 flex items-center gap-2 px-3 rounded-lg border border-input bg-transparent text-xs hover:bg-muted transition-colors"
          >
            <Filter className="w-3 h-3" />
            {dateRange?.from
              ? dateRange.to
                ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d")}`
                : format(dateRange.from, "MMM d, yyyy")
              : "Date Range"}
            <ChevronDown className="w-3 h-3" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {hasFilters && (
          <Button id="tx-clear-filters" variant="ghost" size="sm" className="h-9 gap-1.5 text-xs" onClick={clearFilters}>
            <X className="w-3 h-3" /> Clear
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{filtered.length} transactions</span>
          <ExportMenu transactions={filtered} />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm font-medium">No transactions found</p>
          <p className="text-xs mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-xs font-semibold">Date</TableHead>
                <TableHead className="text-xs font-semibold">Type</TableHead>
                <TableHead className="text-xs font-semibold">Category</TableHead>
                <TableHead className="text-xs font-semibold">Description</TableHead>
                <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tx) => {
                const config = typeConfig[tx.type];
                return (
                  <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(tx.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5", config.className)}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <span>{tx.category.icon ?? "📁"}</span>
                        <span>{tx.category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {tx.description ?? "—"}
                    </TableCell>
                    <TableCell className={cn(
                      "text-sm font-semibold text-right whitespace-nowrap",
                      tx.type === "INCOME" ? "text-green-500" : tx.type === "EXPENSE" ? "text-red-500" : "text-purple-500"
                    )}>
                      {tx.type === "EXPENSE" ? "-" : "+"}{formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditTx(tx)}
                          id={`edit-tx-${tx.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTxId(tx.id)}
                          id={`delete-tx-${tx.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Sheet */}
      <NewTransactionSheet
        open={!!editTx}
        onOpenChange={(open) => !open && setEditTx(null)}
        categories={categories}
        editTransaction={editTx ?? undefined}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTxId} onOpenChange={(open: boolean) => !open && setDeleteTxId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTxId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              id="confirm-delete-btn"
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
