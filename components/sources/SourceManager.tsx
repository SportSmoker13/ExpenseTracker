"use client";

import { useState, useTransition } from "react";
import { SourceType } from "@/lib/types";
import type { Source } from "@/lib/types";
import { Plus, Trash2, Loader2, Building2, CreditCard, Wallet, Landmark } from "lucide-react";
import { toast } from "sonner";

import { addSource, deleteSource } from "@/app/actions/sourceActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  const [form, setForm] = useState<{
    name: string;
    type: SourceType;
    icon: string;
  }>({ name: "", type: "BANK" as SourceType, icon: "" });

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
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Premium Add Card */}
      <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-primary/5 p-[1px]">
        <div className="bg-card/40 backdrop-blur-3xl p-6 rounded-[2.5rem] flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tighter">Your Accounts</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Banks, Cards & Wallets</p>
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
              <DialogFooter className="gap-2">
                <Button variant="ghost" className="rounded-2xl h-12 font-bold" onClick={() => setDialogOpen(false)}>CANCEL</Button>
                <Button
                  onClick={handleAdd}
                  disabled={isPending}
                  className="flex-1 rounded-2xl h-12 bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20"
                >
                  {isPending ? "ADDING..." : "SAVE ACCOUNT"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {initialSources.length === 0 ? (
          <div className="bg-muted/10 border border-dashed border-border/50 rounded-[2.5rem] p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p className="text-sm text-muted-foreground font-medium">No accounts linked yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {initialSources.map((src) => {
              const ConfigIcon = typeConfig[src.type].icon;
              const isCreditCard = src.type === "CREDIT_CARD";
              const balanceValue = (src as any).balance ?? 0;
              
              return (
                <div
                  key={src.id}
                  className="flex flex-col items-center gap-3 p-6 rounded-[2.5rem] bg-card/30 border border-border/40 hover:border-primary/30 transition-all active:scale-[0.98] relative group overflow-hidden text-center"
                >
                  <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-2xl transition-transform group-hover:scale-110", typeConfig[src.type].color)}>
                    {src.icon ? <span>{src.icon}</span> : <ConfigIcon className="w-8 h-8" />}
                  </div>
                  <div className="space-y-1 w-full px-1">
                    <p className="font-black text-sm tracking-tight truncate uppercase">{src.name}</p>
                    <div className="flex flex-col items-center">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 mb-1">{src.type}</p>
                      <p className={cn(
                        "text-sm font-black italic",
                        isCreditCard ? "text-red-500" : "text-green-500"
                      )}>
                        {isCreditCard ? "DUE: " : ""}₹{balanceValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteId(src.id)}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all active:scale-125"
                    id={`delete-src-${src.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
