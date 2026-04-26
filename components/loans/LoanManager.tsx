"use client";

import { useState, useTransition } from "react";
import type { Loan, Source } from "@/lib/types";
import { Plus, Trash2, Landmark, Calendar, Percent, Clock, Receipt, CreditCard, Building2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { addLoan, deleteLoan } from "@/app/actions/loanActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { NewTransactionSheet } from "@/components/transactions/NewTransactionSheet";
import { cn } from "@/lib/utils";
import { TransactionType } from "@/lib/types";
import type { Category } from "@/lib/types";
import { History, ArrowUpRight, ArrowDownLeft } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

interface LoanManagerProps {
  loans: Loan[];
  sources: Source[];
  categories: Category[];
  investments: any[];
}

export function LoanManager({ loans: initialLoans, sources, categories, investments }: LoanManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewLoanId, setViewLoanId] = useState<string | null>(null);
  const [settleOpen, setSettleOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    totalAmount: "",
    sourceId: "",
  });

  const viewLoan = initialLoans.find(l => l.id === viewLoanId);
  const paidAmount = viewLoan ? (viewLoan.transactions || []).reduce((acc, tx) => acc + tx.amount, 0) : 0;
  const remaining = viewLoan ? Math.max(0, viewLoan.totalAmount - paidAmount) : 0;

  const handleAdd = () => {
    if (!form.name || !form.totalAmount || !form.sourceId) {
      toast.error("Please fill required fields");
      return;
    }
    startTransition(async () => {
      try {
        await addLoan({
          name: form.name,
          totalAmount: parseFloat(form.totalAmount),
          sourceId: form.sourceId,
        });
        toast.success("Loan added!");
        setDialogOpen(false);
        setForm({ name: "", totalAmount: "", sourceId: "" });
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteLoan(id);
        toast.success("Loan removed");
        setDeleteId(null);
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      {/* Premium Add Card */}
      <div className="relative group overflow-hidden rounded-3xl bg-muted/20 p-[1px]">
        <div className="bg-card/40 backdrop-blur-3xl p-4 rounded-3xl flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black tracking-tighter">Loans & EMIs</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Track your liabilities</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              id="add-loan-btn"
              className="flex items-center gap-2 h-10 px-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> ADD LOAN
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none bg-card/95 backdrop-blur-2xl px-6 py-8">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">New Loan</DialogTitle>
                <DialogDescription className="text-xs font-medium">Add a new loan to track your repayments.</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Loan Name</Label>
                  <Input
                    placeholder="e.g. Home Loan"
                    value={form.name}
                    className="h-11 rounded-xl bg-muted/30 border-none font-bold"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Total Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="1,00,000"
                    value={form.totalAmount}
                    className="h-11 rounded-xl bg-muted/30 border-none font-bold italic"
                    onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Tag To Account</Label>
                  <Select value={form.sourceId} onValueChange={(v) => setForm({ ...form, sourceId: v })}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none font-bold italic">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-2xl">
                        {sources.map(s => (
                           <SelectItem key={s.id} value={s.id}>{s.name} ({s.type})</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="flex flex-row gap-2 sm:flex-row sm:space-x-0">
                <Button variant="ghost" className="flex-1 rounded-2xl h-12 font-bold border border-border/40" onClick={() => setDialogOpen(false)}>CANCEL</Button>
                <Button
                  onClick={handleAdd}
                  disabled={isPending}
                  className="flex-1 rounded-2xl h-12 bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/20"
                >
                  {isPending ? "ADDING..." : "SAVE LOAN"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        {initialLoans.length === 0 ? (
          <div className="bg-muted/10 border border-dashed border-border/50 rounded-[2.5rem] p-12 text-center">
            <Landmark className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-sm text-muted-foreground font-medium">No loans tracked yet.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
            {initialLoans.map((loan) => {
              const isCreditCard = loan.source?.type === "CREDIT_CARD";
              const currentPaid = (loan.transactions || []).reduce((acc, tx) => acc + tx.amount, 0);
              const currentRemaining = Math.max(0, loan.totalAmount - currentPaid);
              const progress = (currentPaid / loan.totalAmount) * 100;
              
              return (
                <div
                  key={loan.id}
                  onClick={() => setViewLoanId(loan.id)}
                  className="flex-none w-56 flex flex-col gap-3 p-5 rounded-[2.5rem] bg-card/40 border border-border/40 hover:border-indigo-500/30 transition-all active:scale-[0.98] relative group overflow-hidden shadow-sm cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xl",
                      isCreditCard ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      {isCreditCard ? <CreditCard className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(loan.id);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all active:scale-125"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-black truncate uppercase tracking-tight italic">{loan.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">Remaining: ₹{formatCurrency(currentRemaining)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                     <div className="p-2 rounded-2xl bg-muted/20 text-center">
                        <p className="text-[7px] font-black uppercase opacity-50">Total</p>
                        <p className="text-[10px] font-black italic">₹{formatCurrency(loan.totalAmount)}</p>
                     </div>
                     <div className="p-2 rounded-2xl bg-muted/20 text-center">
                        <p className="text-[7px] font-black uppercase opacity-50">Paid</p>
                        <p className="text-[10px] font-black italic">₹{formatCurrency(currentPaid)}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 flex-1 bg-muted/30 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-indigo-500 transition-all duration-1000" 
                         style={{ width: `${progress}%` }} 
                       />
                    </div>
                    <span className="text-[7px] font-black text-muted-foreground opacity-40">{Math.round(progress)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loan Details Sheet */}
      <Sheet open={!!viewLoanId} onOpenChange={(open) => !open && setViewLoanId(null)}>
        <SheetContent side="bottom" className="w-full max-h-[80vh] rounded-t-[2.5rem] bg-card overflow-y-auto pt-12 border-none">
          <div className="w-12 h-1.5 bg-muted/40 rounded-full mx-auto absolute top-4 left-1/2 -translate-x-1/2" />
          <SheetHeader className="mb-6 px-4">
            <div className="flex items-center gap-4 mb-4">
               <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl",
                  viewLoan?.source?.type === "CREDIT_CARD" ? "bg-purple-500/20 text-purple-500" : "bg-blue-500/20 text-blue-500"
               )}>
                  {viewLoan?.source?.type === "CREDIT_CARD" ? <CreditCard className="w-7 h-7" /> : <Building2 className="w-7 h-7" />}
               </div>
               <div>
                  <SheetTitle className="text-xl font-black uppercase tracking-tight">{viewLoan?.name}</SheetTitle>
                  <SheetDescription className="font-bold flex items-center gap-2">
                    <History className="w-3.5 h-3.5" /> Loan Repayment History
                  </SheetDescription>
               </div>
            </div>
            
            {remaining > 0 && (
                <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-center space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Pending Balance</p>
                  <p className="text-2xl font-black italic text-indigo-600">
                    ₹{formatCurrency(remaining)}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                    of ₹{formatCurrency(viewLoan?.totalAmount ?? 0)} total
                  </p>
                  
                  <div className="pt-2">
                    <Button 
                      onClick={() => setSettleOpen(true)}
                      className="w-full h-10 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.1em] shadow-lg shadow-indigo-600/20"
                    >
                       Settle Up / Pay EMI
                    </Button>
                  </div>
                </div>
            )}
          </SheetHeader>

          <div className="space-y-3">
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Payments</h4>
             {(viewLoan?.transactions || []).length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-[2.5rem] opacity-30">
                  <p className="text-sm font-bold uppercase tracking-widest">No Payments Yet</p>
                </div>
             ) : (
                <div className="space-y-2">
                   {viewLoan?.transactions.map((tx) => (
                     <div key={tx.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/10">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center text-lg">
                           <ArrowDownLeft className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-xs font-black truncate uppercase leading-none mb-1">Repayment</p>
                           <p className="text-[9px] font-bold text-muted-foreground leading-none">
                             {tx.date ? format(new Date(tx.date), "MMM dd, yyyy") : "N/A"}
                           </p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-black italic text-green-500 leading-none mb-1">
                             ₹{formatCurrency(tx.amount)}
                           </p>
                        </div>
                     </div>
                   ))}
                </div>
             )}
          </div>
        </SheetContent>
      </Sheet>

      <NewTransactionSheet 
        open={settleOpen}
        onOpenChange={setSettleOpen}
        categories={categories}
        sources={sources}
        people={[]} // Not needed for loans
        loans={initialLoans}
        investments={investments}
        initialData={{
           amount: remaining,
           loanId: viewLoan?.id,
           type: TransactionType.EXPENSE,
           description: `Repayment for ${viewLoan?.name}`,
           sourceId: viewLoan?.sourceId
        }}
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Loan</DialogTitle>
            <DialogDescription>
              Are you sure? This will permanently remove the loan record.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              {isPending ? "Removing…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
