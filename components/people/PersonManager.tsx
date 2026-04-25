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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">People (Lending/Borrowing)</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            id="add-person-btn"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 text-xs font-semibold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Person
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Person</DialogTitle>
              <DialogDescription>Track money lent to or borrowed from this person.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="per-name">Full Name</Label>
                <Input
                  id="per-name"
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button
                id="save-person-btn"
                onClick={handleAdd}
                disabled={isPending}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Adding…</> : "Add Person"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {initialPeople.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-2xl">
          <p className="text-sm text-muted-foreground">No people added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialPeople.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-orange-500/50 transition-all group relative"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-xl">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{person.name}</p>
                <p className="text-xs text-muted-foreground">Linked transactions</p>
              </div>
              <button
                onClick={() => setDeleteId(person.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all absolute top-2 right-2 p-1"
                id={`delete-person-${person.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

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
