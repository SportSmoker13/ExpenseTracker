"use client";

import { useState, useTransition } from "react";
import { TransactionType } from "@prisma/client";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@prisma/client";

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
  const [form, setForm] = useState({ name: "", type: "EXPENSE" as TransactionType, colorCode: "#6366f1", icon: "" });

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
        setForm({ name: "", type: "EXPENSE", colorCode: "#6366f1", icon: "" });
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
    <div className="space-y-8">
      {/* Add button */}
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            id="add-category-btn"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[oklch(0.55_0.22_280)] hover:bg-[oklch(0.6_0.24_280)] text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Category
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
              <DialogDescription>Create a custom category for your transactions.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  id="cat-name"
                  placeholder="e.g. Dining Out"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-type">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TransactionType })}>
                  <SelectTrigger id="cat-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">💰 Income</SelectItem>
                    <SelectItem value="EXPENSE">💸 Expense</SelectItem>
                    <SelectItem value="INVESTMENT">📈 Investment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-icon">Icon (emoji, optional)</Label>
                <Input
                  id="cat-icon"
                  placeholder="🍕"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-7 h-7 rounded-full transition-all duration-200 hover:scale-110",
                        form.colorCode === color && "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setForm({ ...form, colorCode: color })}
                      id={`color-${color.replace("#", "")}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button
                id="save-category-btn"
                onClick={handleAdd}
                disabled={isPending}
                className="bg-[oklch(0.55_0.22_280)] text-white hover:bg-[oklch(0.6_0.24_280)]"
              >
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating…</> : "Create Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Groups */}
      {(["INCOME", "EXPENSE", "INVESTMENT"] as TransactionType[]).map((type) => (
        <div key={type}>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className={cn("text-xs px-3 py-1", typeConfig[type].color)}>
              {typeConfig[type].label}
            </Badge>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{grouped[type].length} categories</span>
          </div>

          {grouped[type].length === 0 ? (
            <p className="text-sm text-muted-foreground pl-2">No {typeConfig[type].label.toLowerCase()} categories yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {grouped[type].map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${cat.colorCode}20` }}
                  >
                    <span>{cat.icon ?? "📁"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cat.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.colorCode ?? "#6366f1" }} />
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    id={`delete-cat-${cat.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
