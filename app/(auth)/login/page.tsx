"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back! 👋");
      router.push("/");
      router.refresh();
    });
  };

  return (
    <div className="glass-card rounded-2xl p-8 space-y-8 shadow-2xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.22_280)] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">FinTrack</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-[oklch(0.65_0.05_280)]">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-email" className="text-[oklch(0.85_0.02_280)]">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="bg-[oklch(0.2_0.03_280)] border-[oklch(0.3_0.04_280)] text-white placeholder:text-[oklch(0.5_0.03_280)] focus:border-[oklch(0.55_0.22_280)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password" className="text-[oklch(0.85_0.02_280)]">Password</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="bg-[oklch(0.2_0.03_280)] border-[oklch(0.3_0.04_280)] text-white placeholder:text-[oklch(0.5_0.03_280)] focus:border-[oklch(0.55_0.22_280)] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.55_0.05_280)] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-[oklch(0.55_0.22_280)] hover:bg-[oklch(0.6_0.24_280)] text-white font-semibold py-5 rounded-xl transition-all duration-200 shadow-lg shadow-[oklch(0.55_0.22_280)]/25"
          id="login-submit-btn"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in...</>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-[oklch(0.6_0.04_280)]">
        New to FinTrack?{" "}
        <Link href="/register" className="text-[oklch(0.7_0.18_280)] hover:text-[oklch(0.8_0.2_280)] font-medium transition-colors">
          Create an account
        </Link>
      </p>
    </div>
  );
}
