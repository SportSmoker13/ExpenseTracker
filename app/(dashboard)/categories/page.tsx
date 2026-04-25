import { getCategories } from "@/app/actions/categoryActions";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories — FinTrack",
  description: "Create and manage your custom income, expense, and investment categories.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Category Management</CardTitle>
          <CardDescription>
            Organize your transactions by creating custom categories with icons and colors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryManager categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
