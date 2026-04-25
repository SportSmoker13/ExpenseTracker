import type { Category as PrismaCategory, Transaction as PrismaTransaction } from "@prisma/client";

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  INVESTMENT = "INVESTMENT",
}

export type Category = PrismaCategory;
export type Transaction = PrismaTransaction;

export type FullTransaction = Transaction & { category: Category };
