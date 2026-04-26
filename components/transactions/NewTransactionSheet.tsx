"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TransactionType } from "@/lib/types";
import type { Category, Transaction, Source, Person } from "@/lib/types";

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
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.date(),
  type: z.nativeEnum(TransactionType),
  categoryId: z.string().nullable().optional(),
  sourceId: z.string().min(1, "Please select an account"),
  toSourceId: z.string().nullable().optional(),
  personId: z.string().nullable().optional(),
  loanId: z.string().nullable().optional(),
  investmentId: z.string().nullable().optional(),
  description: z.string().optional(),
});

type FormData = {
  amount: number;
  date: Date;
  type: TransactionType;
  categoryId?: string | null;
  sourceId?: string | null;
  toSourceId?: string | null;
  personId?: string | null;
  loanId?: string | null;
  investmentId?: string | null;
  description?: string;
};

interface Investment {
  id: string;
  name: string;
}

interface NewTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  sources: Source[];
  people: Person[];
  loans: Loan[];
  investments: Investment[];
  initialData?: Partial<FormData>;
  editTransaction?: Transaction & { category?: Category | null; source?: Source | null; toSource?: Source | null; person?: Person | null; loan?: Loan | null, investment?: Investment | null };
}

export function NewTransactionSheet({
  open,
  onOpenChange,
  categories,
  sources,
  people,
  loans,
  investments,
  initialData,
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
      sourceId: "",
      toSourceId: null,
      personId: null,
      loanId: null,
      investmentId: null,
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
          date: editTransaction.date ? new Date(editTransaction.date) : new Date(),
          type: editTransaction.type,
          categoryId: editTransaction.categoryId || null,
          sourceId: editTransaction.sourceId || null,
          toSourceId: editTransaction.toSourceId || null,
          personId: editTransaction.personId || null,
          loanId: editTransaction.loanId || null,
          investmentId: (editTransaction as any).investmentId || null,
          description: editTransaction.description || "",
        });
        setSelectedType(editTransaction.type);
      } else {
        reset({ 
          amount: initialData?.amount ?? undefined, 
          date: initialData?.date ?? new Date(), 
          type: initialData?.type ?? TransactionType.EXPENSE, 
          categoryId: initialData?.categoryId ?? null, 
          sourceId: initialData?.sourceId ?? "", 
          toSourceId: initialData?.toSourceId ?? null, 
          personId: initialData?.personId ?? null, 
          loanId: initialData?.loanId ?? null,
          investmentId: initialData?.investmentId ?? null,
          description: initialData?.description ?? "" 
        });
        setSelectedType(initialData?.type ?? TransactionType.EXPENSE);
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

  const typeColors: Record<string, string> = {
    INCOME: "data-[state=active]:bg-green-500 data-[state=active]:text-white",
    EXPENSE: "data-[state=active]:bg-red-500 data-[state=active]:text-white",
    INVESTMENT: "data-[state=active]:bg-purple-500 data-[state=active]:text-white",
    TRANSFER: "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full h-[92vh] sm:h-[85vh] rounded-t-[2.5rem] overflow-y-auto bg-card border-none pt-10" side="bottom">
        <div className="w-12 h-1.5 bg-muted/40 rounded-full mx-auto absolute top-4 left-1/2 -translate-x-1/2" />
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
                <TabsList className="w-full grid grid-cols-4 bg-muted">
                  {[TransactionType.INCOME, TransactionType.EXPENSE, TransactionType.INVESTMENT, TransactionType.TRANSFER].map((type) => (
                    <TabsTrigger
                      key={type}
                      value={type}
                      className={cn("text-xs font-semibold transition-all", typeColors[type])}
                      id={`type-tab-${type.toLowerCase()}`}
                    >
                      {type === "INCOME" ? "💰 In" : type === "EXPENSE" ? "💸 Out" : type === "INVESTMENT" ? "📈 Inv" : "🔄 Pay"}
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

            {/* Category - Only for non-transfers */}
            {selectedType !== "TRANSFER" && (
              <div className="space-y-2">
                <Label>Category</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={(v) => { if (v) field.onChange(v); }}
                    >
                      <SelectTrigger id="tx-category" className="w-full">
                        <SelectValue placeholder="Select a category">
                          {field.value && categories.find(c => c.id === field.value)?.name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                            No categories for this type.
                          </div>
                        ) : (
                          filteredCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id} textValue={cat.name}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
              </div>
            )}
            
            {/* Source - Label changes if transfer */}
            <div className="space-y-2">
              <Label>{selectedType === "TRANSFER" ? "From Account (Bank)" : "Source (Bank/Card)"}</Label>
              <Controller
                name="sourceId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "NONE"}
                    onValueChange={(v) => { field.onChange(v === "NONE" ? null : v); }}
                  >
                    <SelectTrigger id="tx-source" className="w-full">
                      <SelectValue placeholder="Select account">
                        {(() => {
                          const s = sources?.find(s => s.id === field.value);
                          return s ? `${s.name} - ${s.type}` : "Select account";
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {sources
                        .filter((src) => selectedType !== "TRANSFER" || src.type === "BANK" || src.type === "CASH")
                        .map((src) => (
                        <SelectItem key={src.id} value={src.id} textValue={`${src.name} - ${src.type}`}>
                          <div className="flex items-center gap-2">
                            <span>{src.icon ?? "💳"}</span>
                            <span>{src.name}</span>
                            <span className="text-[10px] opacity-40 font-bold uppercase ml-auto">({src.type})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.sourceId && <p className="text-xs text-destructive">{errors.sourceId.message}</p>}
            </div>

            {/* To Source - Only for Transfers */}
            {selectedType === "TRANSFER" && (
              <div className="space-y-2">
                <Label>To Account (Credit Card Bill)</Label>
                <Controller
                  name="toSourceId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "NONE"}
                      onValueChange={(v) => { field.onChange(v === "NONE" ? null : v); }}
                    >
                      <SelectTrigger id="tx-tosource" className="w-full">
                        <SelectValue placeholder="Select destination">
                          {(() => {
                            const s = sources?.find(s => s.id === field.value);
                            return s ? `${s.name} - ${s.type}` : null;
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Select target account</SelectItem>
                        {sources
                          .filter((src) => src.type === "CREDIT_CARD")
                          .map((src) => (
                          <SelectItem key={src.id} value={src.id} textValue={`${src.name} - ${src.type}`}>
                            <div className="flex items-center gap-2">
                              <span>{src.icon ?? "💳"}</span>
                              <span>{src.name}</span>
                              <span className="text-[10px] opacity-40 font-bold uppercase ml-auto">({src.type})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {/* Person */}
            <div className="space-y-2">
              <Label>Lent to / Borrowed from (optional)</Label>
              <Controller
                name="personId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "NONE"}
                    onValueChange={(v) => { field.onChange(v === "NONE" ? null : v); }}
                  >
                    <SelectTrigger id="tx-person" className="w-full">
                      <SelectValue placeholder="Select a person">
                        {field.value && people?.find(p => p.id === field.value)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id} textValue={person.name}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Loan Tagging */}
            <div className="space-y-2">
              <Label>Tag to Loan (optional)</Label>
              <Controller
                name="loanId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "NONE"}
                    onValueChange={(v) => { field.onChange(v === "NONE" ? null : v); }}
                  >
                    <SelectTrigger id="tx-loan" className="w-full">
                      <SelectValue placeholder="Select a loan">
                        {field.value && loans?.find(l => l.id === field.value)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      {loans.map((loan) => (
                        <SelectItem key={loan.id} value={loan.id} textValue={loan.name}>
                          {loan.name} (₹{loan.totalAmount.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Investment Portfolio Tagging */}
            <div className="space-y-2">
              <Label>Tag to Portfolio (optional)</Label>
              <Controller
                name="investmentId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "NONE"}
                    onValueChange={(v) => { field.onChange(v === "NONE" ? null : v); }}
                  >
                    <SelectTrigger id="tx-investment" className="w-full">
                      <SelectValue placeholder="Select a portfolio">
                        {field.value && investments?.find(i => i.id === field.value)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      {investments.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id} textValue={inv.name}>
                          {inv.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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
