"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewTransactionSheet } from "@/components/transactions/NewTransactionSheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Category, Source, Person, Loan, Investment } from "@/lib/types";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/wealth": "Wealth Management",
  "/settings": "Settings",
};

interface TopbarProps {
  categories: Category[];
  sources: Source[];
  people: Person[];
  loans: Loan[];
  investments: Investment[];
}

export function Topbar({ categories, sources, people, loans, investments }: TopbarProps) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const title = pageTitles[pathname] ?? "FinTrack";

  return (
    <>
      <header className="h-14 px-4 flex items-center justify-between border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            id="new-transaction-btn"
            size="sm"
            onClick={() => setSheetOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-full px-4 h-8 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add
          </Button>
        </div>
      </header>

      <NewTransactionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        categories={categories}
        sources={sources}
        people={people}
        loans={loans}
        investments={investments}
      />
    </>
  );
}
