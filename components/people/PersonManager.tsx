"use client";

import { useState, useTransition, useEffect } from "react";
import type { Person, Category, Source } from "@/lib/types";
import { Plus, Trash2, Loader2, UserPlus, Users, ArrowUpRight, ArrowDownLeft, History } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { addPerson, deletePerson, getPersonTransactions } from "@/app/actions/personActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface PersonWithBalance extends Person {
  balance: number;
}

interface PersonManagerProps {
  people: PersonWithBalance[];
  categories: Category[];
  sources: Source[];
}

export function PersonManager({ people: initialPeople, categories, sources }: PersonManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewPersonId, setViewPersonId] = useState<string | null>(null);
  const [settleOpen, setSettleOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [form, setForm] = useState({ name: "" });

  const viewPerson = initialPeople.find(p => p.id === viewPersonId);

  useEffect(() => {
    if (viewPersonId) {
      setLoadingHistory(true);
      getPersonTransactions(viewPersonId)
        .then(setHistory)
        .finally(() => setLoadingHistory(false));
    } else {
      setHistory([]);
    }
  }, [viewPersonId]);

  const handleAdd = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    startTransition(async () => {
      try {
        await addPerson(form);
        toast.success("Person added!");
        setDialogOpen(false);
        setForm({ name: "" });
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deletePerson(id);
        toast.success("Person removed");
        setDeleteId(null);
        if (viewPersonId === id) setViewPersonId(null);
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
            <h3 className="text-sm font-black tracking-tighter">Your Circle</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Lending & Borrowing</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              id="add-person-btn"
              className="flex items-center gap-2 h-10 px-4 rounded-2xl bg-orange-500 text-white text-[10px] font-black shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" /> ADD
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none bg-card/95 backdrop-blur-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">Add Person</DialogTitle>
                <DialogDescription className="text-xs font-medium">Track money records with this person.</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Full Name</Label>
                  <Input
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    className="h-12 rounded-2xl bg-muted/30 border-none px-4 font-bold"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="flex flex-row gap-2 sm:flex-row sm:space-x-0">
                <Button variant="ghost" className="flex-1 rounded-2xl h-12 font-bold border border-border/40" onClick={() => setDialogOpen(false)}>CANCEL</Button>
                <Button
                  onClick={handleAdd}
                  disabled={isPending}
                  className="flex-1 rounded-2xl h-12 bg-orange-500 text-white font-black shadow-lg shadow-orange-500/20"
                >
                  {isPending ? "OK..." : "SAVE"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        {initialPeople.length === 0 ? (
          <div className="bg-muted/10 border border-dashed border-border/50 rounded-[2.5rem] p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-sm text-muted-foreground font-medium">No one in your circle yet.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
            {initialPeople.map((person) => {
              const balance = person.balance;
              const isOwedToMe = balance > 0;
              const isIoweThem = balance < 0;

              return (
                <div
                  key={person.id}
                  onClick={() => setViewPersonId(person.id)}
                  className="flex-none w-40 flex flex-col items-center gap-2.5 p-4 rounded-[2.25rem] bg-card/40 border border-border/40 hover:border-orange-500/30 transition-all active:scale-[0.98] relative group overflow-hidden text-center shadow-sm cursor-pointer"
                >
                  <div className={cn(
                    "w-11 h-11 rounded-[1.15rem] flex items-center justify-center text-xl shadow-xl transition-transform group-hover:scale-110",
                    isOwedToMe ? "bg-green-500/10 text-green-500" : isIoweThem ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
                  )}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 w-full px-1">
                    <p className="text-xs font-black tracking-tight truncate uppercase leading-tight">{person.name}</p>
                    <div className="pt-1">
                      {balance === 0 ? (
                        <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40">Settled</p>
                      ) : (
                        <div className="space-y-0.5">
                          <p className={cn(
                            "text-[9px] font-black italic tabular-nums leading-none",
                            isOwedToMe ? "text-green-500" : "text-red-500"
                          )}>
                            ₹{formatCurrency(Math.abs(balance))}
                          </p>
                          <p className="text-[7px] font-bold uppercase opacity-30 tracking-widest">
                            {isOwedToMe ? "Owes You" : "You Owe"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(person.id);
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

      {/* Person Transaction History Sheet */}
      <Sheet open={!!viewPersonId} onOpenChange={(open) => !open && setViewPersonId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-card overflow-y-auto no-scrollbar pt-10">
          <SheetHeader className="mb-6">
            <div className="flex items-center gap-4 mb-4">
               <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl",
                  viewPerson && viewPerson.balance > 0 ? "bg-green-500/20 text-green-500" : viewPerson && viewPerson.balance < 0 ? "bg-red-500/20 text-red-500" : "bg-muted text-muted-foreground"
               )}>
                  <Users className="w-7 h-7" />
               </div>
               <div>
                  <SheetTitle className="text-xl font-black uppercase tracking-tight">{viewPerson?.name}</SheetTitle>
                  <SheetDescription className="font-bold flex items-center gap-2">
                    <History className="w-3.5 h-3.5" /> Transaction History
                  </SheetDescription>
               </div>
            </div>
            
            {viewPerson && viewPerson.balance !== 0 && (
                <div className={cn(
                  "p-4 rounded-2xl border text-center space-y-1",
                  viewPerson.balance > 0 ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
                )}>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Current Status</p>
                  <p className={cn("text-2xl font-black italic", viewPerson.balance > 0 ? "text-green-500" : "text-red-500")}>
                    ₹{formatCurrency(Math.abs(viewPerson.balance))}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                    {viewPerson.balance > 0 ? "Owed to you" : "You need to pay"}
                  </p>
                  
                  <div className="pt-2">
                    <Button 
                      onClick={() => setSettleOpen(true)}
                      className={cn(
                        "w-full h-10 rounded-xl font-black text-xs uppercase tracking-[0.1em] shadow-lg",
                        viewPerson.balance > 0 ? "bg-green-500 text-white shadow-green-500/20" : "bg-red-500 text-white shadow-red-500/20"
                      )}
                    >
                       Settle Up
                    </Button>
                  </div>
                </div>
            )}
          </SheetHeader>

          <div className="space-y-3">
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
                  {history.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/10">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                          tx.type === "EXPENSE" ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                        )}>
                          {tx.type === "EXPENSE" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black truncate uppercase leading-none mb-1">{tx.category?.name || "Uncategorized"}</p>
                          <p className="text-[9px] font-bold text-muted-foreground leading-none">
                            {tx.date ? format(new Date(tx.date), "MMM dd, yyyy") : "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={cn("text-xs font-black italic leading-none mb-1", tx.type === "EXPENSE" ? "text-red-500" : "text-green-500")}>
                            {tx.type === "EXPENSE" ? "-" : "+"}₹{formatCurrency(tx.amount)}
                          </p>
                          <p className="text-[9px] font-bold text-muted-foreground opacity-40 leading-none">{tx.source?.name || "Cash"}</p>
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
        people={initialPeople}
        initialData={{
           amount: viewPerson ? Math.abs(viewPerson.balance) : 0,
           personId: viewPerson?.id,
           type: viewPerson && viewPerson.balance > 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
           description: `Settled balance with ${viewPerson?.name}`
        }}
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Person</DialogTitle>
            <DialogDescription>
              Are you sure? People with linked transactions cannot be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => deleteId && handleDelete(deleteId)}
              id="confirm-delete-person-btn"
            >
              {isPending ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
