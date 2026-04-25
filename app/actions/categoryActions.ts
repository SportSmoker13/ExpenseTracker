"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { TransactionType } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(TransactionType),
  colorCode: z.string().optional(),
  icon: z.string().optional(),
});

async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function addCategory(data: {
  name: string;
  type: TransactionType;
  colorCode?: string;
  icon?: string;
}) {
  const userId = await getUserId();
  const parsed = CategorySchema.parse(data);

  const category = await prisma.category.create({
    data: { ...parsed, userId },
  });

  revalidatePath("/categories");
  revalidatePath("/");
  return { success: true, category };
}

export async function getCategories(type?: TransactionType) {
  const userId = await getUserId();
  return prisma.category.findMany({
    where: { userId, ...(type && { type }) },
    orderBy: { name: "asc" },
  });
}

export async function deleteCategory(id: string) {
  const userId = await getUserId();
  const existing = await prisma.category.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Category not found");

  const txCount = await prisma.transaction.count({ where: { categoryId: id } });
  if (txCount > 0) {
    throw new Error(
      `Cannot delete: ${txCount} transaction(s) are linked to this category.`
    );
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
  return { success: true };
}

const DEFAULT_CATEGORIES = [
  { name: "Salary", type: "INCOME" as TransactionType, colorCode: "#22c55e", icon: "💼" },
  { name: "Freelance", type: "INCOME" as TransactionType, colorCode: "#16a34a", icon: "💻" },
  { name: "Other Income", type: "INCOME" as TransactionType, colorCode: "#4ade80", icon: "💰" },
  { name: "Groceries", type: "EXPENSE" as TransactionType, colorCode: "#f97316", icon: "🛒" },
  { name: "Rent", type: "EXPENSE" as TransactionType, colorCode: "#ef4444", icon: "🏠" },
  { name: "Utilities", type: "EXPENSE" as TransactionType, colorCode: "#f43f5e", icon: "💡" },
  { name: "Entertainment", type: "EXPENSE" as TransactionType, colorCode: "#a855f7", icon: "🎬" },
  { name: "Transport", type: "EXPENSE" as TransactionType, colorCode: "#3b82f6", icon: "🚗" },
  { name: "Healthcare", type: "EXPENSE" as TransactionType, colorCode: "#ec4899", icon: "🏥" },
  { name: "Stocks", type: "INVESTMENT" as TransactionType, colorCode: "#6366f1", icon: "📈" },
  { name: "Crypto", type: "INVESTMENT" as TransactionType, colorCode: "#8b5cf6", icon: "₿" },
  { name: "Mutual Funds", type: "INVESTMENT" as TransactionType, colorCode: "#7c3aed", icon: "📊" },
];

export async function seedDefaultCategories(userId: string) {
  const existing = await prisma.category.count({ where: { userId } });
  if (existing > 0) return;

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })),
  });
}
