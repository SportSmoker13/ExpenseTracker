import { getTransactions } from "@/app/actions/transactionActions";
import { getCategories } from "@/app/actions/categoryActions";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions — FinTrack",
  description: "View, filter, and export all your financial transactions.",
};

export default async function TransactionsPage() {
  const [{ transactions }, categories] = await Promise.all([
    getTransactions({ pageSize: 500 }),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">All Transactions</CardTitle>
          <CardDescription>Filter, search, and export your transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={transactions} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
