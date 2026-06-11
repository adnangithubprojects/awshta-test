"use client";

import { memo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  MessageSquare,
  ClipboardCheck,
} from "lucide-react";

import { useToast } from "@/components/common/toast";
import Pagination from "@/components/common/paginations";
import { DataTable } from "@/components/common/table";
import Modal from "@/components/common/modal";
import {
  TSellerRequestRow,
  TSellerStatus,
  TUpdateSellerStatusInput,
  useGetSellerRequests,
} from "@/api/user/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API_URL from "@/config/url-config";
import { QUERY_KEYS } from "@/api/query-keys";

const useUpdateSellerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: TUpdateSellerStatusInput;
    }) => {
      const response = await API_URL.patch(
        `/api/v1/sellers/seller-requests/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SELLER_REQUESTS] });
    },
  });
};

const SellerRequestsPage = memo(function SellerRequestsPage() {
  const { toast } = useToast();

  // --- Search & Status Tab States ---
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TSellerStatus>("pending");

  // --- Interaction States ---
  const [inspectRequest, setInspectRequest] =
    useState<TSellerRequestRow | null>(null);
  const [actionTarget, setActionTarget] = useState<TSellerRequestRow | null>(
    null,
  );
  const [nextStatus, setNextStatus] = useState<TSellerStatus>("approved");
  const [adminNote, setAdminNote] = useState("");

  // Reset pagination tracker whenever layout tabs switch over
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // Clear notes when state actions close
  useEffect(() => {
    if (!actionTarget) setAdminNote("");
  }, [actionTarget]);

  // --- React Query Client Pipeline ---
  const filtersObj = {
    page,
    per_page: 10,
    status: activeTab,
  };

  const { data: requestsData, isLoading } = useGetSellerRequests(filtersObj);
  const updateStatusMutation = useUpdateSellerStatus();
  console.log("requestsData", requestsData);
  const requestList: TSellerRequestRow[] = Array.isArray(requestsData)
    ? requestsData
    : requestsData?.items ||
      requestsData?.data?.items ||
      requestsData?.data ||
      [];

  // --- Action Handler ---
  const handleStatusResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTarget) return;

    updateStatusMutation.mutate(
      {
        id: actionTarget.id,
        data: {
          status: nextStatus,
          admin_note: adminNote,
        },
      },
      {
        onSuccess: () => {
          toast(
            `Vendor request resolved to ${nextStatus.toUpperCase()}`,
            "success",
          );
          setActionTarget(null);
        },
        onError: (err: string) => {
          toast(err || "Failed to process request update", "error");
        },
      },
    );
  };

  const triggerActionPortal = (
    request: TSellerRequestRow,
    targetState: TSellerStatus,
  ) => {
    setNextStatus(targetState);
    setAdminNote(request.admin_note || "");
    setActionTarget(request);
  };

  // --- Table Columns Architecture ---
  const columns: ColumnDef<TSellerRequestRow, any>[] = [
    {
      header: "Seller Application Profile",
      accessorKey: "seller_name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-slate-200 bg-primary/5 text-primary flex items-center justify-center shrink-0">
            <Store size={18} />
          </div>
          <div>
            <p className="font-bold text-primary text-sm leading-tight">
              {row.original.seller_name}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 truncate max-w-[240px] font-medium">
              {row.original.description || "No description provided"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Status Paradigm",
      accessorKey: "status",
      cell: ({ row }) => {
        const statusConfig: Record<
          TSellerStatus,
          { badge: string; icon: any }
        > = {
          pending: {
            badge: "bg-amber-50 text-amber-600 border-amber-200",
            icon: Clock,
          },
          approved: {
            badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
            icon: CheckCircle2,
          },
          rejected: {
            badge: "bg-rose-50 text-rose-500 border-rose-200",
            icon: XCircle,
          },
          suspended: {
            badge: "bg-slate-100 text-slate-600 border-slate-300",
            icon: AlertTriangle,
          },
        };

        const config =
          statusConfig[row.original.status] || statusConfig.pending;
        const IconComponent = config.icon;

        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${config.badge}`}
          >
            <IconComponent size={11} />
            {row.original.status}
          </span>
        );
      },
    },
    {
      header: "Submitted On",
      accessorKey: "created_at",
      cell: ({ row }) => (
        <span className="text-xs text-slate-400 font-semibold">
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
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setInspectRequest(row.original)}
            className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-50 transition-colors cursor-pointer"
            title="Inspect Form Details"
          >
            <Eye size={15} />
          </button>

          {row.original.status === "pending" && (
            <>
              <button
                type="button"
                onClick={() => triggerActionPortal(row.original, "approved")}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100/70 border border-emerald-200 transition-colors cursor-pointer"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => triggerActionPortal(row.original, "rejected")}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-500 hover:bg-rose-100/70 border border-rose-200 transition-colors cursor-pointer"
              >
                Reject
              </button>
            </>
          )}

          {row.original.status === "approved" && (
            <button
              type="button"
              onClick={() => triggerActionPortal(row.original, "suspended")}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              Suspend
            </button>
          )}

          {row.original.status === "suspended" && (
            <button
              type="button"
              onClick={() => triggerActionPortal(row.original, "approved")}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100/70 border border-emerald-200 transition-colors cursor-pointer"
            >
              Re-Approve
            </button>
          )}
        </div>
      ),
    },
  ];

  // --- Tab Arrays mapping helper ---
  const tabSchema: { key: TSellerStatus; label: string; style: string }[] = [
    {
      key: "pending",
      label: "Pending Approvals",
      style: "active:border-amber-500 text-amber-600",
    },
    {
      key: "approved",
      label: "Active Sellers",
      style: "active:border-emerald-500 text-emerald-600",
    },
    {
      key: "rejected",
      label: "Rejected Enlistments",
      style: "active:border-rose-500 text-rose-600",
    },
    {
      key: "suspended",
      label: "Suspended Channels",
      style: "active:border-slate-500 text-slate-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Structural Header Title Block */}
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Marketplace Seller Management
        </h1>
        <p className="text-slate-400 text-sm">
          Verify commercial documentation profiles, evaluate applications,
          resolve access requests.
        </p>
      </div>

      {/* Navigation Custom Segment Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {tabSchema.map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "border-primary text-primary bg-primary/[0.02]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Table Interface Area */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <DataTable data={requestList} columns={columns} />
          {requestsData?.pages > 1 && (
            <Pagination
              meta={{
                totalItems: requestsData.total,
                itemCount: requestList.length,
                currentPage: requestsData.page,
                totalPages: requestsData.pages,
                itemsPerPage: requestsData.per_page,
                hasNextPage: requestsData.page < requestsData.pages,
                hasPreviousPage: requestsData.page > 1,
              }}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* --- MODAL 1: INSPECT APPLICATION DOSSIER DETAILS --- */}
      <Modal
        isOpen={!!inspectRequest}
        onClose={() => setInspectRequest(null)}
        title="Application Parameters Dossier"
      >
        {inspectRequest && (
          <div className="space-y-5 pt-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] tracking-wider text-slate-400 font-extrabold block">
                BUSINESS REGISTERED NAME
              </span>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Store size={16} className="text-primary" />{" "}
                {inspectRequest.seller_name}
              </h3>
            </div>

            <div className="space-y-1 p-3 border border-slate-100 rounded-xl bg-white">
              <span className="text-[10px] tracking-wider text-slate-400 font-extrabold block">
                BUSINESS OPERATION OBJECTIVE
              </span>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                {inspectRequest.description ||
                  "No commercial target overview declared."}
              </p>
            </div>

            {inspectRequest.admin_note && (
              <div className="space-y-1 p-3 border border-slate-200 rounded-xl bg-amber-50/40">
                <span className="text-[10px] tracking-wider text-amber-600 font-extrabold block flex items-center gap-1">
                  <MessageSquare size={12} /> LATEST ADMINISTRATIVE RECORD NOTES
                </span>
                <p className="text-xs text-slate-600 font-semibold font-mono">
                  {inspectRequest.admin_note}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-slate-500">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[9px] text-slate-400 block mb-0.5 font-extrabold">
                  SUBMITTED ACCOUNT GUID
                </span>
                <span className="font-mono block truncate select-all text-slate-700">
                  {inspectRequest.user_id}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[9px] text-slate-400 block mb-0.5 font-extrabold">
                  LAST PROFILE UPDATE
                </span>
                <span className="block text-slate-700">
                  {new Date(inspectRequest.updated_at).toLocaleString("en-PK")}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setInspectRequest(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-bold text-slate-500 transition-colors"
              >
                Dismiss Portfolio
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* --- MODAL 2: SYSTEM REQUEST STATUS RESOLUTION INTERFACES --- */}
      <Modal
        isOpen={!!actionTarget}
        onClose={() => setActionTarget(null)}
        title={`Resolve Application: ${actionTarget?.seller_name || ""}`}
        size="md"
      >
        {actionTarget && (
          <form onSubmit={handleStatusResolution} className="space-y-4 pt-2">
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2.5">
              <ClipboardCheck size={16} className="text-primary" />
              <p className="text-xs font-medium text-slate-600">
                You are changing this request status index criteria to{" "}
                <span className="font-black text-primary uppercase">
                  {nextStatus}
                </span>
                .
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                ADMINISTRATIVE ACTION NOTE / JUSTIFICATION
              </label>
              <textarea
                required
                rows={4}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Declare explicit rejection reasoning or system permission notes forwarded to the merchant dashboard channel..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-primary/40 resize-none leading-relaxed"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActionTarget(null)}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-400 transition-colors"
              >
                Abort Execution
              </button>
              <button
                type="submit"
                disabled={updateStatusMutation.isPending}
                className={`flex-1 py-3 text-white rounded-xl font-bold text-xs transition-all shadow-sm ${
                  nextStatus === "approved"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : nextStatus === "rejected"
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-slate-700 hover:bg-slate-800"
                }`}
              >
                {updateStatusMutation.isPending
                  ? "Syncing Platform Indexes..."
                  : `Execute ${nextStatus.toUpperCase()}`}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
});

export default SellerRequestsPage;
