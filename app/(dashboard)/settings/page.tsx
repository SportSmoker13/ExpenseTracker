import { createClient } from "@/lib/supabase/server";
import SettingsContent from "@/components/settings/SettingsContent";
import { getCategories } from "@/app/actions/categoryActions";
import { getSourceSummaries } from "@/app/actions/sourceActions";
import { getPeople } from "@/app/actions/personActions";
import { getInvestments } from "@/app/actions/investmentActions";
import { getLoans } from "@/app/actions/loanActions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — FinTrack",
  description: "Manage your profile, app preferences, and security settings.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const [categories, sources, people, investments, loans] = await Promise.all([
    getCategories(),
    getSourceSummaries(),
    getPeople(),
    getInvestments(),
    getLoans(),
  ]);

  return (
    <SettingsContent 
      userEmail={user?.email} 
      categories={categories} 
      sources={sources}
      people={people}
      investments={investments as any}
      loans={loans as any}
    />
  );
}
