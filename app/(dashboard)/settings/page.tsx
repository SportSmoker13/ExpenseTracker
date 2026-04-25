import { createClient } from "@/lib/supabase/server";
import SettingsContent from "@/components/settings/SettingsContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — FinTrack",
  description: "Manage your profile, app preferences, and security settings.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <SettingsContent userEmail={user?.email} />;
}
