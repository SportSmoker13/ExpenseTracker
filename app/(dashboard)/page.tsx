import { getDashboardMetrics } from "@/app/actions/transactionActions";
import { MetricCards, TotalWealthHero } from "@/components/dashboard/MetricCards";
import { ExpenseDonut } from "@/components/dashboard/ExpenseDonut";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { LoanSummaryCard } from "@/components/dashboard/LoanSummaryCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — FinTrack",
  description: "Your financial overview: income, expenses, and investments at a glance.",
};

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Metric Cards */}
      <MetricCards
        totalBalance={metrics.totalBalance}
        monthlyIncome={metrics.monthlyIncome}
        monthlyExpenses={metrics.monthlyExpenses}
        monthlyInvested={metrics.monthlyInvested}
        totalLent={metrics.totalLent}
        totalCardDue={metrics.totalCardDue}
        totalInvested={metrics.totalInvested}
        liquidCash={metrics.liquidCash}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Cash Flow */}
        <Card className="lg:col-span-3 border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Cash Flow</CardTitle>
            <CardDescription>Daily liquid cash balance vs expenses for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={metrics.cashFlow} />
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card className="lg:col-span-2 border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Expenses by Category</CardTitle>
            <CardDescription>Current month breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseDonut data={metrics.expensesByCategory} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
          <CardDescription>Your last 5 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentTransactions transactions={metrics.recentTransactions} />
        </CardContent>
      </Card>

      {/* Extreme Bottom: Loan Summary */}
      <LoanSummaryCard 
        totalLoanAmount={metrics.totalLoanAmount}
        totalLoanRepaid={metrics.totalLoanRepaid}
      />
    </div>
  );
}
