import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCategories } from "@/app/actions/categoryActions";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const categories = await getCategories();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar userEmail={user.email} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar categories={categories} />
        <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
