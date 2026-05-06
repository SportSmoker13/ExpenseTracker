"use client";

import { useState, useTransition } from "react";
import { User, Shield, Palette, Trash2, LogOut, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { SourceCreator } from "@/components/sources/SourceCreator";
import { PersonCreator } from "@/components/people/PersonCreator";
import { InvestmentCreator } from "@/components/investments/InvestmentCreator";
import { LoanCreator } from "@/components/loans/LoanCreator";
import { SourceManager } from "@/components/sources/SourceManager";
import { PersonManager } from "@/components/people/PersonManager";
import { InvestmentManager } from "@/components/investments/InvestmentManager";
import { LoanManager } from "@/components/loans/LoanManager";
import type { Category, Source, Person, Investment, Loan } from "@/lib/types";

export default function SettingsPage({ 
  userEmail, 
  categories,
  sources,
  people,
  investments,
  loans
}: { 
  userEmail: string | undefined, 
  categories: Category[],
  sources: Source[],
  people: Person[],
  investments: Investment[],
  loans: Loan[]
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = async () => {
    startTransition(async () => {
      await supabase.auth.signOut();
      localStorage.removeItem("fintrack-session");
      router.push("/login");
      toast.success("Signed out successfully");
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Profile Section */}
      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[oklch(0.55_0.22_280)] to-[oklch(0.45_0.2_300)] opacity-90" />
        <CardHeader className="relative -mt-12 space-y-4">
          <div className="w-24 h-24 rounded-2xl bg-card border-4 border-background flex items-center justify-center text-3xl shadow-xl">
            👤
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">Profile Settings</CardTitle>
            <CardDescription>Manage your account identity and security</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" /> Email Address
              </Label>
              <div className="flex gap-2">
                <Input id="email" value={userEmail} disabled className="bg-muted/50" />
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-3">
                  Verified
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Management Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="h-4 w-1 rounded-full bg-primary shadow-[0_0_10px_oklch(0.65_0.22_280)]" />
          <h2 className="text-sm font-black tracking-tight uppercase opacity-80">Financial Labels</h2>
        </div>
        <CategoryManager categories={categories} />
      </section>

      {/* Wealth Setup Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <div className="h-4 w-1 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          <h2 className="text-sm font-black tracking-tight uppercase opacity-80">Wealth Setup</h2>
        </div>
        
        {/* Accounts */}
        <div className="space-y-4">
           <SourceCreator />
           <SourceManager sources={sources} />
        </div>

        <div className="h-px bg-border/40 w-full" />

        {/* People */}
        <div className="space-y-4">
           <PersonCreator />
           <PersonManager people={people as any} categories={categories} sources={sources} investments={investments as any} />
        </div>

        <div className="h-px bg-border/40 w-full" />

        {/* Investments */}
        <div className="space-y-4">
           <InvestmentCreator />
           <InvestmentManager investments={investments as any} sources={sources} categories={categories} />
        </div>

        <div className="h-px bg-border/40 w-full" />

        {/* Loans */}
        <div className="space-y-4">
           <LoanCreator sources={sources} />
           <LoanManager loans={loans as any} sources={sources} categories={categories} investments={investments as any} />
        </div>
      </section>

      {/* Preferences Section */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[oklch(0.55_0.22_280)]" />
            <CardTitle className="text-lg font-semibold">App Preferences</CardTitle>
          </div>
          <CardDescription>Customize your dashboard experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Currency Display</p>
              <p className="text-xs text-muted-foreground">The currency used for all reports and charts</p>
            </div>
            <Badge variant="secondary" className="px-3 py-1">INR (₹)</Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Session Persistence</p>
              <p className="text-xs text-muted-foreground">Keep me signed in for 30 days</p>
            </div>
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <Shield className="w-5 h-5" />
            <CardTitle className="text-lg font-semibold">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-destructive/70">Actions here are permanent and cannot be reversed</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button 
            variant="outline" 
            className="border-destructive/20 hover:bg-destructive/10 text-destructive gap-2"
            onClick={handleSignOut}
            disabled={isPending}
            id="sign-out-btn"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Sign Out
          </Button>

          <Dialog>
            <DialogTrigger 
              id="delete-account-trigger"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Data
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Wipe All Data?</DialogTitle>
                <DialogDescription>
                  This will permanently delete all your transactions and custom categories. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" id="cancel-delete-btn">Cancel</Button>
                <Button variant="destructive" id="confirm-delete-data-btn">Permanently Wipe Data</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
