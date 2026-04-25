import { getCategories } from "@/app/actions/categoryActions";
import { getSourceSummaries } from "@/app/actions/sourceActions";
import { getPeople } from "@/app/actions/personActions";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { SourceManager } from "@/components/sources/SourceManager";
import { PersonManager } from "@/components/people/PersonManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Management — FinTrack",
  description: "Manage categories, accounts, and people.",
};

export default async function CategoriesPage() {
  const [categories, sources, people] = await Promise.all([
    getCategories(),
    getSourceSummaries(),
    getPeople(),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2 px-1">
      {/* Categories Section */}
      <section className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-6 w-1 rounded-full bg-primary shadow-[0_0_10px_oklch(0.65_0.22_280)]" />
          <h2 className="text-xl font-black tracking-tight">Categories</h2>
        </div>
        <CategoryManager categories={categories} />
      </section>

      <div className="h-px w-full bg-border/40" />

      {/* Accounts Section */}
      <section className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-6 w-1 rounded-full bg-blue-500 shadow-[0_0_10px_oklch(0.6_0.18_240)]" />
          <h2 className="text-xl font-black tracking-tight">Accounts</h2>
        </div>
        <SourceManager sources={sources} />
      </section>

      <div className="h-px w-full bg-border/40" />

      {/* People Section */}
      <section className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-6 w-1 rounded-full bg-orange-500 shadow-[0_0_10px_oklch(0.65_0.22_40)]" />
          <h2 className="text-xl font-black tracking-tight">People</h2>
        </div>
        <PersonManager people={people} />
      </section>
    </div>
  );
}
