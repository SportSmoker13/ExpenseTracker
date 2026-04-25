"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Download, FileText, FileSpreadsheet, File } from "lucide-react";
import { toast } from "sonner";
import type { Transaction, Category } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type FullTransaction = Transaction & { category: Category };

interface ExportMenuProps {
  transactions: FullTransaction[];
}

function formatCurrency(amount: number) {
  return amount.toFixed(2);
}

export function ExportMenu({ transactions }: ExportMenuProps) {
  const [loading, setLoading] = useState<"csv" | "excel" | "pdf" | null>(null);

  const exportCSV = async () => {
    setLoading("csv");
    try {
      const Papa = (await import("papaparse")).default;
      const data = transactions.map((tx) => ({
        Date: format(new Date(tx.date), "yyyy-MM-dd"),
        Type: tx.type,
        Category: tx.category.name,
        Description: tx.description ?? "",
        Amount: formatCurrency(tx.amount),
      }));
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, `fintrack-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`);
      toast.success("CSV exported!");
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setLoading(null);
    }
  };

  const exportExcel = async () => {
    setLoading("excel");
    try {
      const XLSX = await import("xlsx");
      const data = transactions.map((tx) => ({
        Date: format(new Date(tx.date), "yyyy-MM-dd"),
        Type: tx.type,
        Category: tx.category.name,
        Description: tx.description ?? "",
        Amount: tx.amount,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws["!cols"] = [{ wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 30 }, { wch: 12 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `fintrack-transactions-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      toast.success("Excel exported!");
    } catch {
      toast.error("Failed to export Excel");
    } finally {
      setLoading(null);
    }
  };

  const exportPDF = async () => {
    setLoading("pdf");
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(99, 102, 241);
      doc.text("FinTrack", 14, 20);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text("Transaction Report", 14, 28);
      doc.text(`Generated: ${format(new Date(), "MMM d, yyyy")}`, 14, 35);
      doc.text(`Total records: ${transactions.length}`, 14, 42);

      // Totals
      const income = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
      const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
      const invested = transactions.filter((t) => t.type === "INVESTMENT").reduce((s, t) => s + t.amount, 0);
      doc.setFontSize(10);
      doc.setTextColor(34, 197, 94);
      doc.text(`Total Income: ₹${income.toFixed(2)}`, 120, 28);
      doc.setTextColor(239, 68, 68);
      doc.text(`Total Expenses: ₹${expense.toFixed(2)}`, 120, 35);
      doc.setTextColor(168, 85, 247);
      doc.text(`Total Invested: ₹${invested.toFixed(2)}`, 120, 42);

      // Table
      autoTable(doc, {
        startY: 52,
        head: [["Date", "Type", "Category", "Description", "Amount (₹)"]],
        body: transactions.map((tx) => [
          format(new Date(tx.date), "MMM d, yyyy"),
          tx.type,
          tx.category.name,
          tx.description ?? "—",
          `${tx.type === "EXPENSE" ? "-" : "+"}${formatCurrency(tx.amount)}`,
        ]),
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold", fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 245, 250] },
        columnStyles: { 4: { halign: "right" } },
        styles: { overflow: "linebreak" },
      });

      doc.save(`fintrack-transactions-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF exported!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF");
    } finally {
      setLoading(null);
    }
  };

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id="export-menu-btn"
        className="h-9 flex items-center gap-2 px-3 rounded-lg border border-input bg-transparent text-xs hover:bg-muted transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Export as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem id="export-csv-btn" onClick={exportCSV} disabled={loading === "csv"} className="gap-2 text-sm cursor-pointer">
          <FileText className="w-4 h-4 text-green-500" />
          {loading === "csv" ? "Exporting…" : "CSV (.csv)"}
        </DropdownMenuItem>
        <DropdownMenuItem id="export-excel-btn" onClick={exportExcel} disabled={loading === "excel"} className="gap-2 text-sm cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 text-blue-500" />
          {loading === "excel" ? "Exporting…" : "Excel (.xlsx)"}
        </DropdownMenuItem>
        <DropdownMenuItem id="export-pdf-btn" onClick={exportPDF} disabled={loading === "pdf"} className="gap-2 text-sm cursor-pointer">
          <File className="w-4 h-4 text-red-500" />
          {loading === "pdf" ? "Exporting…" : "PDF (.pdf)"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
