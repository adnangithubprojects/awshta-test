"use client";

import { memo } from "react";
import { Landmark, ArrowUpRight, HelpCircle, CheckCircle } from "lucide-react";
import { DataTable } from "@/components/common/table";
import { ColumnDef } from "@tanstack/react-table";

export const VendorPayoutsPage = memo(function VendorPayoutsPage() {
  const payoutsMock = [
    {
      id: "pay_90",
      vendor: "Zaroon Textils Ltd",
      gateway: "Meezan Bank Wire",
      account: "0234...9011",
      amount: "Rs. 145,000.00",
      status: "settled",
    },
    {
      id: "pay_91",
      vendor: "Khyber Craft Boutique",
      gateway: "NayaPay Corporate",
      account: "0300...1122",
      amount: "Rs. 32,400.00",
      status: "pending_clearance",
    },
  ];

  const columns: ColumnDef<any, any>[] = [
    {
      header: "Sub-Merchant Client Beneficiary",
      accessorKey: "vendor",
      cell: ({ row }) => (
        <div>
          <span className="font-bold text-xs text-slate-800 block">
            {row.original.vendor}
          </span>
          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
            ID Ref String: {row.original.id}
          </span>
        </div>
      ),
    },
    {
      header: "Target Settlement Route",
      accessorKey: "gateway",
      cell: ({ row }) => (
        <div>
          <span className="text-xs text-slate-700 font-bold flex items-center gap-1">
            <Landmark size={12} className="text-slate-400" />
            {row.original.gateway}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            Dest: {row.original.account}
          </span>
        </div>
      ),
    },
    {
      header: "Disbursement Valuation Scale",
      accessorKey: "amount",
      cell: ({ row }) => (
        <span className="text-sm font-black text-primary font-mono">
          {row.original.amount}
        </span>
      ),
    },
    {
      header: "Settlement Clearing State",
      accessorKey: "status",
      cell: ({ row }) => {
        const isSettled = row.original.status === "settled";
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black border rounded-md uppercase tracking-wider ${
              isSettled
                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                : "bg-amber-50 border-amber-200 text-amber-500"
            }`}
          >
            {isSettled ? "Disbursement Released" : "Awaiting Verification"}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          {row.original.status !== "settled" && (
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white font-bold text-[11px] rounded-xl shadow-sm transition-transform cursor-pointer"
            >
              <CheckCircle size={12} /> <span>Release Funds</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Merchant Settlement Disbursals
        </h1>
        <p className="text-slate-400 text-sm">
          Audit accrued merchant earnings clearings, manage account wires, and
          authorize outgoing payments.
        </p>
      </div>

      <DataTable data={payoutsMock} columns={columns} />
    </div>
  );
});

export default VendorPayoutsPage;
