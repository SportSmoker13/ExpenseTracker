import { getCategories } from "@/app/actions/categoryActions";
import { getSourceSummaries } from "@/app/actions/sourceActions";
import { getPeople } from "@/app/actions/personActions";
import { SourceManager } from "@/components/sources/SourceManager";
import { PersonManager } from "@/components/people/PersonManager";
import { LoanManager } from "@/components/loans/LoanManager";
import { InvestmentManager } from "@/components/investments/InvestmentManager";
import { getLoans } from "@/app/actions/loanActions";
import { getInvestments } from "@/app/actions/investmentActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, TrendingUp, Landmark } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wealth Management — FinTrack",
  description: "Manage your accounts, people, investments, and loans.",
};

export default async function WealthPage() {
  const [categories, sources, people, loans, investments] = await Promise.all([
    getCategories(),
    getSourceSummaries(),
    getPeople(),
    getLoans(),
    getInvestments(),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2 px-1">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-black tracking-tight">Wealth Management</h1>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-40">Manage your assets and liabilities</p>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6 w-full">
        <TabsList className="bg-muted/10 p-1 rounded-xl h-auto flex overflow-x-auto no-scrollbar items-center justify-center sm:justify-center gap-1.5 border border-border/20 w-full min-w-0">
          <TabsTrigger value="accounts" className="rounded-lg px-4 py-2 text-[10px] font-black data-[state=active]:bg-card data-[state=active]:shadow-md transition-all flex-shrink-0">
            <Building2 className="w-3 h-3 mr-1.5" /> ACCOUNTS
          </TabsTrigger>
          <TabsTrigger value="people" className="rounded-lg px-4 py-2 text-[10px] font-black data-[state=active]:bg-card data-[state=active]:shadow-md transition-all flex-shrink-0">
            <Users className="w-3 h-3 mr-1.5" /> PEOPLE
          </TabsTrigger>
          <TabsTrigger value="investments" className="rounded-lg px-4 py-2 text-[10px] font-black data-[state=active]:bg-card data-[state=active]:shadow-md transition-all flex-shrink-0">
            <TrendingUp className="w-3 h-3 mr-1.5" /> INVESTMENTS
          </TabsTrigger>
          <TabsTrigger value="loans" className="rounded-lg px-4 py-2 text-[10px] font-black data-[state=active]:bg-card data-[state=active]:shadow-md transition-all flex-shrink-0">
            <Landmark className="w-3 h-3 mr-1.5" /> LOANS & EMI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <SourceManager sources={sources} />
        </TabsContent>

        <TabsContent value="people" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <PersonManager people={people} categories={categories} sources={sources} investments={investments as any} />
        </TabsContent>

        <TabsContent value="investments" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <InvestmentManager investments={investments as any} sources={sources} categories={categories} />
        </TabsContent>

        <TabsContent value="loans" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <LoanManager loans={loans as any} sources={sources} categories={categories} investments={investments as any} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
