"use client";

import { memo, useState } from "react";
import {
  Plus,
  Search,
  Award,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { DataTable } from "@/components/common/table";
import { ColumnDef } from "@tanstack/react-table";

export const BrandsPage = memo(function BrandsPage() {
  const [search, setSearch] = useState("");

  const brandsMock = [
    {
      id: "br_1",
      name: "Alkaram Studio",
      code: "alkaram",
      product_count: 342,
      is_active: true,
    },
    {
      id: "br_2",
      name: "Sana Safinaz",
      code: "sanasafinaz",
      product_count: 189,
      is_active: true,
    },
    {
      id: "br_3",
      name: "Junaid Jamshed (J.)",
      code: "jj_official",
      product_count: 512,
      is_active: false,
    },
  ];

  const columns: ColumnDef<any, any>[] = [
    {
      header: "Manufacturer / Entity Profile",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
            <Award size={15} className="text-primary" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-800 block leading-none">
              {row.original.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
              URI Slug: brand-{row.original.code}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Catalog Saturation Mapping",
      accessorKey: "product_count",
      cell: ({ row }) => (
        <span className="text-xs font-black text-slate-700 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg font-mono">
          {row.original.product_count} ACTIVE SKUS
        </span>
      ),
    },
    {
      header: "Verification Badge",
      accessorKey: "is_active",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md ${
            row.original.is_active
              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
              : "bg-slate-50 border-slate-200 text-slate-400"
          }`}
        >
          {row.original.is_active ? "Approved Asset" : "Hold Clearance"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: () => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Brand Registry Ledger
          </h1>
          <p className="text-slate-400 text-sm">
            Control international labels, update vendor indexing titles, track
            distribution counts.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 bg-primary text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
        >
          <Plus size={16} /> <span>Add New Brand Node</span>
        </button>
      </div>

      <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl max-w-md focus-within:border-primary/40 shadow-sm">
        <Search size={15} className="text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search registry indices by name..."
          className="w-full bg-transparent outline-none text-xs font-semibold text-slate-700"
        />
      </div>

      <DataTable data={brandsMock} columns={columns} />
    </div>
  );
});

export default BrandsPage;
