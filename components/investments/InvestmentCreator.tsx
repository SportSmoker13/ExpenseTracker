"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { addInvestment } from "@/app/actions/investmentActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function InvestmentCreator() {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "OTHER", icon: "" });

  const handleAdd = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    startTransition(async () => {
      try {
        await addInvestment(form);
        toast.success("Investment portfolio created!");
        setDialogOpen(false);
        setForm({ name: "", type: "OTHER", icon: "" });
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  };

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-muted/20 p-[1px]">
      <div className="bg-card/40 backdrop-blur-3xl p-4 rounded-3xl flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black tracking-tighter uppercase italic">New Portfolio</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Stocks, Funds & Assets</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            id="add-inv-btn"
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-600 text-white text-[10px] font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> CREATE
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none bg-card/95 backdrop-blur-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">New Portfolio</DialogTitle>
              <DialogDescription className="text-xs font-medium">Group your investments for better tracking.</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Portfolio Name</Label>
                <Input
                  placeholder="e.g. US Tech Stocks"
                  value={form.name}
                  className="h-12 rounded-2xl bg-muted/30 border-none px-4 font-bold italic"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none px-4 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="STOCK">Stocks</SelectItem>
                      <SelectItem value="MUTUAL_FUND">Mutual Funds</SelectItem>
                      <SelectItem value="PPF">PPF</SelectItem>
                      <SelectItem value="GOLD">Gold</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Icon</Label>
                  <Input
                    placeholder="🚀"
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
                className="flex-1 rounded-2xl h-12 bg-blue-600 text-white font-black shadow-lg shadow-blue-600/20"
              >
                {isPending ? "OK..." : "SAVE"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
