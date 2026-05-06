"use client";

import { useState, useTransition } from "react";
import type { Source } from "@/lib/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { addLoan } from "@/app/actions/loanActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface LoanCreatorProps {
  sources: Source[];
}

export function LoanCreator({ sources }: LoanCreatorProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    totalAmount: "",
    sourceId: "",
  });

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

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-muted/20 p-[1px]">
      <div className="bg-card/40 backdrop-blur-3xl p-4 rounded-3xl flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black tracking-tighter">Add New Loan</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Track your liabilities</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            id="add-loan-btn"
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 text-white text-[10px] font-black shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> ADD
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
  );
}
