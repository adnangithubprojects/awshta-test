import { CheckCircle2, Clock, Truck, XCircle, AlertCircle } from "lucide-react";

// Maps semantic state badges safely
export function StatusBadge({
  type,
  value,
}: {
  type: "order" | "payment";
  value: string;
}) {
  const norm = value?.toLowerCase();

  const config: Record<string, { bg: string; text: string }> = {
    pending: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
    processing: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
    shipped: { bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-700" },
    delivered: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
    },
    completed: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
    },
    cancelled: { bg: "bg-rose-50 border-rose-100", text: "text-rose-600" },
    failed: { bg: "bg-red-50 border-red-100", text: "text-red-600" },
    paid: { bg: "bg-teal-50 border-teal-200", text: "text-teal-700" },
  };

  const match = config[norm] || {
    bg: "bg-slate-50 border-slate-200",
    text: "text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide border uppercase ${match.bg} ${match.text}`}
    >
      {value}
    </span>
  );
}

// Order Status Pipeline Progression Timeline Visualizer
export function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const stages = ["pending", "processing", "shipped", "delivered"];
  const currentIdx = stages.indexOf(currentStatus?.toLowerCase());

  const getIcon = (idx: number, stage: string) => {
    if (currentStatus?.toLowerCase() === "cancelled")
      return <XCircle size={14} className="text-rose-500" />;
    if (idx < currentIdx)
      return <CheckCircle2 size={14} className="text-emerald-500" />;
    if (idx === currentIdx)
      return <Clock size={14} className="text-amber-500 animate-pulse" />;
    return <Truck size={14} className="text-slate-300" />;
  };

  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto py-4">
      {stages.map((stage, i) => (
        <div key={stage} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center relative">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 bg-white transition-all z-10 ${i <= currentIdx ? "border-secondary shadow-sm" : "border-slate-100"}`}
            >
              {getIcon(i, stage)}
            </div>
            <span
              className={`text-[10px] font-bold uppercase mt-1.5 absolute -bottom-5 whitespace-nowrap tracking-tight ${i <= currentIdx ? "text-secondary" : "text-slate-400"}`}
            >
              {stage}
            </span>
          </div>
          {i < stages.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-2 rounded transition-all ${i < currentIdx ? "bg-emerald-400" : "bg-slate-100"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
