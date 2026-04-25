"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TransactionType } from "@/lib/types";
import type { Category, Transaction } from "@/lib/types";

import { addTransaction, updateTransaction } from "@/app/actions/transactionActions";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const schema = z.object({
  amount: z.preprocess((v) => Number(v), z.number().positive("Amount must be positive")),
  date: z.date(),
  type: z.nativeEnum(TransactionType),
  categoryId: z.string().min(1, "Select a category"),
  description: z.string().optional(),
});

type FormData = {
  amount: number;
  date: Date;
  type: TransactionType;
  categoryId: string;
  description?: string;
};

interface NewTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  editTransaction?: Transaction & { category: Category };
}

export function NewTransactionSheet({
  open,
  onOpenChange,
  categories,
  editTransaction,
}: NewTransactionSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedType, setSelectedType] = useState<TransactionType>(
    editTransaction?.type ?? TransactionType.EXPENSE
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      amount: undefined,
      date: new Date(),
      type: TransactionType.EXPENSE,
      categoryId: "",
      description: "",
    },
  });

  const selectedDate = watch("date");
  const selectedCategoryId = watch("categoryId");

  useEffect(() => {
    if (open) {
      if (editTransaction) {
        reset({
          amount: editTransaction.amount,
          date: new Date(editTransaction.date),
          type: editTransaction.type,
          categoryId: editTransaction.categoryId,
          description: editTransaction.description ?? "",
        });
        setSelectedType(editTransaction.type);
      } else {
        reset({ amount: undefined, date: new Date(), type: TransactionType.EXPENSE, categoryId: "", description: "" });
        setSelectedType(TransactionType.EXPENSE);
      }
    }
  }, [open, editTransaction, reset]);

  const filteredCategories = categories.filter((c) => c.type === selectedType);

  const onTypeChange = (type: string) => {
    setSelectedType(type as TransactionType);
    setValue("type", type as TransactionType);
    setValue("categoryId", "");
  };

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      try {
        if (editTransaction) {
          await updateTransaction(editTransaction.id, data);
          toast.success("Transaction updated!");
        } else {
          await addTransaction(data);
          toast.success("Transaction added!");
        }
        onOpenChange(false);
      } catch (err) {
        toast.error((err as Error).message ?? "Something went wrong");
      }
    });
  };

  const typeColors: Record<TransactionType, string> = {
    INCOME: "data-[state=active]:bg-green-500 data-[state=active]:text-white",
    EXPENSE: "data-[state=active]:bg-red-500 data-[state=active]:text-white",
    INVESTMENT: "data-[state=active]:bg-purple-500 data-[state=active]:text-white",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card" side="right">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold">
            {editTransaction ? "Edit Transaction" : "New Transaction"}
          </SheetTitle>
          <SheetDescription>
            {editTransaction ? "Update the details below." : "Fill in the details to record your transaction."}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4">
        <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="space-y-6">
            {/* Type Tabs */}
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Tabs value={selectedType} onValueChange={onTypeChange} className="w-full">
                <TabsList className="w-full grid grid-cols-3 bg-muted">
                  {[TransactionType.INCOME, TransactionType.EXPENSE, TransactionType.INVESTMENT].map((type) => (
                    <TabsTrigger
                      key={type}
                      value={type}
                      className={cn("text-xs font-semibold transition-all", typeColors[type])}
                      id={`type-tab-${type.toLowerCase()}`}
                    >
                      {type === "INCOME" ? "💰 Income" : type === "EXPENSE" ? "💸 Expense" : "📈 Invest"}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="tx-amount">Amount (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                <Input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  {...register("amount")}
                />
              </div>
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger
                  id="tx-date-picker"
                  className="w-full flex items-center justify-start gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                >
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(d) => d && field.onChange(d)}
                        initialFocus
                      />
                    )}
                  />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => { if (v) field.onChange(v); }}
                  >
                    <SelectTrigger id="tx-category" className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                          No categories for this type.
                        </div>
                      ) : (
                        filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span>{cat.icon ?? "📁"}</span>
                              <span>{cat.name}</span>
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="tx-description">Description (optional)</Label>
              <Textarea
                id="tx-description"
                placeholder="Add a note..."
                rows={3}
                className="resize-none"
                {...register("description")}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[oklch(0.55_0.22_280)] hover:bg-[oklch(0.6_0.24_280)] text-white py-5 font-semibold rounded-xl shadow-lg shadow-[oklch(0.55_0.22_280)]/25"
              id="tx-submit-btn"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />{editTransaction ? "Updating..." : "Adding..."}</>
              ) : (
                editTransaction ? "Update Transaction" : "Add Transaction"
              )}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
