"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { TransactionType } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

const TransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  date: z.date(),
  type: z.nativeEnum(TransactionType),
  description: z.string().optional(),
  categoryId: z.preprocess((v) => (v === "" ? null : v), z.string().optional().nullable()),
  sourceId: z.preprocess((v) => (v === "" ? null : v), z.string().optional().nullable()),
  personId: z.preprocess((v) => (v === "" ? null : v), z.string().optional().nullable()),
  loanId: z.preprocess((v) => (v === "" ? null : v), z.string().optional().nullable()),
});

async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function addTransaction(data: {
  amount: number;
  date: Date;
  type: TransactionType;
  description?: string;
  categoryId?: string | null;
  sourceId?: string | null;
  toSourceId?: string | null;
  personId?: string | null;
  loanId?: string | null;
}) {
  const userId = await getUserId();
  const parsed = TransactionSchema.parse(data);

  const transaction = await prisma.transaction.create({
    data: { ...parsed, userId },
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true, transaction };
}

export async function updateTransaction(
  id: string,
  data: {
    amount: number;
    date: Date;
    type: TransactionType;
    description?: string;
    categoryId?: string | null;
    sourceId?: string | null;
    toSourceId?: string | null;
    personId?: string | null;
    loanId?: string | null;
  }
) {
  const userId = await getUserId();
  const parsed = TransactionSchema.parse(data);

  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Transaction not found");

  const transaction = await prisma.transaction.update({
    where: { id },
    data: parsed,
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true, transaction };
}

export async function deleteTransaction(id: string) {
  const userId = await getUserId();
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Transaction not found");

  await prisma.transaction.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true };
}

export async function getTransactions(filters?: {
  from?: Date;
  to?: Date;
  type?: TransactionType;
  categoryId?: string;
  page?: number;
  pageSize?: number;
}) {
  const userId = await getUserId();
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;

  const where = {
    userId,
    ...(filters?.type && { type: filters.type }),
    ...(filters?.categoryId && { categoryId: filters.categoryId }),
    ...((filters?.from || filters?.to) && {
      date: {
        ...(filters.from && { gte: filters.from }),
        ...(filters.to && { lte: filters.to }),
      },
    }),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true, source: true, toSource: true, person: true, loan: true },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total, page, pageSize };
}

export async function getDashboardMetrics() {
  const userId = await getUserId();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Current month aggregates
  const [incomeAgg, expenseAgg, investmentAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "INVESTMENT", date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
  ]);

  // All-time totals for balance
  const [allIncome, allExpense, allInvestment] = await Promise.all([
    prisma.transaction.aggregate({ where: { userId, type: "INCOME" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, type: "EXPENSE" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, type: "INVESTMENT" }, _sum: { amount: true } }),
  ]);

  // Expenses by category (current month)
  const expensesByCategory = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, type: "EXPENSE", date: { gte: monthStart, lte: monthEnd } },
    _sum: { amount: true },
  });

  const categoryIds = expensesByCategory.map((e) => e.categoryId);
  const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const expensesByCategoryFormatted = expensesByCategory.map((e) => ({
    category: categoryMap[e.categoryId]?.name ?? "Unknown",
    color: categoryMap[e.categoryId]?.colorCode ?? "#6366f1",
    amount: e._sum.amount ?? 0,
  }));

  // 6-month cash flow
  const cashFlow = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, 5 - i);
      const from = startOfMonth(date);
      const to = endOfMonth(date);
      const month = format(date, "MMM");
      return Promise.all([
        prisma.transaction.aggregate({ where: { userId, type: "INCOME", date: { gte: from, lte: to } }, _sum: { amount: true } }),
        prisma.transaction.aggregate({ where: { userId, type: "EXPENSE", date: { gte: from, lte: to } }, _sum: { amount: true } }),
      ]).then(([inc, exp]) => ({
        month,
        income: inc._sum.amount ?? 0,
        expense: exp._sum.amount ?? 0,
      }));
    })
  );

  const monthlyIncome = incomeAgg._sum.amount ?? 0;
  const monthlyExpenses = expenseAgg._sum.amount ?? 0;
  const monthlyInvested = investmentAgg._sum.amount ?? 0;
  const totalBalance =
    (allIncome._sum.amount ?? 0) - (allExpense._sum.amount ?? 0) - (allInvestment._sum.amount ?? 0);

  // Recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: { userId },
    include: { category: true, source: true, toSource: true, person: true, loan: true },
    orderBy: { date: "desc" },
    take: 5,
  });

  // Lending Summary
  const lentAgg = await prisma.transaction.aggregate({
    where: { userId, personId: { not: null }, type: "EXPENSE" },
    _sum: { amount: true },
  });
  const borrowedAgg = await prisma.transaction.aggregate({
    where: { userId, personId: { not: null }, type: "INCOME" },
    _sum: { amount: true },
  });

  // Credit Card Due Summary (Transactions + Loan Debt)
  const cardExpenseAgg = await prisma.transaction.aggregate({
    where: { userId, source: { type: "CREDIT_CARD" }, loanId: null },
    _sum: { amount: true },
  });
  const cardPaymentAgg = await prisma.transaction.aggregate({
    where: { userId, toSource: { type: "CREDIT_CARD" }, type: "TRANSFER" },
    _sum: { amount: true },
  });

  const cardLoans = await prisma.loan.findMany({
    where: { userId, source: { type: "CREDIT_CARD" } },
    include: { transactions: { select: { amount: true } } }
  });

  let cardLoanDebt = 0;
  cardLoans.forEach(loan => {
    const paid = (loan.transactions || []).reduce((acc, tx) => acc + tx.amount, 0);
    cardLoanDebt += Math.max(0, loan.totalAmount - paid);
  });

  const totalLent = (lentAgg._sum.amount ?? 0) - (borrowedAgg._sum.amount ?? 0);
  const totalCardDue = (cardExpenseAgg._sum.amount ?? 0) - (cardPaymentAgg._sum.amount ?? 0) + cardLoanDebt;

  return {
    monthlyIncome,
    monthlyExpenses,
    monthlyInvested,
    totalBalance,
    totalLent,
    totalCardDue,
    expensesByCategory: expensesByCategoryFormatted,
    cashFlow,
    recentTransactions,
  };
}
