"use client";

import { useState, useTransition, useEffect } from "react";
import type { Category, Source } from "@/lib/types";
import { Trash2, Loader2, TrendingUp, History, ArrowUpRight, ArrowDownLeft, Briefcase, ChartBar, Coins, Landmark } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { deleteInvestment, getInvestmentTransactions } from "@/app/actions/investmentActions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { NewTransactionSheet } from "@/components/transactions/NewTransactionSheet";
import { cn } from "@/lib/utils";
import { TransactionType } from "@/lib/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

interface Investment {
  id: string;
  name: string;
  type: string;
  icon: string | null;
  transactions?: { amount: number, type: TransactionType }[];
}

interface InvestmentManagerProps {
  investments: Investment[];
  categories: Category[];
  sources: Source[];
}

const typeConfig: Record<string, { label: string, icon: any, color: string }> = {
  STOCK: { label: "Stocks", icon: TrendingUp, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  MUTUAL_FUND: { label: "Mutual Funds", icon: ChartBar, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  PPF: { label: "PPF", icon: Landmark, color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  GOLD: { label: "Gold", icon: Coins, color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  OTHER: { label: "Other", icon: Briefcase, color: "bg-muted text-muted-foreground border-muted-foreground/20" },
};

export function InvestmentManager({ investments: initialInvestments, categories, sources }: InvestmentManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewInvId, setViewInvId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [contributeTo, setContributeTo] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const viewInv = initialInvestments.find(i => i.id === viewInvId);
  const selectedInv = initialInvestments.find(i => i.id === contributeTo);

  useEffect(() => {
    if (viewInvId) {
      setLoadingHistory(true);
      getInvestmentTransactions(viewInvId)
        .then(setHistory)
        .catch(err => {
          console.error(err);
          toast.error("Failed to load history");
        })
        .finally(() => setLoadingHistory(false));
    } else {
      setHistory([]);
    }
  }, [viewInvId]);


  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteInvestment(id);
        toast.success("Investment removed");
        setDeleteId(null);
        if (viewInvId === id) setViewInvId(null);
      } catch (err) {
        toast.error((err as Error).message);
        setDeleteId(null);
      }
    });
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500">

      <div className="space-y-2">
        {initialInvestments.length === 0 ? (
          <div className="bg-muted/10 border border-dashed border-border/50 rounded-[2.5rem] p-12 text-center text-muted-foreground/30 font-black uppercase tracking-widest text-xs italic">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p>No portfolios created</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {initialInvestments.map((inv) => {
              const totalAmount = (inv.transactions || []).reduce((acc, tx) => acc + tx.amount, 0);
              const ConfigIcon = typeConfig[inv.type]?.icon || Briefcase;
              
              return (
                <div
                  key={inv.id}
                  onClick={() => setViewInvId(inv.id)}
                  className="flex flex-col items-center gap-2.5 p-5 rounded-[2.5rem] bg-card/40 border border-border/40 hover:border-blue-500/30 transition-all active:scale-[0.98] relative group overflow-hidden text-center shadow-sm cursor-pointer"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-2xl shadow-xl transition-transform group-hover:scale-110",
                    typeConfig[inv.type]?.color || "bg-muted text-muted-foreground"
                  )}>
                    {inv.icon ? <span>{inv.icon}</span> : <ConfigIcon className="w-6 h-6" />}
                  </div>
                  <div className="space-y-1 w-full px-1">
                    <p className="font-black text-xs tracking-tight truncate uppercase leading-none mb-1">{inv.name}</p>
                    <p className="text-[10px] font-black italic text-blue-500">₹{formatCurrency(totalAmount)}</p>
                    <p className="text-[7px] font-bold text-muted-foreground uppercase opacity-40 leading-none">{inv.type}</p>
                  </div>
                  
                  {/* Quick Add Button */}
                  <div className="w-full mt-1 flex gap-1">
                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           setContributeTo(inv.id);
                           setIsSheetOpen(true);
                        }}
                        className="flex-1 h-7 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 text-[9px] font-black uppercase transition-all"
                     >
                        Add
                     </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(inv.id);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all active:scale-125"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Investment History Sheet */}
      <Sheet open={!!viewInvId} onOpenChange={(open) => !open && setViewInvId(null)}>
        <SheetContent side="bottom" className="w-full max-h-[80vh] rounded-t-[2.5rem] bg-card overflow-y-auto no-scrollbar pt-12 border-none">
          <div className="w-12 h-1.5 bg-muted/40 rounded-full mx-auto absolute top-4 left-1/2 -translate-x-1/2" />
          <SheetHeader className="mb-6 px-4">
            <div className="flex items-center gap-4 mb-4">
               <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl",
                  typeConfig[viewInv?.type ?? "OTHER"].color
               )}>
                  {viewInv?.icon ? <span className="text-2xl">{viewInv.icon}</span> : viewInv && (
                    <div className="w-7 h-7">
                        {(() => {
                           const Icon = typeConfig[viewInv.type]?.icon || Briefcase;
                           return <Icon className="w-7 h-7" />;
                        })()}
                    </div>
                  )}
               </div>
               <div>
                  <SheetTitle className="text-xl font-black uppercase tracking-tight italic">{viewInv?.name}</SheetTitle>
                  <SheetDescription className="font-bold flex items-center gap-2">
                    <History className="w-3.5 h-3.5" /> Portfolio Performance
                  </SheetDescription>
               </div>
            </div>
            
            {viewInv && (
                <div className="p-4 rounded-2xl border border-blue-500/10 bg-blue-500/5 text-center space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Net Investment</p>
                  <p className="text-2xl font-black italic text-blue-500">
                    ₹{formatCurrency((viewInv.transactions || []).reduce((acc, tx) => acc + tx.amount, 0))}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{viewInv.type}</p>
                </div>
            )}
          </SheetHeader>

          <div className="space-y-3">
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Transactions</h4>
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-[2.5rem] opacity-30">
                <p className="text-sm font-bold uppercase tracking-widest italic opacity-40">No entries recorded</p>
              </div>
            ) : (
              <div className="space-y-2">
                  {history.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/10">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm",
                          tx.type === "INCOME" ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                        )}>
                          {tx.type === "INCOME" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0 px-1">
                           <p className="text-xs font-black truncate uppercase leading-none mb-1">{tx.category?.name || "Portfolio Entry"}</p>
                           <p className="text-[9px] font-bold text-muted-foreground leading-none">
                             {tx.date ? format(new Date(tx.date), "MMM dd, yyyy") : "N/A"}
                           </p>
                        </div>
                        <div className="text-right">
                           <p className={cn("text-xs font-black italic leading-none mb-1", tx.type === "INCOME" ? "text-red-500" : "text-green-500")}>
                             {tx.type === "INCOME" ? "-" : "+"}₹{formatCurrency(tx.amount)}
                           </p>
                           <p className="text-[8px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest">{tx.source?.name || "Cash"}</p>
                        </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black italic">REMOVE PORTFOLIO</DialogTitle>
            <DialogDescription className="font-medium text-xs">
              This will remove the container but won't delete the actual money spent unless they are linked to this.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 mt-2">
            <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setDeleteId(null)}>CANCEL</Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => deleteId && handleDelete(deleteId)}
              className="flex-1 rounded-xl h-12 font-black italic shadow-lg shadow-red-500/20"
            >
              {isPending ? "OK..." : "DELETE"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewTransactionSheet
         open={isSheetOpen}
         onOpenChange={setIsSheetOpen}
         categories={categories}
         sources={sources}
         people={[]} // Not needed for quick add
         loans={[]} // Not needed for quick add
         investments={initialInvestments.map(i => ({ id: i.id, name: i.name }))}
         initialData={{
            type: TransactionType.INVESTMENT,
            investmentId: contributeTo,
         }}
      />
    </div>
  );
}
