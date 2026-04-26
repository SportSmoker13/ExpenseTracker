"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const InvestmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().default("OTHER"),
  icon: z.string().optional(),
});

async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function addInvestment(data: { name: string, type?: string, icon?: string }) {
  const userId = await getUserId();
  const parsed = InvestmentSchema.parse(data);

  const investment = await prisma.investment.create({
    data: { ...parsed, userId },
  });

  revalidatePath("/categories");
  revalidatePath("/");
  return { success: true, investment };
}

export async function getInvestments() {
  const userId = await getUserId();
  // Ensure the investment property exists before calling findMany
  if (!prisma.investment) {
    console.error("Prisma client not generated with Investment model. Run 'npx prisma generate'");
    return [];
  }
  
  return prisma.investment.findMany({
    where: { userId },
    include: {
      transactions: {
        select: { amount: true, type: true }
      }
    },
    orderBy: { name: "asc" },
  });
}

export async function getInvestmentTransactions(investmentId: string) {
  const userId = await getUserId();
  return prisma.transaction.findMany({
    where: { investmentId, userId },
    include: {
      category: true,
      source: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function deleteInvestment(id: string) {
  const userId = await getUserId();
  const existing = await prisma.investment.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Investment not found");

  const txCount = await prisma.transaction.count({ where: { investmentId: id } });
  if (txCount > 0) {
    throw new Error(
      `Cannot delete: ${txCount} transaction(s) are linked to this investment.`
    );
  }

  await prisma.investment.delete({ where: { id } });
  revalidatePath("/categories");
  return { success: true };
}
