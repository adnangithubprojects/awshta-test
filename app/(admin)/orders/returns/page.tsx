"use client";

import { memo } from "react";
import {
  RefreshCcw,
  ClipboardList,
  AlertCircle,
  ArrowLeftRight,
} from "lucide-react";
import { DataTable } from "@/components/common/table";
import { ColumnDef } from "@tanstack/react-table";

export const ReturnOrdersPage = memo(function ReturnOrdersPage() {
  const returnsMock = [
    {
      id: "ret_1",
      order_number: "ORD-99231",
      customer: "Mudassir Shah",
      reason: "Sizing variance discrepancy",
      status: "reviewing",
      cost: "Rs. 4,500.00",
    },
    {
      id: "ret_2",
      order_number: "ORD-88124",
      customer: "Asif Khan",
      reason: "Damaged freight unit on delivery",
      status: "authorized",
      cost: "Rs. 12,800.00",
    },
  ];

  const columns: ColumnDef<any, any>[] = [
    {
      header: "Return Context Identifier",
      accessorKey: "order_number",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shrink-0">
            <ArrowLeftRight size={14} />
          </div>
          <div>
            <span className="font-mono text-xs font-black text-slate-800 block tracking-tight">
              {row.original.order_number}
            </span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
              Requester: {row.original.customer}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Reverse Logistics Core Reason",
      accessorKey: "reason",
      cell: ({ row }) => (
        <div className="max-w-[240px]">
          <span className="text-xs text-slate-600 font-bold block truncate">
            {row.original.reason}
          </span>
        </div>
      ),
    },
    {
      header: "Claim Appraisal Cost",
      accessorKey: "cost",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-primary font-mono">
          {row.original.cost}
        </span>
      ),
    },
    {
      header: "Auditing Flow Level",
      accessorKey: "status",
      cell: ({ row }) => {
        const statuses: Record<string, string> = {
          reviewing: "bg-amber-50 text-amber-600 border-amber-200",
          authorized: "bg-blue-50 text-blue-600 border-blue-200",
        };
        return (
          <span
            className={`px-2 py-0.5 border text-[9px] font-black uppercase rounded-md tracking-wider ${statuses[row.original.status]}`}
          >
            {row.original.status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Reverse Logistics Management
        </h1>
        <p className="text-slate-400 text-sm">
          Review incoming claims tracking returns, run inspection criteria
          validation checklists, and issue balance adjustments.
        </p>
      </div>

      <DataTable data={returnsMock} columns={columns} />
    </div>
  );
});

export default ReturnOrdersPage;
