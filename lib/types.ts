import type { 
  Category as PrismaCategory, 
  Transaction as PrismaTransaction, 
  Source as PrismaSource,
  Person as PrismaPerson,
  Investment as PrismaInvestment
} from "@prisma/client";

export type TransactionType = "INCOME" | "EXPENSE" | "INVESTMENT" | "TRANSFER";
export const TransactionType = {
  INCOME: "INCOME" as const,
  EXPENSE: "EXPENSE" as const,
  INVESTMENT: "INVESTMENT" as const,
  TRANSFER: "TRANSFER" as const,
};

export type SourceType = "BANK" | "CREDIT_CARD" | "CASH" | "OTHER";
export const SourceType = {
  BANK: "BANK" as const,
  CREDIT_CARD: "CREDIT_CARD" as const,
  CASH: "CASH" as const,
  OTHER: "OTHER" as const,
};

export type Category = Omit<PrismaCategory, "type"> & { type: TransactionType };
export type Person = PrismaPerson;
export type Investment = PrismaInvestment;

export type Loan = {
  id: string;
  userId: string;
  name: string;
  totalAmount: number;
  startDate: Date | string;
  sourceId: string;
  createdAt: Date;
  updatedAt: Date;
  source?: Source;
  transactions?: Transaction[];
};

export type Source = Omit<PrismaSource, "type"> & { 
  type: SourceType;
  loans?: Loan[];
};

export type Transaction = Omit<PrismaTransaction, "type"> & { 
  type: TransactionType;
  sourceId: string | null;
  toSourceId: string | null;
  personId: string | null;
  loanId: string | null;
  investmentId: string | null;
};

export type FullTransaction = Transaction & { 
  category: Category | null;
  source: Source | null;
  toSource: Source | null;
  person: Person | null;
  loan: Loan | null;
  investment: Investment | null;
};
