import { useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";

export function AddressRowActions({
  address,
  onDelete,
}: {
  address: any;
  onDelete: (address: any) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-secondary transition-colors cursor-pointer"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 bg-white rounded-2xl border border-slate-100 shadow-xl py-1.5 w-44 overflow-hidden">
            <button
              onClick={() => {
                onDelete(address);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 size={14} /> Delete Address
            </button>
          </div>
        </>
      )}
    </div>
  );
}
