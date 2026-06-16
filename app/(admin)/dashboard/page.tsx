export const dynamic = "force-dynamic";

import { memo, useState, useEffect } from "react";
import {
  ShoppingCart,
  TrendingUp,
  Wallet,
  BadgeDollarSign,
  AlertCircle,
  BarChart3,
  Users,
  RefreshCw,
  Calendar,
  X,
  Package,
  Store,
  ChevronDown,
  Percent,
} from "lucide-react";
import { useGetMyProfile } from "@/api/user/queries";
import { useGetDashboardSummary } from "@/api/orders/queries";

// ─── UTILITY HELPERS ──────────────────────────────────────────────────────────
const pkr = (n: number) => "PKR " + Math.round(n).toLocaleString("en-PK");

const pct = (value: number, total: number) =>
  total === 0 ? 0 : Math.round((value / total) * 100);

// FILTER ENUM DEFINITION OPTIONS
const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Range" },
];

// ─── STAT CARD COMPONENT ──────────────────────────────────────────────────────
type TStatCard = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  sub?: string;
  subColor?: string;
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  sub,
  subColor,
}: TStatCard) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm hover:border-slate-300 transition-all">
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg} border border-black/5`}
    >
      <Icon size={18} className={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p className="text-xl font-black text-slate-800 truncate tracking-tight">
        {value}
      </p>
      {sub && (
        <p
          className={`text-[11px] font-bold mt-1 ${subColor ?? "text-slate-400"}`}
        >
          {sub}
        </p>
      )}
    </div>
  </div>
);

// ─── DATA TABLE LOADING SKELETON ─────────────────────────────────────────────
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-16 bg-slate-100 rounded-2xl w-full" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 h-80 bg-slate-100 rounded-2xl" />
      <div className="h-80 bg-slate-100 rounded-2xl" />
    </div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const DashboardOverviewPage = memo(function DashboardOverviewPage() {
  const { data: user } = useGetMyProfile();

  // Filtering Stream Matrices States
  const [period, setPeriod] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentDateString, setCurrentDateString] = useState("");

  useEffect(() => {
    setCurrentDateString(
      new Date().toLocaleDateString("en-PK", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  // Sync state mutation triggers to fetch parameters downstream
  const { data, isLoading, isError, refetch, isFetching } =
    useGetDashboardSummary(
      period === "custom" && (startDate || endDate)
        ? { startDate, endDate }
        : undefined,
    );

  // Core Data Remapping Layers mapping backend metrics directly
  const orders = data?.orders ?? {
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
  };
  const revenue = data?.revenue ?? {
    total_revenue: 0,
    paid_revenue: 0,
    pending_revenue: 0,
    refunded_revenue: 0,
    total_orders_value: 0,
    avg_order_value: 0,
  };
  const platformUsers = data?.users ?? {
    total_users: 0,
    total_buyers: 0,
    total_sellers: 0,
    blocked_users: 0,
    verified_users: 0,
  };
  const sellers = data?.sellers ?? {
    total_sellers: 0,
    active_sellers: 0,
    blocked_sellers: 0,
  };
  const products = data?.products ?? {
    total_products: 0,
    active_products: 0,
    out_of_stock: 0,
    featured_products: 0,
    flash_sale_products: 0,
  };
  const chartData = data?.revenue_chart ?? [];

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : "Good evening";

  const clearCustomFilters = () => {
    setStartDate("");
    setEndDate("");
    setPeriod("month");
  };

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <AlertCircle size={36} className="text-rose-500" />
        <p className="font-black text-sm text-slate-700">
          Failed to sync overview summaries
        </p>
        <button
          onClick={() => refetch()}
          className="text-xs font-bold text-primary border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
        >
          Re-establish Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION PANEL */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            {greeting},
          </p>
          <h1 className="text-xl font-black text-primary tracking-tight mt-0.5">
            {user?.name?.split(" ")[0] ?? "Admin Console"} 👋
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {currentDateString}
          </p>
        </div>

        {/* WORKSPACE PARAMETER FILTERS AND CONTROLS */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Custom Select Dropdown Framework mapping Filter Enums */}
          <div className="relative inline-block text-left w-full sm:w-auto">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full sm:w-44 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl outline-none appearance-none cursor-pointer focus:border-primary/40 pr-8"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-3 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Conditional Custom Range Input Render Frame */}
          {period === "custom" && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl w-full sm:w-auto">
              <Calendar size={14} className="text-slate-400 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs border-none bg-transparent focus:outline-none text-slate-700 font-bold"
              />
              <span className="text-slate-400 text-xs font-bold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs border-none bg-transparent focus:outline-none text-slate-700 font-bold"
              />
              <button
                onClick={clearCustomFilters}
                className="p-0.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-primary border border-slate-200 px-4 py-2.5 bg-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60 ml-auto sm:ml-0"
          >
            <RefreshCw
              size={13}
              className={isFetching ? "animate-spin text-primary" : ""}
            />
            <span>Sync Ledger</span>
          </button>
        </div>
      </div>

      {/* BLOCK SECTION 1: GLOBAL PLATFORM REVENUE AND FINANCIAL TRACE MATRIX */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
          Gross Revenue Vault Metrics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Value Processed"
            value={pkr(revenue.total_revenue)}
            icon={TrendingUp}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            sub={`Volume: ${orders.total} Orders`}
            subColor="text-emerald-600"
          />
          <StatCard
            label="Paid Settled Capital"
            value={pkr(revenue.paid_revenue)}
            icon={Wallet}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            sub={`${pct(revenue.paid_revenue, revenue.total_revenue)}% Clear-out Rate`}
            subColor="text-blue-600"
          />
          <StatCard
            label="Escrow Pending Vault"
            value={pkr(revenue.pending_revenue)}
            icon={BadgeDollarSign}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            sub="Awaiting Fulfillment Delivery"
            subColor="text-amber-500"
          />
          <StatCard
            label="Average Basket Order Size"
            value={pkr(revenue.avg_order_value)}
            icon={BarChart3}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            sub="Gross Value Per Checkout"
            subColor="text-purple-400"
          />
        </div>
      </div>

      {/* BLOCK SECTION 2: OPERATIONAL LOGISTICS WORKSPACE METRICS */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
          Order Pipeline Fulfillment Track
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              label: "Pending",
              count: orders.pending,
              color: "text-amber-500",
              bg: "bg-amber-50/50",
            },
            {
              label: "Confirmed",
              count: orders.confirmed,
              color: "text-blue-500",
              bg: "bg-blue-50/50",
            },
            {
              label: "Processing",
              count: orders.processing,
              color: "text-indigo-500",
              bg: "bg-indigo-50/50",
            },
            {
              label: "Shipped Out",
              count: orders.shipped,
              color: "text-purple-500",
              bg: "bg-purple-50/50",
            },
            {
              label: "Delivered",
              count: orders.delivered,
              color: "text-emerald-500",
              bg: "bg-emerald-50/50",
            },
            {
              label: "Cancelled / Losses",
              count: orders.cancelled + orders.refunded,
              color: "text-rose-500",
              bg: "bg-rose-50/50",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`bg-white border border-slate-200 p-3.5 rounded-xl text-center shadow-sm`}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                {item.label}
              </span>
              <span
                className={`text-lg font-black block mt-1 font-mono ${item.color}`}
              >
                {item.count}
              </span>
              <span className="text-[9px] font-semibold text-slate-400 block mt-0.5">
                {pct(item.count, orders.total)}% Total Share
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BLOCK SECTION 3: SYSTEM INTEGRATION DRILLDOWNS (USERS & ASSETS LEDGER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Account Users Registries Analytics Block */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              User Matrix Registry
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Platform verified identity distribution mappings.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                icon: Users,
                label: "Total Platform Users",
                value: platformUsers.total_users,
                desc: `${platformUsers.verified_users} Checked Credentials`,
              },
              {
                icon: Store,
                label: "Active Sub-Merchants / Sellers",
                value: sellers.active_sellers,
                desc: `${sellers.blocked_sellers} Accounts Blocked`,
              },
              {
                icon: ShoppingCart,
                label: "Consumer Buyers Pool",
                value: platformUsers.total_buyers,
                desc: "Active purchasing targets",
              },
            ].map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                    <row.icon size={13} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">
                      {row.label}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                      {row.desc}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-black text-primary bg-white px-2.5 py-1 border border-slate-200 rounded-lg shrink-0">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Catalog Asset Distribution Inventory Allocation Frame */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Live Inventory Logistics
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Stock management controls metrics overview.
              </p>
            </div>
            <span className="text-[10px] font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10 uppercase tracking-wide">
              {products.total_products} Global SKUs Loaded
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                Active Online
              </span>
              <span className="text-base font-black text-emerald-600 block mt-1 font-mono">
                {products.active_products}
              </span>
              <p className="text-[9px] text-slate-400 font-bold mt-1">
                Available for checkout
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                Out of Stock
              </span>
              <span
                className={`text-base font-black block mt-1 font-mono ${products.out_of_stock > 0 ? "text-rose-500" : "text-slate-400"}`}
              >
                {products.out_of_stock}
              </span>
              <p className="text-[9px] text-slate-400 font-bold mt-1">
                Requires replenishment
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                Featured Tier
              </span>
              <span className="text-base font-black text-indigo-500 block mt-1 font-mono">
                {products.featured_products}
              </span>
              <p className="text-[9px] text-slate-400 font-bold mt-1">
                Landing impressions
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                Flash Sale Nodes
              </span>
              <span className="text-base font-black text-amber-500 block mt-1 font-mono">
                {products.flash_sale_products}
              </span>
              <p className="text-[9px] text-slate-400 font-bold mt-1">
                Active time campaigns
              </p>
            </div>
          </div>

          {/* Micro Trend Line Graphic Asset Placeholder */}
          <div className="pt-3 mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Percent size={12} className="text-emerald-500" />
              Platform Catalog Health Metric Ratio:{" "}
              {pct(products.active_products, products.total_products)}%
              operational capability threshold.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DashboardOverviewPage;
