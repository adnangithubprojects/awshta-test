"use client";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TToastType = "success" | "error" | "warning" | "info";

type TToast = {
  id: string;
  message: string;
  type: TToastType;
  duration: number;
};

type TToastContext = {
  toast: (message: string, type?: TToastType, duration?: number) => void;
  dismiss: (id: string) => void;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG: Record<
  TToastType,
  {
    icon: string;
    bar: string;
    border: string;
    iconBg: string;
    iconText: string;
  }
> = {
  success: {
    icon: "✓",
    border: "border-l-green-400",
    bar: "bg-green-400",
    iconBg: "bg-green-950",
    iconText: "text-green-400",
  },
  error: {
    icon: "✕",
    border: "border-l-red-400",
    bar: "bg-red-400",
    iconBg: "bg-red-950",
    iconText: "text-red-400",
  },
  warning: {
    icon: "⚠",
    border: "border-l-yellow-400",
    bar: "bg-yellow-400",
    iconBg: "bg-yellow-950",
    iconText: "text-yellow-400",
  },
  info: {
    icon: "i",
    border: "border-l-blue-400",
    bar: "bg-blue-400",
    iconBg: "bg-blue-950",
    iconText: "text-blue-400",
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<TToastContext | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};

// ─── Single Toast ─────────────────────────────────────────────────────────────

const ToastItem = ({
  toast,
  onDismiss,
}: {
  toast: TToast;
  onDismiss: () => void;
}) => {
  const c = CONFIG[toast.type];

  return (
    <div
      role="alert"
      className={`
        relative flex items-center gap-3 min-w-72 max-w-md
        px-4 py-3 rounded-lg overflow-hidden
        bg-neutral-900 text-neutral-100 text-sm
        border-l-[3px] ${c.border}
        animate-[toastIn_0.22s_ease]
      `}
    >
      {/* Icon */}
      <span
        className={`
        flex items-center justify-center shrink-0
        w-5 h-5 rounded-full text-[11px] font-bold
        ${c.iconBg} ${c.iconText}
      `}
      >
        {c.icon}
      </span>

      {/* Message */}
      <p className="flex-1 leading-snug m-0">{toast.message}</p>

      {/* Close */}
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="text-neutral-500 hover:text-neutral-200 text-[11px] px-1 rounded transition-colors"
      >
        ✕
      </button>

      {/* Progress bar */}
      <span
        className={`absolute bottom-0 left-0 h-0.5 ${c.bar} animate-[shrink_linear_forwards]`}
        style={{ animationDuration: `${toast.duration}ms` }}
      />
    </div>
  );
};

// ─── Container ────────────────────────────────────────────────────────────────

const ToastContainer = ({
  toasts,
  dismiss,
}: {
  toasts: TToast[];
  dismiss: (id: string) => void;
}) => (
  <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none">
    {toasts.map((t) => (
      <div key={t.id} className="pointer-events-auto">
        <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
      </div>
    ))}
  </div>
);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<TToast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    (message: string, type: TToastType = "info", duration = 4000) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
};
