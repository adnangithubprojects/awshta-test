"use client";

import { memo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  ShoppingBag,
  Calendar,
  Eye,
  CreditCard,
  Receipt,
  User,
  Package,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/common/toast";
import Pagination from "@/components/common/paginations";
import { DataTable } from "@/components/common/table";
import Modal from "@/components/common/modal";

// --- Absolute Imports via Architecture Separation Schema ---
import { useGetAdminOrders, useGetSingleOrder } from "@/api/orders/queries";
import { TOrderRow } from "@/types/order";
import { TOrderStatus, TPaymentMethod } from "@/types";

// --- Static Local Numeric Normalizer Utility ---
const parseBackendTotal = (rawTotal: string): string => {
  if (!rawTotal) return "Rs. 0.00";
  // Strip out prefix database artifacts (+ sign and padding leading zeros)
  const normalizedString = rawTotal.replace(/^[+-]+0*/, "");
  const computedFloat = parseFloat(normalizedString);
  return isNaN(computedFloat)
    ? "Rs. 0.00"
    : `Rs. ${computedFloat.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const OrdersAdminPage = memo(function OrdersAdminPage() {
  const { toast } = useToast();

  // --- Filter and Routing Parameters Matrix States ---
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TOrderStatus | "all">("all");
  const [userIdFilter, setUserIdFilter] = useState("");

  // --- Modal Targeting Identifier state ---
  const [inspectId, setInspectId] = useState<string | null>(null);

  // Auto-reset current pagination index back to origin on active matrix filter mutations
  useEffect(() => {
    setPage(1);
  }, [activeTab, userIdFilter]);

  // --- Dynamic Structured Queries Hook Execution Pipeline ---
  const { data: serverResponse, isLoading: isLedgerLoading } =
    useGetAdminOrders({
      page,
      per_page: 10,
      status: activeTab,
      user_id: userIdFilter.trim() || undefined,
    });

  const { data: selectedOrderDetails, isLoading: isInspectingDoc } =
    useGetSingleOrder(inspectId);

  // Normalize list data safely from core endpoint payloads
  const orderList: TOrderRow[] = Array.isArray(serverResponse)
    ? serverResponse
    : serverResponse?.items ||
      serverResponse?.data?.items ||
      serverResponse?.data ||
      [];

  const singleOrder =
    selectedOrderDetails?.data || selectedOrderDetails || null;

  // --- React Table Column Definition Paradigm ---
  const columns: ColumnDef<TOrderRow, any>[] = [
    {
      header: "Order Identifiers",
      accessorKey: "order_number",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border border-slate-200 bg-primary/5 text-primary flex items-center justify-center shrink-0">
            <ShoppingBag size={15} />
          </div>
          <div>
            <span className="font-mono text-xs font-black text-slate-800 tracking-tight block">
              {row.original.order_number ||
                `ORD-${row.original.id.slice(0, 8).toUpperCase()}`}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[130px]">
              ID: {row.original.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Payment Metrics",
      accessorKey: "payment_method",
      cell: ({ row }) => {
        const readableMethods: Record<TPaymentMethod, string> = {
          cod: "Cash On Delivery (COD)",
          card: "Credit / Debit Card",
          bank_transfer: "Direct Bank Wire",
          easypaisa: "Easypaisa Mobile",
          jazzcash: "JazzCash Checkout",
        };
        return (
          <div>
            <span className="text-xs font-bold text-slate-700 block">
              {readableMethods[row.original.payment_method] ||
                row.original.payment_method}
            </span>
            <span
              className={`text-[9px] font-black uppercase tracking-wider block mt-0.5 ${
                row.original.payment_status === "paid"
                  ? "text-emerald-500"
                  : row.original.payment_status === "pending"
                    ? "text-amber-500"
                    : "text-rose-500"
              }`}
            >
              {row.original.payment_status}
            </span>
          </div>
        );
      },
    },
    {
      header: "Gross Financial Total",
      accessorKey: "total",
      cell: ({ row }) => (
        <span className="text-xs font-black text-primary font-mono bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
          {parseBackendTotal(row.original.total)}
        </span>
      ),
    },
    {
      header: "Fulfillment Timeline",
      accessorKey: "created_at",
      cell: ({ row }) => (
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
          <Calendar size={12} />
          {new Date(row.original.created_at).toLocaleDateString("en-PK", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      header: "Lifecycle Badge",
      accessorKey: "status",
      cell: ({ row }) => {
        const statuses: Record<TOrderStatus, string> = {
          pending: "bg-amber-50 text-amber-600 border-amber-200",
          confirmed: "bg-blue-50 text-blue-600 border-blue-200",
          processing: "bg-indigo-50 text-indigo-600 border-indigo-200",
          shipped: "bg-purple-50 text-purple-600 border-purple-200",
          delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
          cancelled: "bg-rose-50 text-rose-500 border-rose-200",
          refunded: "bg-slate-100 text-slate-600 border-slate-300",
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider ${statuses[row.original.status] || "bg-slate-50"}`}
          >
            {row.original.status}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setInspectId(row.original.id)}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:border-primary/40 bg-white hover:text-primary text-slate-500 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Eye size={13} />
            <span>Inspect Invoice</span>
          </button>
        </div>
      ),
    },
  ];

  // --- Tab Manifest Setup ---
  const tabSchema: { key: TOrderStatus | "all"; label: string }[] = [
    { key: "all", label: "All Logs" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
    { key: "refunded", label: "Refunded" },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Branding Header Elements */}
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Fulfillment Operations Ledger
        </h1>
        <p className="text-slate-400 text-sm">
          Monitor commercial transactions, trace consumer clearings, and
          optimize checkout pipelines.
        </p>
      </div>

      {/* Advanced Layout Input Filter Controllers */}
      <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex-1 min-w-[280px] flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-primary/30 transition-colors">
          <User size={14} className="text-slate-400" />
          <input
            type="text"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            placeholder="Search directly via customer account Account User GUID string parameter..."
            className="w-full bg-transparent outline-none text-xs font-semibold text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Multi-Tab Navigation Workspace Row Header */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto scroller-hidden">
        {tabSchema.map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "border-primary text-primary bg-primary/[0.01]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Core View Data Flow Render Check block */}
      {isLedgerLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <DataTable data={orderList} columns={columns} />

          {/* Dynamic Component Pagination Handler */}
          {serverResponse?.pages > 1 && (
            <Pagination
              meta={{
                totalItems: serverResponse.total,
                itemCount: orderList.length,
                currentPage: serverResponse.page,
                totalPages: serverResponse.pages,
                itemsPerPage: serverResponse.per_page,
                hasNextPage: serverResponse.page < serverResponse.pages,
                hasPreviousPage: serverResponse.page > 1,
              }}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* --- ASYNCHRONOUS OVERLAY PORTAL MODEL: INVOICE SINGLE TARGET INSPECTOR --- */}
      <Modal
        isOpen={!!inspectId}
        onClose={() => setInspectId(null)}
        title="System Order Invoice Docket"
        size="md"
      >
        {isInspectingDoc ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <RefreshCw size={24} className="animate-spin text-primary" />
            <p className="text-xs font-bold text-slate-400 animate-pulse">
              Pulling Secure Transaction Data Blocks...
            </p>
          </div>
        ) : singleOrder ? (
          <div className="space-y-5 pt-2">
            {/* Header Micro Card Segment */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-400 font-black block tracking-wider uppercase">
                  REFERENCE ORDER TRACK
                </span>
                <span className="text-sm font-mono font-black text-slate-800 tracking-tight">
                  {singleOrder.order_number ||
                    `ORD-${singleOrder.id.slice(0, 8).toUpperCase()}`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 font-black block tracking-wider uppercase">
                  FULFILLMENT INDEX
                </span>
                <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-black uppercase bg-primary text-white rounded">
                  {singleOrder.status}
                </span>
              </div>
            </div>

            {/* Financial Parameters Summary Grid Section List */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-white">
                <Receipt size={15} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block leading-none">
                    TOTAL INVOICED CHARGE
                  </span>
                  <span className="text-sm font-black text-slate-800 font-mono mt-1 block">
                    {parseBackendTotal(singleOrder.total)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-white">
                <CreditCard size={15} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block leading-none">
                    METHOD ACQUISITION ROUTE
                  </span>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wide mt-1 block">
                    {singleOrder.payment_method}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-white">
                <Package size={15} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block leading-none">
                    TRANSACTION CLEARING VERIFICATION
                  </span>
                  <span className="text-xs font-black uppercase tracking-wide mt-1 block text-slate-700">
                    {singleOrder.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Identifier Log Parameters Block */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-[11px] font-bold text-slate-500">
              <div>
                <span className="text-[9px] text-slate-400 block font-extrabold tracking-wider">
                  CREATION TIMESTAMP RECORD
                </span>
                <span className="text-slate-700 font-semibold">
                  {new Date(singleOrder.created_at).toLocaleString("en-PK", {
                    dateStyle: "long",
                    timeStyle: "medium",
                  })}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[9px] text-slate-400 block font-extrabold tracking-wider">
                  SYSTEM ACQUIRER TRANSACTION ID
                </span>
                <span className="font-mono block truncate text-primary select-all bg-white p-2 border border-slate-200/50 rounded-md mt-1 font-semibold">
                  {singleOrder.id}
                </span>
              </div>
            </div>

            {/* Operational Dismissal Action Buttons layout row footer */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setInspectId(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-500 rounded-xl transition-colors cursor-pointer"
              >
                Dismiss Ledger Docket
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs font-bold text-rose-500">
            Critical System Parse Error: Target order index document retrieval
            sequence failure.
          </div>
        )}
      </Modal>
    </div>
  );
});

export default OrdersAdminPage;
