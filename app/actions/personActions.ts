"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PersonSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function addPerson(data: { name: string }) {
  const userId = await getUserId();
  const parsed = PersonSchema.parse(data);

  const person = await prisma.person.create({
    data: { ...parsed, userId },
  });

  revalidatePath("/categories"); // Assuming management is here
  revalidatePath("/");
  return { success: true, person };
}

export async function getPeople() {
  const userId = await getUserId();
  return prisma.person.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function deletePerson(id: string) {
  const userId = await getUserId();
  const existing = await prisma.person.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Person not found");

  const txCount = await prisma.transaction.count({ where: { personId: id } });
  if (txCount > 0) {
    throw new Error(
      `Cannot delete: ${txCount} transaction(s) are linked to this person.`
    );
  }

  await prisma.person.delete({ where: { id } });
  revalidatePath("/categories");
  return { success: true };
}
