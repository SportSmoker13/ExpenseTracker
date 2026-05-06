"use client";

import { useState, useTransition } from "react";
import { Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { addPerson } from "@/app/actions/personActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function PersonCreator() {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "" });

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

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-muted/20 p-[1px]">
      <div className="bg-card/40 backdrop-blur-3xl p-4 rounded-3xl flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-black tracking-tighter">Add New Person</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Lending & Borrowing</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            id="add-person-btn"
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-orange-500 text-white text-[10px] font-black shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
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
  );
}
