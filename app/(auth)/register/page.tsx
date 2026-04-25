"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { seedDefaultCategories } from "@/app/actions/categoryActions";
import { toast } from "sonner";
import { Eye, EyeOff, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        await seedDefaultCategories(data.user.id);
        toast.success("Account created! Welcome to FinTrack 🎉");
        router.push("/");
        router.refresh();
      }
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
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="text-[oklch(0.65_0.05_280)]">Start tracking your finances today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="reg-email" className="text-[oklch(0.85_0.02_280)]">Email</Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="bg-[oklch(0.2_0.03_280)] border-[oklch(0.3_0.04_280)] text-white placeholder:text-[oklch(0.5_0.03_280)] focus:border-[oklch(0.55_0.22_280)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password" className="text-[oklch(0.85_0.02_280)]">Password</Label>
          <div className="relative">
            <Input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 6 characters"
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

        <div className="space-y-2">
          <Label htmlFor="reg-confirm" className="text-[oklch(0.85_0.02_280)]">Confirm Password</Label>
          <Input
            id="reg-confirm"
            type="password"
            placeholder="Repeat your password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required
            className="bg-[oklch(0.2_0.03_280)] border-[oklch(0.3_0.04_280)] text-white placeholder:text-[oklch(0.5_0.03_280)] focus:border-[oklch(0.55_0.22_280)]"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-[oklch(0.55_0.22_280)] hover:bg-[oklch(0.6_0.24_280)] text-white font-semibold py-5 rounded-xl transition-all duration-200 shadow-lg shadow-[oklch(0.55_0.22_280)]/25"
          id="register-submit-btn"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating account...</>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-[oklch(0.6_0.04_280)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[oklch(0.7_0.18_280)] hover:text-[oklch(0.8_0.2_280)] font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
