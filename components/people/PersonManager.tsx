"use client";

import { useState, useTransition } from "react";
import type { Person } from "@/lib/types";
import { Plus, Trash2, Loader2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import { addPerson, deletePerson } from "@/app/actions/personActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PersonManagerProps {
  people: Person[];
}

export function PersonManager({ people: initialPeople }: PersonManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deletePerson(id);
        toast.success("Person removed");
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
            <h3 className="text-sm font-black tracking-tighter">Your Circle</h3>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Lending & Borrowing</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              id="add-person-btn"
              className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-orange-500 text-white text-xs font-black shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
            >
              <UserPlus className="w-5 h-5" /> ADD
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
            {initialPeople.map((person) => (
              <div
                key={person.id}
                className="flex-none w-40 flex flex-col items-center gap-3 p-5 rounded-[2.5rem] bg-card/40 border border-border/40 hover:border-orange-500/30 transition-all active:scale-[0.98] relative group overflow-hidden text-center shadow-sm"
              >
                <div className="w-12 h-12 rounded-[1.25rem] bg-orange-500/10 text-orange-500 flex items-center justify-center text-xl shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1 w-full px-1">
                  <p className="text-xs font-black tracking-tight truncate uppercase">{person.name}</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-40">Active Member</p>
                </div>
                <button
                  onClick={() => setDeleteId(person.id)}
                  className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all active:scale-125"
                  id={`delete-person-${person.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
