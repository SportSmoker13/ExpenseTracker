"use client";

import { useState, useTransition } from "react";
import { SourceType } from "@/lib/types";
import type { Source } from "@/lib/types";
import { Plus, Trash2, Loader2, Building2, CreditCard, Wallet, Landmark, History, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { addSource, deleteSource } from "@/app/actions/sourceActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { getSourceTransactions } from "@/app/actions/sourceActions";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

interface SourceManagerProps {
  sources: Source[];
}

const typeConfig = {
  BANK: { label: "Bank Account", icon: Building2, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  CREDIT_CARD: { label: "Credit Card", icon: CreditCard, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  CASH: { label: "Cash", icon: Wallet, color: "bg-green-500/10 text-green-500 border-green-500/20" },
  OTHER: { label: "Other", icon: Landmark, color: "bg-muted text-muted-foreground border-muted-foreground/20" },
};

export function SourceManager({ sources: initialSources }: SourceManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewSourceId, setViewSourceId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    type: SourceType;
    icon: string;
  }>({ name: "", type: "BANK" as SourceType, icon: "" });

  const viewSource = initialSources.find(s => s.id === viewSourceId);
  const ConfigIcon = viewSource ? typeConfig[viewSource.type].icon : Building2;

  useEffect(() => {
    if (viewSourceId) {
      setLoadingHistory(true);
      getSourceTransactions(viewSourceId)
        .then(setHistory)
        .catch(err => {
           console.error(err);
           toast.error("Failed to load history");
        })
        .finally(() => setLoadingHistory(false));
    } else {
      setHistory([]);
    }
  }, [viewSourceId]);

  const handleAdd = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    startTransition(async () => {
      try {
        await addSource(form);
        toast.success("Source created!");
        setDialogOpen(false);
        setForm({ name: "", type: "BANK" as SourceType, icon: "" });
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteSource(id);
        toast.success("Source deleted");
        setDeleteId(null);
      } catch (err) {
        toast.error((err as Error).message);
        setDeleteId(null);
      }
    });
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      {/* Premium Add Card */}
      <div className="relative group overflow-hidden rounded-3xl bg-muted/20 p-[1px]">
        <div className="bg-card/40 backdrop-blur-3xl p-4 rounded-3xl flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black tracking-tight">Your Accounts</h3>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Banks, Cards & Wallets</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              id="add-source-btn"
              className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" /> CREATE
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none bg-card/95 backdrop-blur-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">New Account</DialogTitle>
                <DialogDescription className="text-xs font-medium">Link a new source for your transactions.</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Account Name</Label>
                  <Input
                    placeholder="e.g. HDFC Salary"
                    value={form.name}
                    className="h-12 rounded-2xl bg-muted/30 border-none px-4 font-bold"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as SourceType })}>
                      <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none px-4 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="BANK">Bank</SelectItem>
                        <SelectItem value="CREDIT_CARD">Card</SelectItem>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Icon</Label>
                    <Input
                      placeholder="🏦"
                      value={form.icon}
                      className="h-12 rounded-2xl bg-muted/30 border-none px-4 text-center text-xl font-bold"
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="flex flex-row gap-2 sm:flex-row sm:space-x-0">
                <Button variant="ghost" className="flex-1 rounded-2xl h-12 font-bold border border-border/40" onClick={() => setDialogOpen(false)}>CANCEL</Button>
                <Button
                  onClick={handleAdd}
                  disabled={isPending}
                  className="flex-1 rounded-2xl h-12 bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20"
                >
                  {isPending ? "OK..." : "SAVE"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        {initialSources.length === 0 ? (
          <div className="bg-muted/10 border border-dashed border-border/50 rounded-[2.5rem] p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-sm text-muted-foreground font-medium">No accounts linked yet.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
            {initialSources.map((src) => {
              const ConfigIcon = typeConfig[src.type].icon;
              const isCreditCard = src.type === "CREDIT_CARD";
              const balanceValue = (src as any).balance ?? 0;
              
              return (
                <div
                  key={src.id}
                  onClick={() => setViewSourceId(src.id)}
                  className="flex-none w-44 flex flex-col items-center gap-2 p-5 rounded-[2.5rem] bg-card/40 border border-border/40 hover:border-primary/30 transition-all active:scale-[0.98] relative group overflow-hidden text-center shadow-sm cursor-pointer"
                >
                  <div className={cn("w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-2xl shadow-xl transition-transform group-hover:scale-110", typeConfig[src.type].color)}>
                    {src.icon ? <span>{src.icon}</span> : <ConfigIcon className="w-6 h-6" />}
                  </div>
                  <div className="space-y-1 w-full px-1">
                    <p className="font-black text-xs tracking-tight truncate uppercase">{src.name}</p>
                    <div className="flex flex-col items-center">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40">{src.type}</p>
                      <p className={cn(
                        "text-xs font-black italic",
                        isCreditCard ? "text-red-500" : "text-green-500"
                      )}>
                        {isCreditCard ? "DUE: " : ""}₹{formatCurrency(balanceValue)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(src.id);
                    }}
                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all active:scale-125"
                    id={`delete-src-${src.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Account Transaction History Sheet */}
      <Sheet open={!!viewSourceId} onOpenChange={(open) => !open && setViewSourceId(null)}>
        <SheetContent side="bottom" className="w-full h-[85vh] rounded-t-[2.5rem] bg-card overflow-y-auto no-scrollbar pt-12 border-none">
          <div className="w-12 h-1.5 bg-muted/40 rounded-full mx-auto absolute top-4 left-1/2 -translate-x-1/2" />
          <SheetHeader className="mb-6 px-4">
            <div className="flex items-center gap-4 mb-4">
               <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl",
                  typeConfig[viewSource?.type ?? "OTHER"].color
               )}>
                  {viewSource?.icon ? <span className="text-2xl">{viewSource.icon}</span> : <ConfigIcon className="w-7 h-7" />}
               </div>
               <div>
                  <SheetTitle className="text-xl font-black uppercase tracking-tight">{viewSource?.name}</SheetTitle>
                  <SheetDescription className="font-bold flex items-center gap-2">
                    <History className="w-3.5 h-3.5" /> Account Activity
                  </SheetDescription>
               </div>
            </div>
            
            {viewSource && (
                <div className={cn(
                  "p-4 rounded-2xl border text-center space-y-1 shadow-sm",
                  viewSource.type === "CREDIT_CARD" ? "bg-red-500/5 border-red-500/10" : "bg-green-500/5 border-green-500/10"
                )}>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                    {viewSource.type === "CREDIT_CARD" ? "Amount Due" : "Available Balance"}
                  </p>
                  <p className={cn("text-2xl font-black italic tabular-nums", viewSource.type === "CREDIT_CARD" ? "text-red-500" : "text-green-500")}>
                    ₹{formatCurrency((viewSource as any).balance ?? 0)}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{viewSource.type}</p>
                </div>
            )}
          </SheetHeader>

          <div className="space-y-3">
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Recent Activity</h4>
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading Records...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-[2.5rem] opacity-30">
                <p className="text-sm font-bold uppercase tracking-widest">No Transactions</p>
              </div>
            ) : (
              <div className="space-y-2">
                  {history.map((tx) => {
                    const isIncoming = tx.type === "INCOME" || tx.toSourceId === viewSourceId;
                    const isTransfer = tx.type === "TRANSFER";
                    
                    return (
                      <div key={tx.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/10">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                            isIncoming ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {isIncoming ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate uppercase leading-none mb-1">
                               {isTransfer ? (isIncoming ? `From ${tx.source?.name}` : `To ${tx.toSource?.name}`) : (tx.category?.name || "Uncategorized")}
                            </p>
                            <p className="text-[9px] font-bold text-muted-foreground leading-none">
                              {tx.date ? format(new Date(tx.date), "MMM dd, yyyy") : "N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={cn("text-xs font-black italic leading-none mb-1", isIncoming ? "text-green-500" : "text-red-500")}>
                              {isIncoming ? "+" : "-"}₹{formatCurrency(tx.amount)}
                            </p>
                            <p className="text-[8px] font-bold text-muted-foreground opacity-40 uppercase leading-none">{tx.type}</p>
                          </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Source</DialogTitle>
            <DialogDescription>
              Are you sure? Sources with linked transactions cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => deleteId && handleDelete(deleteId)}
              id="confirm-delete-src-btn"
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
