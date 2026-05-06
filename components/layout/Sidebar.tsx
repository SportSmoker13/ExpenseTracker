"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  TrendingUp,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/wealth", label: "Wealth", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  userEmail?: string;
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/login");
    router.refresh();
  };

  const initials = userEmail?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out",
          "bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--sidebar-border)]">
          <div className="w-9 h-9 rounded-xl bg-[oklch(0.55_0.22_280)] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-[var(--sidebar-foreground)]">FinTrack</span>
          )}
          <button
            id="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-[var(--sidebar-foreground)]/50 hover:text-[var(--sidebar-foreground)] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  active
                    ? "bg-[oklch(0.55_0.22_280)] text-white shadow-lg shadow-[oklch(0.55_0.22_280)]/30"
                    : "text-[var(--sidebar-foreground)]/70 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)]"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium text-sm">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-4 space-y-1 border-t border-[var(--sidebar-border)]">
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--sidebar-foreground)]/70 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)] transition-all duration-200"
          >
            {darkMode ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            {!collapsed && <span className="text-sm font-medium">{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-[oklch(0.55_0.22_280)] text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--sidebar-foreground)] font-medium truncate">{userEmail}</p>
              </div>
              <button
                id="signout-btn"
                onClick={handleSignOut}
                className="text-[var(--sidebar-foreground)]/40 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {collapsed && (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center px-3 py-2.5 rounded-xl text-[var(--sidebar-foreground)]/50 hover:text-red-400 hover:bg-[var(--sidebar-accent)] transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-[var(--sidebar)] border-t border-[var(--sidebar-border)] px-2 py-2 safe-area-inset-bottom">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                active
                  ? "text-[oklch(0.65_0.22_280)]"
                  : "text-[var(--sidebar-foreground)]/50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-[var(--sidebar-foreground)]/50 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Sign Out</span>
        </button>
      </nav>
    </>
  );
}
