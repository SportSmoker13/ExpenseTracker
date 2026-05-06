"use client";

import { useState, useTransition } from "react";
import { SourceType } from "@/lib/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { addSource } from "@/app/actions/sourceActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function SourceCreator() {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
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

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-muted/20 p-[1px]">
      <div className="bg-card/40 backdrop-blur-3xl p-4 rounded-3xl flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black tracking-tight">Add New Account</h3>
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Banks, Cards & Wallets</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            id="add-source-btn"
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-[10px] font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> CREATE
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
  );
}
