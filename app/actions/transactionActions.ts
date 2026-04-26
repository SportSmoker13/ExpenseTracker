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
  toSourceId: z.preprocess((v) => (v === "" ? null : v), z.string().optional().nullable()),
  personId: z.preprocess((v) => (v === "" ? null : v), z.string().optional().nullable()),
  loanId: z.preprocess((v) => (v === "" ? null : v), z.string().optional().nullable()),
  investmentId: z.preprocess((v) => (v === "" ? null : v), z.string().optional().nullable()),
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
  investmentId?: string | null;
}) {
  const userId = await getUserId();
  const parsed = TransactionSchema.parse(data);

  const transaction = await prisma.transaction.create({
    data: { ...parsed, userId },
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/sources");
  revalidatePath("/people");
  revalidatePath("/loans");
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
    investmentId?: string | null;
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
  revalidatePath("/sources");
  revalidatePath("/people");
  revalidatePath("/loans");
  return { success: true, transaction };
}

export async function deleteTransaction(id: string) {
  const userId = await getUserId();
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Transaction not found");

  await prisma.transaction.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/sources");
  revalidatePath("/people");
  revalidatePath("/loans");
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

  const categoryIds = expensesByCategory.map((e) => e.categoryId).filter((id): id is string => id !== null);
  const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const expensesByCategoryFormatted = expensesByCategory.map((e) => ({
    category: categoryMap[e.categoryId]?.name ?? "Unknown",
    color: categoryMap[e.categoryId]?.colorCode ?? "#6366f1",
    amount: e._sum.amount ?? 0,
  }));

  // Calculate Liquid Balance at the start of the month
  const [initialIn, initialOut] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId,
        date: { lt: monthStart },
        OR: [
          { type: "INCOME", source: { type: { in: ["BANK", "CASH"] } } },
          { type: "TRANSFER", toSource: { type: { in: ["BANK", "CASH"] } } },
        ],
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        date: { lt: monthStart },
        source: { type: { in: ["BANK", "CASH"] } },
        NOT: { type: "INCOME" },
      },
      _sum: { amount: true },
    }),
  ]);

  let runningBalance = (initialIn._sum.amount ?? 0) - (initialOut._sum.amount ?? 0);

  // Daily cash flow for current month
  const daysInMonth = now.getDate();
  const cashFlow = [];

  for (let i = 0; i < daysInMonth; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), i + 1);
    const from = new Date(date.setHours(0, 0, 0, 0));
    const to = new Date(date.setHours(23, 59, 59, 999));
    const label = format(date, "d MMM");

    const [dayIn, dayOut, dayExpenses] = await Promise.all([
      // Money into liquid sources
      prisma.transaction.aggregate({
        where: {
          userId,
          date: { gte: from, lte: to },
          OR: [
            { type: "INCOME", source: { type: { in: ["BANK", "CASH"] } } },
            { type: "TRANSFER", toSource: { type: { in: ["BANK", "CASH"] } } },
          ],
        },
        _sum: { amount: true },
      }),
      // Money out of liquid sources
      prisma.transaction.aggregate({
        where: {
          userId,
          date: { gte: from, lte: to },
          source: { type: { in: ["BANK", "CASH"] } },
          NOT: { type: "INCOME" },
        },
        _sum: { amount: true },
      }),
      // Pure expenses (for the red line)
      prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE", date: { gte: from, lte: to } },
        _sum: { amount: true },
      }),
    ]);

    runningBalance += (dayIn._sum.amount ?? 0) - (dayOut._sum.amount ?? 0);

    cashFlow.push({
      month: label,
      income: runningBalance, // Mapping balance to 'income' key for green line
      expense: dayExpenses._sum.amount ?? 0,
    });
  }

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

  const totalLent = (lentAgg._sum.amount ?? 0) - (borrowedAgg._sum.amount ?? 0);

  // Unified Liability & Asset Calculation
  const allSources = await prisma.source.findMany({
    where: { userId },
    include: { loans: { include: { transactions: { select: { amount: true } } } } }
  });

  let liquidCash = 0;
  let totalCardDue = 0;

  for (const src of allSources) {
    const [outAgg, inAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, sourceId: src.id, NOT: { type: "INCOME" } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          OR: [
            { type: "INCOME", sourceId: src.id },
            { type: "TRANSFER", toSourceId: src.id },
          ],
        },
        _sum: { amount: true },
      })
    ]);

    const totalOut = outAgg._sum.amount ?? 0;
    const totalIn = inAgg._sum.amount ?? 0;
    
    let loanDebt = 0;
    src.loans.forEach(loan => {
      const paid = (loan.transactions || []).reduce((acc, tx) => acc + tx.amount, 0);
      loanDebt += Math.max(0, loan.totalAmount - paid);
    });

    if (src.type === "BANK" || src.type === "CASH") {
      liquidCash += (totalIn - totalOut);
    } else if (src.type === "CREDIT_CARD") {
      // Balance is (In - Out) - LoanDebt. Negative means debt.
      const balance = (totalIn - totalOut) - loanDebt;
      totalCardDue += Math.abs(Math.min(0, balance));
    }
  }

  const totalInvested = allInvestment._sum.amount ?? 0;

  const allLoans = await prisma.loan.findMany({
    where: { userId },
    include: { transactions: { select: { amount: true } } }
  });

  let totalLoanAmount = 0;
  let totalLoanRepaid = 0;
  allLoans.forEach(loan => {
    totalLoanAmount += loan.totalAmount;
    totalLoanRepaid += (loan.transactions || []).reduce((acc, tx) => acc + tx.amount, 0);
  });

  return {
    monthlyIncome,
    monthlyExpenses,
    monthlyInvested,
    totalBalance,
    totalLent,
    totalCardDue,
    totalInvested,
    liquidCash,
    totalLoanAmount,
    totalLoanRepaid,
    expensesByCategory: expensesByCategoryFormatted,
    cashFlow,
    recentTransactions,
  };
}
