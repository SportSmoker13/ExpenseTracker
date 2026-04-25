"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { SourceType } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(SourceType),
  icon: z.string().optional(),
});

async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function addSource(data: {
  name: string;
  type: SourceType;
  icon?: string;
}) {
  const userId = await getUserId();
  const parsed = SourceSchema.parse(data);

  const source = await prisma.source.create({
    data: { ...parsed, userId },
  });

  revalidatePath("/sources");
  revalidatePath("/");
  return { success: true, source };
}

export async function getSources() {
  const userId = await getUserId();
  return prisma.source.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function deleteSource(id: string) {
  const userId = await getUserId();
  const existing = await prisma.source.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Source not found");

  const txCount = await prisma.transaction.count({ where: { sourceId: id } });
  if (txCount > 0) {
    throw new Error(
      `Cannot delete: ${txCount} transaction(s) are linked to this source.`
    );
  }

  await prisma.source.delete({ where: { id } });
  revalidatePath("/categories");
  return { success: true };
}

export async function getSourceSummaries() {
  const userId = await getUserId();
  const sources = await prisma.source.findMany({
    where: { userId },
    include: {
      loans: {
        include: {
          transactions: {
            select: { amount: true }
          }
        }
      }
    }
  });

  const summaries = await Promise.all(
    sources.map(async (src) => {
      // Amount spent/out from this source 
      // Important: Exclude transactions tagged to loans to avoid double-counting debt
      const outAgg = await prisma.transaction.aggregate({
        where: { userId, sourceId: src.id, NOT: { type: "INCOME" }, loanId: null },
        _sum: { amount: true },
      });

      // Amount coming in to this source (Income or Transfer In)
      const inAgg = await prisma.transaction.aggregate({
        where: {
          userId,
          OR: [
            { type: "INCOME", sourceId: src.id },
            { type: "TRANSFER", toSourceId: src.id },
          ],
        },
        _sum: { amount: true },
      });

      const totalOut = outAgg._sum.amount ?? 0;
      const totalIn = inAgg._sum.amount ?? 0;
      
      // Calculate remaining loan debt for this source
      let loanDebt = 0;
      if (src.type === "CREDIT_CARD") {
        src.loans.forEach(loan => {
          const paid = (loan.transactions || []).reduce((acc, tx) => acc + tx.amount, 0);
          loanDebt += Math.max(0, loan.totalAmount - paid);
        });
      }

      // For Banks: Balance = In - Out (External loans don't touch this balance)
      // For Cards: Due = (Out - In) + LoanDebt
      const balance = src.type === "CREDIT_CARD" 
        ? (totalOut - totalIn) + loanDebt 
        : totalIn - totalOut;

      return {
        ...src,
        balance,
      };
    })
  );

  return summaries;
}

export async function getSourceTransactions(sourceId: string) {
  const userId = await getUserId();
  return prisma.transaction.findMany({
    where: {
      userId,
      OR: [{ sourceId }, { toSourceId: sourceId }],
    },
    include: {
      category: true,
      source: true,
      toSource: true,
    },
    orderBy: { date: "desc" },
  });
}
