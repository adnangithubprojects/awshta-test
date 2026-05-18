import { TMeta } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

type TPaginationProps = {
  meta: TMeta;
  onPageChange: (page: number) => void;
  entityLabel?: string;
};

export default function Pagination({
  meta,
  onPageChange,
  entityLabel = "shops",
}: TPaginationProps) {
  const { currentPage, totalPages, totalItems, itemsPerPage } = meta;

  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
  );

  const withEllipsis: (number | "...")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) withEllipsis.push("...");
    withEllipsis.push(p);
  });
  // console.log('totalPages', totalPages)
  // if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-2 pt-2">
      <p className="text-xs text-slate-400 font-semibold">
        Showing{" "}
        <span className="font-bold text-secondary">
          {from}–{to}
        </span>{" "}
        of <span className="font-bold text-secondary">{totalItems}</span>{" "}
        {entityLabel}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!meta.hasPreviousPage}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-primary/40 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft size={14} />
        </button>

        {withEllipsis.map((p, i) =>
          p === "..." ? (
            <span
              key={`e-${i}`}
              className="w-8 h-8 flex items-center justify-center text-slate-300 text-xs"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                p === currentPage
                  ? "bg-secondary text-white shadow-md shadow-secondary/20"
                  : "border border-slate-200 text-slate-500 hover:border-primary/40 hover:text-primary"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!meta.hasNextPage}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-primary/40 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
