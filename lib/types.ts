import type { Category as PrismaCategory, Transaction as PrismaTransaction } from "@prisma/client";

export type TransactionType = "INCOME" | "EXPENSE" | "INVESTMENT";
export const TransactionType = {
  INCOME: "INCOME" as const,
  EXPENSE: "EXPENSE" as const,
  INVESTMENT: "INVESTMENT" as const,
};

export type Category = Omit<PrismaCategory, "type"> & { type: TransactionType };
export type Transaction = Omit<PrismaTransaction, "type"> & { type: TransactionType };

export type FullTransaction = Transaction & { category: Category };
