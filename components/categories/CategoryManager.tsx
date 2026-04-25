"use client";

import { useState, useTransition } from "react";
import { TransactionType } from "@/lib/types";
import type { Category } from "@/lib/types";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { addCategory, deleteCategory } from "@/app/actions/categoryActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryManagerProps {
  categories: Category[];
}

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6",
];

const typeConfig = {
  INCOME: { label: "Income", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  EXPENSE: { label: "Expense", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  INVESTMENT: { label: "Investment", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
};

export function CategoryManager({ categories: initialCategories }: CategoryManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    type: TransactionType;
    colorCode: string;
    icon: string;
  }>({ name: "", type: TransactionType.EXPENSE, colorCode: "#6366f1", icon: "" });

  const handleAdd = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    startTransition(async () => {
      try {
        await addCategory(form);
        toast.success("Category created!");
        setDialogOpen(false);
        setForm({ name: "", type: TransactionType.EXPENSE, colorCode: "#6366f1", icon: "" });
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteCategory(id);
        toast.success("Category deleted");
        setDeleteId(null);
      } catch (err) {
        toast.error((err as Error).message);
        setDeleteId(null);
      }
    });
  };

  const grouped = {
    INCOME: initialCategories.filter((c) => c.type === "INCOME"),
    EXPENSE: initialCategories.filter((c) => c.type === "EXPENSE"),
    INVESTMENT: initialCategories.filter((c) => c.type === "INVESTMENT"),
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      {/* Premium Add Card */}
      <div className="relative group overflow-hidden rounded-3xl bg-muted/20 p-[1px]">
        <div className="bg-card/40 backdrop-blur-3xl p-4 rounded-3xl flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black tracking-tight">Your Categories</h3>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Personalize your records</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              id="add-category-btn"
              className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" /> CREATE
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none bg-card/95 backdrop-blur-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">New Category</DialogTitle>
                <DialogDescription className="text-xs font-medium">Add a custom label to your financial records.</DialogDescription>
              </DialogHeader>
              {/* Internal form content stays similar but with better styling */}
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Category Name</Label>
                  <Input
                    placeholder="e.g. Shopping"
                    value={form.name}
                    className="h-12 rounded-2xl bg-muted/30 border-none px-4 font-bold"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TransactionType })}>
                      <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none px-4 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                        <SelectItem value="INVESTMENT">Invest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Icon</Label>
                    <Input
                      placeholder="🍕"
                      value={form.icon}
                      className="h-12 rounded-2xl bg-muted/30 border-none px-4 text-center text-xl font-bold"
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Choose Accent</Label>
                  <div className="flex gap-2.5 flex-wrap justify-between bg-muted/20 p-4 rounded-3xl">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "w-8 h-8 rounded-full transition-all duration-300 hover:scale-125",
                          form.colorCode === color ? "ring-4 ring-primary shadow-lg scale-125" : "scale-100 opacity-60"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setForm({ ...form, colorCode: color })}
                      />
                    ))}
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
                  {isPending ? "CREATING..." : "SAVE CATEGORY"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Categories Groups */}
      {(["INCOME", "EXPENSE", "INVESTMENT"] as TransactionType[]).map((type) => (
        <div key={type} className="space-y-2">
          <div className="flex items-end justify-between px-1">
            <h4 className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              type === "INCOME" ? "text-green-500" : type === "EXPENSE" ? "text-red-500" : "text-purple-500"
            )}>
              {typeConfig[type].label}S
            </h4>
            <span className="text-[8px] font-black text-muted-foreground opacity-30">{grouped[type].length} TOTAL</span>
          </div>

          <div className="space-y-2">
            {grouped[type].length === 0 ? (
              <div className="bg-muted/10 border border-dashed border-border/50 rounded-[2rem] p-8 text-center">
                <p className="text-xs text-muted-foreground font-medium italic">No {typeConfig[type].label.toLowerCase()} categories created yet</p>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                {grouped[type].map((cat) => (
                  <div
                    key={cat.id}
                    className="flex-none w-36 flex flex-col items-center gap-3 p-5 rounded-[2.5rem] bg-card/40 border border-border/40 hover:border-primary/30 transition-all active:scale-[0.98] relative group overflow-hidden text-center shadow-sm"
                  >
                    <div
                      className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-2xl shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3"
                      style={{ backgroundColor: `${cat.colorCode}20` }}
                    >
                      {cat.icon ?? "📁"}
                    </div>
                    <div className="space-y-1 w-full px-1">
                      <p className="text-xs font-black tracking-tight truncate uppercase">{cat.name}</p>
                      <div className="flex justify-center">
                        <div className="h-0.5 w-8 rounded-full shadow-lg" style={{ backgroundColor: cat.colorCode, boxShadow: `0 0 10px ${cat.colorCode}60` }} />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setDeleteId(cat.id)}
                      className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all active:scale-125"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure? Categories with linked transactions cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => deleteId && handleDelete(deleteId)}
              id="confirm-delete-cat-btn"
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
