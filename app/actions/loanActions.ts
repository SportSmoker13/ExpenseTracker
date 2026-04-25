"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const LoanSchema = z.object({
  name: z.string().min(1, "Loan name is required"),
  totalAmount: z.coerce.number().positive("Amount must be positive"),
  sourceId: z.string().min(1, "Please link an account"),
  startDate: z.date().optional(),
});

async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function addLoan(data: z.infer<typeof LoanSchema>) {
  const userId = await getUserId();
  const parsed = LoanSchema.parse(data);

  const loan = await prisma.loan.create({
    data: {
      ...parsed,
      userId,
      startDate: parsed.startDate || new Date(),
    },
  });

  revalidatePath("/categories");
  return { success: true, loan };
}

export async function getLoans() {
  const userId = await getUserId();
  return prisma.loan.findMany({
    where: { userId },
    include: {
      source: true,
      transactions: {
        select: {
          amount: true,
          type: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteLoan(id: string) {
  const userId = await getUserId();
  await prisma.loan.delete({
    where: { id, userId },
  });
  revalidatePath("/categories");
  return { success: true };
}
