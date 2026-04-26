import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCategories } from "@/app/actions/categoryActions";
import { getSources } from "@/app/actions/sourceActions";
import { getPeople } from "@/app/actions/personActions";
import { getLoans } from "@/app/actions/loanActions";
import { getInvestments } from "@/app/actions/investmentActions";
import { BottomNav } from "@/components/layout/BottomNav";
import { Topbar } from "@/components/layout/Topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [categories, sources, people, loans, investments] = await Promise.all([
    getCategories(),
    getSources(),
    getPeople(),
    getLoans(),
    getInvestments(),
  ]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar categories={categories} sources={sources} people={people} loans={loans as any} investments={investments as any} />
        <main className="flex-1 overflow-y-auto p-3 pb-24">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
