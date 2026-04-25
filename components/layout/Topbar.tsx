"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewTransactionSheet } from "@/components/transactions/NewTransactionSheet";
import type { Category } from "@prisma/client";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/categories": "Categories",
};

interface TopbarProps {
  categories: Category[];
}

export function Topbar({ categories }: TopbarProps) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const title = pageTitles[pathname] ?? "FinTrack";

  return (
    <>
      <header className="h-16 px-6 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        </div>
        <Button
          id="new-transaction-btn"
          onClick={() => setSheetOpen(true)}
          className="bg-[oklch(0.55_0.22_280)] hover:bg-[oklch(0.6_0.24_280)] text-white shadow-lg shadow-[oklch(0.55_0.22_280)]/25 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Transaction
        </Button>
      </header>

      <NewTransactionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        categories={categories}
      />
    </>
  );
}
