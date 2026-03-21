"use client";

import { useState } from "react";
import { ReceiptsTable } from "@/components/receipts-table";
import { formatCurrency } from "@/lib/formatters";

type ReceiptRecord = {
  id: string;
  provider: string;
  purpose: string;
  amountUsd: number;
  status: string;
  externalTxId?: string | null;
  reason: string;
  metadata?: unknown;
  createdAt: string;
  run?: {
    triggerSummary: string;
    strategyName: string;
  };
};

type StatusFilter = "ALL" | "COMPLETED" | "PENDING_APPROVAL" | "REJECTED" | "FAILED";
type DateFilter = "ALL_TIME" | "LAST_7_DAYS" | "LAST_30_DAYS";

function isWithinDateRange(createdAt: string, filter: DateFilter) {
  if (filter === "ALL_TIME") {
    return true;
  }

  const createdAtTime = new Date(createdAt).getTime();
  const now = Date.now();
  const days = filter === "LAST_7_DAYS" ? 7 : 30;
  const earliestTime = now - days * 24 * 60 * 60 * 1000;

  return createdAtTime >= earliestTime;
}

export function ReceiptsView({ receipts }: { receipts: ReceiptRecord[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL_TIME");

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesStatus = statusFilter === "ALL" ? true : receipt.status === statusFilter;
    const matchesDate = isWithinDateRange(receipt.createdAt, dateFilter);

    return matchesStatus && matchesDate;
  });

  const totalSpentUsd = filteredReceipts
    .filter((receipt) => receipt.status === "COMPLETED")
    .reduce((sum, receipt) => sum + receipt.amountUsd, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-[1.8rem] border border-white/8 bg-slate-950/85 p-4 shadow-[0_24px_80px_rgba(2,8,23,0.38)] md:grid-cols-[minmax(0,14rem)_minmax(0,14rem)_1fr]">
        <label className="space-y-2 text-sm">
          <span className="eyebrow">Status</span>
          <select
            aria-label="Receipt status filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="mono-ui flex h-11 w-full items-center rounded-[1.1rem] border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-[0.18em] text-slate-100 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            <option value="ALL">All statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING_APPROVAL">Pending approval</option>
            <option value="REJECTED">Rejected</option>
            <option value="FAILED">Failed</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="eyebrow">Date range</span>
          <select
            aria-label="Receipt date filter"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value as DateFilter)}
            className="mono-ui flex h-11 w-full items-center rounded-[1.1rem] border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-[0.18em] text-slate-100 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            <option value="ALL_TIME">All time</option>
            <option value="LAST_7_DAYS">Last 7 days</option>
            <option value="LAST_30_DAYS">Last 30 days</option>
          </select>
        </label>
        <div className="data-rail">
          <p className="eyebrow">Visible ledger</p>
          <p className="mt-3 text-sm text-slate-100">
            {filteredReceipts.length} shown • Total spent {formatCurrency(totalSpentUsd)}
          </p>
        </div>
      </div>

      <ReceiptsTable receipts={filteredReceipts} totalSpentUsd={totalSpentUsd} />
    </div>
  );
}
