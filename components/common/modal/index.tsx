import { X } from "lucide-react";
import { useEffect } from "react";

type TModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}: TModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.45)" }}
      onClick={onClose}
    >
      <div
        className={`w-full ${widths[size]} bg-white rounded-4xl border border-slate-100 shadow-2xl overflow-hidden animate-[toastIn_0.2s_ease]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-slate-50">
          <div>
            <h2 className="text-base font-black text-primary tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-8 py-6 overflow-y-auto max-h-[calc(85vh-100px)] flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
