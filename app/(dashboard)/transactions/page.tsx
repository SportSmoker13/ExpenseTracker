import { getTransactions } from "@/app/actions/transactionActions";
import { getCategories } from "@/app/actions/categoryActions";
import { getSources } from "@/app/actions/sourceActions";
import { getPeople } from "@/app/actions/personActions";
import { getLoans } from "@/app/actions/loanActions";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions — FinTrack",
  description: "View, filter, and export all your financial transactions.",
};

export default async function TransactionsPage() {
  const [{ transactions }, categories, sources, people, loans] = await Promise.all([
    getTransactions({ pageSize: 500 }),
    getCategories(),
    getSources(),
    getPeople(),
    getLoans(),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-2">
      <div className="px-1">
        <h2 className="text-xl font-black tracking-tight">History</h2>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Manage your cash flow</p>
      </div>
      <TransactionTable 
        transactions={transactions} 
        categories={categories}
        sources={sources}
        people={people}
        loans={loans as any}
      />
    </div>
  );
}
