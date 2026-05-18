"use client";

import { memo, useState, useEffect } from "react";
import {
  ShoppingCart,
  TrendingUp,
  Wallet,
  BadgeDollarSign,
  AlertCircle,
  PiggyBank,
  BarChart3,
  Users,
  RefreshCw,
  Calendar,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthstore";
// import { useGetDashboardSummary } from "@/api/orders/queries";

// ─── helpers ─────────────────────────────────────────────────────────────────

const pkr = (n: number) => "PKR " + Math.round(n).toLocaleString("en-PK");

const pct = (value: number, total: number) =>
  total === 0 ? 0 : Math.round((value / total) * 100);

// ─── Stat card ────────────────────────────────────────────────────────────────

type TStatCard = {
  label: string;
  value: string;
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
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4">
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
    >
      <Icon size={20} className={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-xl font-black text-secondary truncate">{value}</p>
      {sub && (
        <p
          className={`text-[11px] font-semibold mt-0.5 ${subColor ?? "text-slate-400"}`}
        >
          {sub}
        </p>
      )}
    </div>
  </div>
);

// ─── Empty state ─────────────────────────────────────────────────────────────

const EmptyList = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-10 text-slate-300">
    <Users size={28} className="mb-2" />
    <p className="text-xs font-semibold">No {label} yet</p>
  </div>
);

// ─── Skeleton ────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 h-72 bg-slate-100 rounded-2xl" />
      <div className="h-72 bg-slate-100 rounded-2xl" />
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const DashboardOverviewPage = memo(function DashboardOverviewPage() {
  const { user } = useAuthStore();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentDateString, setCurrentDateString] = useState("");

  // Fixed structural Hydration Mismatch for greeting dates on Next.js Server vs Client render
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

  const { data, isLoading, isError, refetch, isFetching } =
    useGetDashboardSummary(
      startDate || endDate ? { startDate, endDate } : undefined,
    );

  const s = data?.summary;
  const topDebtors = data?.topDebtors ?? [];
  const topCreditors = data?.topCreditors ?? [];
  const sales = data?.sales ?? [];

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : "Good evening";

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const hasFilters = startDate || endDate;

  if (isLoading) return <Skeleton />;

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
        <AlertCircle size={32} />
        <p className="font-semibold text-sm">Failed to load dashboard</p>
        <button
          onClick={() => refetch()}
          className="text-xs font-bold text-primary border border-primary/30 px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors"
        >
          Retry
        </button>
      </div>
    );

  const collectedPct = pct(s?.totalCollected ?? 0, s?.totalRevenue ?? 0);
  const profitPositive = (s?.profit ?? 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm font-semibold">{greeting},</p>
          <h1 className="text-2xl font-black text-secondary tracking-tight">
            {user?.name?.split(" ")[0] ?? "Admin"} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 h-4">
            {currentDateString}
          </p>
          {hasFilters && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg uppercase tracking-wide">
                Filtered View
              </span>
              <span className="text-[10px] text-slate-400">
                {startDate && endDate
                  ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                  : startDate
                    ? `From ${new Date(startDate).toLocaleDateString()}`
                    : `Until ${new Date(endDate).toLocaleDateString()}`}
              </span>
            </div>
          )}
        </div>

        {/* Actions Controls Container */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Date Filters */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl shadow-sm">
            <Calendar size={16} className="text-slate-400 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs border-none bg-transparent focus:outline-none text-slate-700"
            />
            <span className="text-slate-400 text-xs font-medium">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs border-none bg-transparent focus:outline-none text-slate-700"
            />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Clear filters"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-secondary border border-slate-200 px-4 py-2.5 bg-white rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={String(s?.totalOrders ?? 0)}
          icon={ShoppingCart}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
        <StatCard
          label="Revenue"
          value={pkr(s?.totalRevenue ?? 0)}
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-primary"
          sub={`${collectedPct}% collected`}
          subColor={collectedPct >= 70 ? "text-primary" : "text-amber-500"}
        />
        <StatCard
          label="Collected"
          value={pkr(s?.totalCollected ?? 0)}
          icon={Wallet}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          label="Remaining"
          value={pkr(s?.totalRemaining ?? 0)}
          icon={BadgeDollarSign}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          sub={s?.totalRemaining ? "Pending collection" : "All clear"}
          subColor={s?.totalRemaining ? "text-amber-500" : "text-primary"}
        />
        <StatCard
          label="Investment"
          value={pkr(s?.totalInvestment ?? 0)}
          icon={PiggyBank}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
        />
        <StatCard
          label="Profit"
          value={pkr(s?.profit ?? 0)}
          icon={BarChart3}
          iconBg={profitPositive ? "bg-emerald-50" : "bg-red-50"}
          iconColor={profitPositive ? "text-primary" : "text-red-500"}
          sub={s?.profitMargin}
          subColor={profitPositive ? "text-primary" : "text-red-500"}
        />
        <StatCard
          label="Market Debt"
          value={pkr(s?.marketDebt ?? 0)}
          icon={AlertCircle}
          iconBg="bg-red-50"
          iconColor="text-red-400"
          sub={s?.marketDebt ? "Owed to you" : "No outstanding debt"}
          subColor={s?.marketDebt ? "text-red-400" : "text-slate-400"}
        />
        <div className="bg-secondary rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest">
            Profit Margin
          </p>
          <p className="text-3xl font-black text-white mt-1">
            {s?.profitMargin ?? "0%"}
          </p>
          <p className="text-[11px] text-white/50 font-semibold mt-1">
            vs total revenue
          </p>
        </div>
      </div>

      {/* Charts + lists row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales chart container */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-black text-secondary">
                Sales Overview
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                Revenue vs collected
              </p>
            </div>
            <span className="text-[10px] font-bold text-primary bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg uppercase tracking-wide">
              {sales.length} days
            </span>
          </div>

          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-52 text-slate-300">
              <BarChart3 size={32} className="mb-2" />
              <p className="text-xs font-semibold">No sales data yet</p>
              <p className="text-[11px] mt-1">
                Create your first order to see trends
              </p>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-4">
                {[
                  { color: "#0f766e", label: "Revenue" },
                  { color: "#15803d", label: "Collected" },
                ].map((l) => (
                  <span
                    key={l.label}
                    className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ background: l.color }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
              <div style={{ position: "relative", height: "200px" }}>
                <canvas id="salesChart" />
              </div>
            </>
          )}
        </div>

        {/* Top debtors */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="mb-5">
            <h3 className="text-sm font-black text-secondary">Top Debtors</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Shops with highest dues
            </p>
          </div>

          {topDebtors.length === 0 ? (
            <EmptyList label="debtors" />
          ) : (
            <div className="space-y-3">
              {topDebtors.slice(0, 6).map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-500 shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-secondary truncate">
                      {d.shopName}
                    </p>
                    <div className="mt-1 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{
                          width: `${pct(d.dueBalance, topDebtors[0]?.dueBalance ?? 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] font-black text-red-500 shrink-0">
                    {pkr(d.dueBalance)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top creditors */}
      {topCreditors.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="mb-5">
            <h3 className="text-sm font-black text-secondary">Top Creditors</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Shops with credit balances
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topCreditors.slice(0, 6).map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[11px] font-black text-primary border border-emerald-100 shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-secondary truncate">
                    {c.shopName}
                  </p>
                  <p className="text-[11px] font-semibold text-primary">
                    {pkr(c.dueBalance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default DashboardOverviewPage;
