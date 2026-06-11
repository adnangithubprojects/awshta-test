"use client";

import { memo } from "react";
import {
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Landmark,
  DollarSign,
} from "lucide-react";
import { DataTable } from "@/components/common/table";
import { ColumnDef } from "@tanstack/react-table";

const TransactionsEscrowPage = memo(function TransactionsEscrowPage() {
  const transactionsMock = [
    {
      id: "tx_101",
      reference: "TXN-7719231",
      order_ref: "ORD-99120",
      type: "credit_clearing",
      net_amount: "Rs. 24,000.00",
      commission: "Rs. 2,400.00",
      deposit_status: "escrow_locked",
    },
    {
      id: "tx_102",
      reference: "TXN-3312984",
      order_ref: "ORD-94511",
      type: "vendor_disbursement",
      net_amount: "Rs. 18,500.00",
      commission: "Rs. 1,850.00",
      deposit_status: "released",
    },
  ];

  const columns: ColumnDef<any, any>[] = [
    {
      header: "Transaction Tracking Block",
      accessorKey: "reference",
      cell: ({ row }) => (
        <div>
          <span className="font-mono text-xs font-black tracking-tight text-slate-800 block">
            {row.original.reference}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            Linked Context: {row.original.order_ref}
          </span>
        </div>
      ),
    },
    {
      header: "Operation Routing Type",
      accessorKey: "type",
      cell: ({ row }) => {
        const isCredit = row.original.type === "credit_clearing";
        return (
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold ${isCredit ? "text-emerald-600" : "text-blue-600"}`}
          >
            {isCredit ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownLeft size={12} />
            )}
            {isCredit ? "Inbound Consumer Pay" : "Outbound Vendor Push"}
          </span>
        );
      },
    },
    {
      header: "Gross Net Processing",
      accessorKey: "net_amount",
      cell: ({ row }) => (
        <span className="text-xs font-black text-slate-800 font-mono">
          {row.original.net_amount}
        </span>
      ),
    },
    {
      header: "Platform Cut (Take Rate)",
      accessorKey: "commission",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-primary font-mono bg-primary/[0.02] border border-primary/5 px-2 py-0.5 rounded-md">
          {row.original.commission}
        </span>
      ),
    },
    {
      header: "Secured Escrow State",
      accessorKey: "deposit_status",
      cell: ({ row }) => {
        const isLocked = row.original.deposit_status === "escrow_locked";
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black border rounded-md uppercase tracking-wider ${
              isLocked
                ? "bg-amber-50 border-amber-200 text-amber-600"
                : "bg-emerald-50 border-emerald-200 text-emerald-600"
            }`}
          >
            {isLocked && <ShieldCheck size={10} />}
            {isLocked ? "Escrow Vault Safe Hold" : "Disbursed / Cleared"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            Gross Vaulted Escrow Assets
          </span>
          <span className="text-xl font-black font-mono text-primary mt-1 block">
            Rs. 482,900.00
          </span>
        </div>
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            Estimated Platform Net Margins
          </span>
          <span className="text-xl font-black font-mono text-emerald-600 mt-1 block">
            Rs. 48,290.00
          </span>
        </div>
      </div>

      <DataTable data={transactionsMock} columns={columns} />
    </div>
  );
});

export default TransactionsEscrowPage;
