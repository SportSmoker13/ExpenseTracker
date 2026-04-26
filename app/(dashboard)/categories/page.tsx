import { getCategories } from "@/app/actions/categoryActions";
import { getSourceSummaries } from "@/app/actions/sourceActions";
import { getPeople } from "@/app/actions/personActions";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { SourceManager } from "@/components/sources/SourceManager";
import { PersonManager } from "@/components/people/PersonManager";
import { LoanManager } from "@/components/loans/LoanManager";
import { InvestmentManager } from "@/components/investments/InvestmentManager";
import { getLoans } from "@/app/actions/loanActions";
import { getInvestments } from "@/app/actions/investmentActions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Management — FinTrack",
  description: "Manage categories, accounts, and people.",
};

export default async function CategoriesPage() {
  const [categories, sources, people, loans, investments] = await Promise.all([
    getCategories(),
    getSourceSummaries(),
    getPeople(),
    getLoans(),
    getInvestments(),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-2 py-1">
      {/* Categories Section */}
      <section className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500 px-1">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="h-4 w-1 rounded-full bg-primary shadow-[0_0_10px_oklch(0.65_0.22_280)]" />
          <h2 className="text-sm font-black tracking-tight uppercase opacity-80">Categories</h2>
        </div>
        <CategoryManager categories={categories} />
      </section>

      <div className="h-px w-full bg-border/20" />

      {/* Accounts Section */}
      <section className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700 px-1">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="h-4 w-1 rounded-full bg-blue-500 shadow-[0_0_10px_oklch(0.6_0.18_240)]" />
          <h2 className="text-sm font-black tracking-tight uppercase opacity-80">Accounts</h2>
        </div>
        <SourceManager sources={sources} />
      </section>

      <div className="h-px w-full bg-border/20" />

      {/* People Section */}
      <section className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-1000 px-1">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="h-4 w-1 rounded-full bg-orange-500 shadow-[0_0_10px_oklch(0.65_0.22_40)]" />
          <h2 className="text-sm font-black tracking-tight uppercase opacity-80">People</h2>
        </div>
        <PersonManager people={people} categories={categories} sources={sources} investments={investments as any} />
      </section>

      <div className="h-px w-full bg-border/20" />

      {/* Investments Section */}
      <section className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-1000 px-1">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="h-4 w-1 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
          <h2 className="text-sm font-black tracking-tight uppercase opacity-80">Investments</h2>
        </div>
        <InvestmentManager investments={investments as any} sources={sources} categories={categories} />
      </section>

      <div className="h-px w-full bg-border/20" />

      {/* Loans Section */}
      <section className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-1000 px-1">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="h-4 w-1 rounded-full bg-indigo-500 shadow-[0_0_10px_oklch(0.5_0.2_280)]" />
          <h2 className="text-sm font-black tracking-tight uppercase opacity-80">Loans & EMIs</h2>
        </div>
        <LoanManager loans={loans as any} sources={sources} categories={categories} investments={investments as any} />
      </section>
    </div>
  );
}
