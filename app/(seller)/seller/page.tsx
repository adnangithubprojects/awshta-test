"use client";

import { memo, useState } from "react";
import {
  ShoppingCart,
  TrendingUp,
  Wallet,
  BadgeDollarSign,
  BarChart3,
  Calendar,
  X,
  ChevronDown,
  Percent,
  AlertCircle,
} from "lucide-react";

// ─── UTILITY HELPERS ──────────────────────────────────────────────────────────
const pkr = (n: number) => "PKR " + Math.round(n).toLocaleString("en-PK");

const pct = (value: number, total: number) =>
  total === 0 ? 0 : Math.round((value / total) * 100);

// STATIC DATA MOCK OBJECT REPRESENTING YOUR EXACT SCHEMA
const STATIC_SELLER_DATA = {
  period: "month",
  from_date: "2026-05-01",
  to_date: "2026-05-31",
  orders: {
    total: 148,
    pending: 12,
    confirmed: 24,
    processing: 18,
    shipped: 32,
    delivered: 54,
    cancelled: 6,
    refunded: 2,
  },
  revenue: {
    total_revenue: 450000,
    paid_revenue: 320000,
    pending_revenue: 115000,
    refunded_revenue: 15000,
    total_orders_value: 450000,
    avg_order_value: 3040,
  },
  users: {
    total_users: 0,
    total_buyers: 0,
    total_sellers: 0,
    blocked_users: 0,
    verified_users: 0,
  },
  sellers: {
    total_sellers: 0,
    active_sellers: 0,
    blocked_sellers: 0,
  },
  products: {
    total_products: 45,
    active_products: 38,
    out_of_stock: 7,
    featured_products: 5,
    flash_sale_products: 2,
  },
  revenue_chart: [
    { date: "2026-05-01", revenue: 15000, orders: 5 },
    { date: "2026-05-02", revenue: 22000, orders: 8 },
  ],
};

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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const StaticSellerDashboardPage = memo(
  function StaticSellerDashboardPage() {
    const [period, setPeriod] = useState("month");

    // Remapping static object parameters directly
    const { orders, revenue, products } = STATIC_SELLER_DATA;

    return (
      <div className="space-y-6">
        {/* HEADER SECTION PANEL */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Welcome back,
            </p>
            <h1 className="text-xl font-black text-primary tracking-tight mt-0.5">
              Merchant Control Center 👋
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Static Sandbox Environment
            </p>
          </div>

          {/* WORKSPACE PARAMETER FILTERS AND CONTROLS */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
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

            {period === "custom" && (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl w-full sm:w-auto">
                <Calendar size={14} className="text-slate-400 shrink-0" />
                <input
                  type="date"
                  defaultValue={STATIC_SELLER_DATA.from_date}
                  className="text-xs border-none bg-transparent focus:outline-none text-slate-700 font-bold"
                />
                <span className="text-slate-400 text-xs font-bold">to</span>
                <input
                  type="date"
                  defaultValue={STATIC_SELLER_DATA.to_date}
                  className="text-xs border-none bg-transparent focus:outline-none text-slate-700 font-bold"
                />
                <button
                  onClick={() => setPeriod("month")}
                  className="p-0.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BLOCK SECTION 1: STORE FINANCIAL OVERVIEW */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
            Shop Sales Earnings Vault
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Gross Sales Volume"
              value={pkr(revenue.total_revenue)}
              icon={TrendingUp}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              sub={`From ${orders.total} Orders Checkout`}
              subColor="text-emerald-600"
            />
            <StatCard
              label="Withdrawn Paid Earnings"
              value={pkr(revenue.paid_revenue)}
              icon={Wallet}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              sub={`${pct(revenue.paid_revenue, revenue.total_revenue)}% Clear payout`}
              subColor="text-blue-600"
            />
            <StatCard
              label="Pending Escrow Capital"
              value={pkr(revenue.pending_revenue)}
              icon={BadgeDollarSign}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              sub="Processing Deliveries"
              subColor="text-amber-500"
            />
            <StatCard
              label="Average Basket Size"
              value={pkr(revenue.avg_order_value)}
              icon={BarChart3}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
              sub="Value Earned Per Order"
              subColor="text-purple-400"
            />
          </div>
        </div>

        {/* BLOCK SECTION 2: SELLER ORDER PIPELINE */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
            Store Order Fulfillment Pipeline
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: "New / Pending",
                count: orders.pending,
                color: "text-amber-500",
              },
              {
                label: "Confirmed",
                count: orders.confirmed,
                color: "text-blue-500",
              },
              {
                label: "Processing",
                count: orders.processing,
                color: "text-indigo-500",
              },
              {
                label: "Dispatched",
                count: orders.shipped,
                color: "text-purple-500",
              },
              {
                label: "Delivered",
                count: orders.delivered,
                color: "text-emerald-500",
              },
              {
                label: "Cancelled / Refunded",
                count: orders.cancelled + orders.refunded,
                color: "text-rose-500",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                  {item.label}
                </span>
                <span className="text-xl font-black block mt-1 font-mono text-slate-800">
                  {item.count}
                </span>
                <span
                  className={`text-[10px] font-bold block mt-0.5 ${item.color}`}
                >
                  {pct(item.count, orders.total)}% Share
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* BLOCK SECTION 3: INVENTORY LOGISTICS AND OPERATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Shop Diagnostics instead of Admin User Lists */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Shop Operational Diagnostics
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Real-time summary of store performance metrics.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-emerald-500">
                    <ShoppingCart size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Gross Orders Processed
                    </p>
                    <p className="text-[9px] font-medium text-slate-400">
                      Total customer pipeline checkouts
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-black text-slate-800 bg-white px-2.5 py-1 border border-slate-200 rounded-lg">
                  {orders.total}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-rose-500">
                    <AlertCircle size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Returned Losses
                    </p>
                    <p className="text-[9px] font-medium text-slate-400">
                      Refunded customer capital claims
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-black text-rose-600 bg-white px-2.5 py-1 border border-slate-200 rounded-lg">
                  {pkr(revenue.refunded_revenue)}
                </span>
              </div>
            </div>
          </div>

          {/* Inventory Allocation Framework */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Store Catalog & Inventory Stock
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Live monitoring of warehousing and product statuses.
                </p>
              </div>
              <span className="text-[10px] font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10 uppercase tracking-wide">
                {products.total_products} Store SKUs Loaded
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                  Live Online
                </span>
                <span className="text-base font-black text-emerald-600 block mt-1 font-mono">
                  {products.active_products}
                </span>
                <p className="text-[9px] text-slate-400 font-bold mt-1">
                  Visible to buyers
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
                  Restock required
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
                  Promo showcases
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                  Flash Deals
                </span>
                <span className="text-base font-black text-amber-500 block mt-1 font-mono">
                  {products.flash_sale_products}
                </span>
                <p className="text-[9px] text-slate-400 font-bold mt-1">
                  Discount nodes
                </p>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Percent size={12} className="text-emerald-500" />
                Inventory Health Ratio:{" "}
                {pct(products.active_products, products.total_products)}% of
                products have active stock available for checkout.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default StaticSellerDashboardPage;
