"use client";

import { memo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Search,
  User,
  Mail,
  Smartphone,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import Pagination from "@/components/common/paginations";
import { DataTable } from "@/components/common/table";
import Modal from "@/components/common/modal";
import useDebounce from "@/hooks/useDebounce";
import Image from "next/image";
import { IMAGE_URL } from "@/config/url-config";
import { TCustomerRow, useGetCustomers } from "@/api/user/queries";

const CustomersPage = memo(function CustomersPage() {
  // --- Pagination & Search Matrices States ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // --- Profile Inspection Overlay Interceptor ---
  const [inspectCustomer, setInspectCustomer] = useState<TCustomerRow | null>(
    null,
  );

  // Reset pagination indexes whenever search parameters mutate
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // --- Dynamic TanStack Data Engine ---
  const filtersObj = {
    page,
    per_page: 10,
    search: debouncedSearch || null,
  };

  const { data: customerData, isLoading } = useGetCustomers(filtersObj);

  const customerList: TCustomerRow[] = Array.isArray(customerData)
    ? customerData
    : customerData?.items ||
      customerData?.data?.items ||
      customerData?.data ||
      [];

  // --- Columns Specification Schema Blueprint ---
  const columns: ColumnDef<TCustomerRow, any>[] = [
    {
      header: "Customer Persona",
      accessorKey: "name",
      cell: ({ row }) => {
        const completeAvatarUrl = row.original.avatar
          ? `${IMAGE_URL}/uploads/${row.original.avatar}`
          : null;
        const initials =
          row.original.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) ?? "C";

        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 relative">
              {completeAvatarUrl ? (
                <Image
                  src={completeAvatarUrl}
                  fill
                  sizes="40px"
                  alt={row.original.name}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs">
                  {initials}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-primary text-sm leading-tight">
                {row.original.name}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                {row.original.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Phone Parameter",
      accessorKey: "phone",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-600">
          {row.original.phone || "No phone verified"}
        </span>
      ),
    },
    {
      header: "Verification & Safety Status",
      accessorKey: "is_active",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-black ${row.original.is_active ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-500 border border-rose-100"}`}
          >
            {row.original.is_active ? "ACTIVE" : "RESTRICTED"}
          </span>
          {row.original.is_verified && (
            <span className="bg-blue-50 text-blue-600 text-[9px] px-1.5 py-0.5 rounded font-black border border-blue-100">
              EMAIL VERIFIED
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Registration Timeline",
      accessorKey: "created_at",
      cell: ({ row }) => (
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
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
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setInspectCustomer(row.original)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 font-bold text-xs hover:border-primary/30 hover:text-primary transition-all cursor-pointer"
          >
            <Eye size={13} /> View Metrics
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Structural Branding Action Header */}
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Customer Directories
        </h1>
        <p className="text-slate-400 text-sm">
          Monitor consumer metrics, evaluate onboarding records, and track
          identity verification metrics.
        </p>
      </div>

      {/* Advanced Filter Management Layout Controls */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus-within:border-primary/40 transition-all max-w-md">
        <Search size={15} className="text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer catalog by full name or email parameters..."
          className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 font-medium"
        />
      </div>

      {/* Primary Data Engine table block workspace */}
      {isLoading ? (
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
          <DataTable data={customerList} columns={columns} />

          {/* Consumer Pagination Sync Rendering */}
          {customerData?.pages > 1 && (
            <Pagination
              meta={{
                totalItems: customerData.total,
                itemCount: customerList.length,
                currentPage: customerData.page,
                totalPages: customerData.pages,
                itemsPerPage: customerData.per_page,
                hasNextPage: customerData.page < customerData.pages,
                hasPreviousPage: customerData.page > 1,
              }}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* --- OVERLAY MODAL: BEAUTIFIED PROFILE OVERVIEW --- */}
      <Modal
        isOpen={!!inspectCustomer}
        onClose={() => setInspectCustomer(null)}
        title="Consumer Profile Analytics Portfolio"
      >
        {inspectCustomer && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-xl relative overflow-hidden bg-primary/5 border border-slate-200 shrink-0">
                {inspectCustomer.avatar ? (
                  <Image
                    src={`${IMAGE_URL}${inspectCustomer.avatar}`}
                    fill
                    className="object-cover"
                    alt=""
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-black text-lg">
                    {inspectCustomer.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base leading-tight">
                  {inspectCustomer.name}
                </h4>
                <p className="text-xs text-slate-400 font-bold mt-1.5 flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-500" /> Account
                  Type Index:{" "}
                  <span className="uppercase text-emerald-600">
                    STANDARD CUSTOMER
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-white">
                <Mail size={16} className="text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block leading-none">
                    EMAIL ACCOUNT PROFILE
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {inspectCustomer.email}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-white">
                <Smartphone size={16} className="text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block leading-none">
                    VERIFIED MOBILE CONTACT
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {inspectCustomer.phone || "No contact parameter bound"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-white">
                <Calendar size={16} className="text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block leading-none">
                    SYSTEM ACCOUNT ONBOARDED
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {new Date(inspectCustomer.created_at).toLocaleDateString(
                      "en-PK",
                      { dateStyle: "long" },
                    )}{" "}
                    at{" "}
                    {new Date(inspectCustomer.created_at).toLocaleTimeString(
                      "en-PK",
                      { timeStyle: "short" },
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-1 text-[11px] font-bold text-slate-500">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block mb-0.5 font-extrabold">
                  AUTHENTICATION GUID
                </span>
                <span className="font-mono block truncate select-all text-slate-700">
                  {inspectCustomer.id}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-400 block mb-0.5 font-extrabold">
                  OPERATION SECURITY
                </span>
                <span
                  className={`block font-extrabold ${inspectCustomer.is_active ? "text-emerald-600" : "text-rose-500"}`}
                >
                  {inspectCustomer.is_active
                    ? "UNRESTRICTED ACCESS"
                    : "SUSPENDED ACCOUNT"}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setInspectCustomer(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-bold text-slate-500 transition-colors cursor-pointer"
              >
                Close Metrics View
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
});

export default CustomersPage;
