"use client";

import { memo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Inbox,
  Mail,
  Smartphone,
  Calendar,
  Eye,
  MessageSquareCode,
  CheckCircle,
  Bookmark,
  AlertCircle,
  FileText,
  Reply,
} from "lucide-react";

import { useToast } from "@/components/common/toast";
import Pagination from "@/components/common/paginations";
import { DataTable } from "@/components/common/table";
import Modal from "@/components/common/modal";
import {
  TContactMessageRow,
  TMessageStatus,
  useGetContactMessages,
} from "@/api/contacts/queries";
import API_URL from "@/config/url-config";
import { QUERY_KEYS } from "@/api/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUpdateContactMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TContactMessageRow>;
    }) => {
      const response = await API_URL.patch(
        `/api/v1/contact/messages/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MESSAGES] });
    },
  });
};

const ContactMessagesPage = memo(function ContactMessagesPage() {
  const { toast } = useToast();

  // --- Filter Tracking Parameters ---
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TMessageStatus | "all">("new");

  // --- Modals Operational State ---
  const [inspectMessage, setInspectMessage] =
    useState<TContactMessageRow | null>(null);
  const [resolveTarget, setResolveTarget] = useState<TContactMessageRow | null>(
    null,
  );

  // --- Response Input States ---
  const [adminNote, setAdminNote] = useState("");
  const [targetStatus, setTargetStatus] = useState<TMessageStatus>("read");

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // Synchronize input default structures upon opening resolution modals
  useEffect(() => {
    if (resolveTarget) {
      setAdminNote(resolveTarget.admin_note || "");
      setTargetStatus(
        resolveTarget.status === "new" ? "read" : resolveTarget.status,
      );
    } else {
      setAdminNote("");
    }
  }, [resolveTarget]);

  // --- Queries & Mutations Layer Configuration ---
  const filtersObj = {
    page,
    per_page: 10,
    status: activeTab === "all" ? undefined : activeTab,
  };

  const { data: serverData, isLoading } = useGetContactMessages(filtersObj);
  const updateMessageMutation = useUpdateContactMessage();

  const messageList: TContactMessageRow[] = Array.isArray(serverData)
    ? serverData
    : serverData?.items || serverData?.data?.items || serverData?.data || [];

  // --- Execution Form Handlers ---
  const handleMessageUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTarget) return;

    // Build standard body envelope payload to pass safely down into patch routes
    const explicitPayload: Partial<TContactMessageRow> = {
      ...resolveTarget,
      status: targetStatus,
      admin_note: adminNote,
    };

    updateMessageMutation.mutate(
      { id: resolveTarget.id, data: explicitPayload },
      {
        onSuccess: () => {
          toast(
            `Ticket payload index successfully shifted to [${targetStatus.toUpperCase()}]`,
            "success",
          );
          setResolveTarget(null);
        },
        onError: (err: any) => {
          toast(
            err?.message || "Failed to submit response metrics logs",
            "error",
          );
        },
      },
    );
  };

  // Automatically mark unread tickets as "read" behind the scenes when opening them to inspect details
  const handleOpenInspection = (msg: TContactMessageRow) => {
    setInspectMessage(msg);
    if (msg.status === "new") {
      updateMessageMutation.mutate({
        id: msg.id,
        data: { ...msg, status: "read" },
      });
    }
  };

  // --- Table Columns Definition Blueprint ---
  const columns: ColumnDef<TContactMessageRow, any>[] = [
    {
      header: "Inquirer Details",
      accessorKey: "name",
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-primary text-sm leading-tight">
            {row.original.name}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium flex items-center gap-1">
            <Mail size={10} /> {row.original.email}
          </p>
        </div>
      ),
    },
    {
      header: "Subject Matter Target",
      accessorKey: "subject",
      cell: ({ row }) => (
        <div className="max-w-[220px]">
          <p className="text-xs font-bold text-slate-700 truncate">
            {row.original.subject}
          </p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {row.original.message}
          </p>
        </div>
      ),
    },
    {
      header: "Lifecycle State",
      accessorKey: "status",
      cell: ({ row }) => {
        const stateColor: Record<TMessageStatus, string> = {
          new: "bg-amber-50 text-amber-600 border-amber-200",
          read: "bg-blue-50 text-blue-600 border-blue-200",
          resolved: "bg-emerald-50 text-emerald-600 border-emerald-200",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${stateColor[row.original.status] || "bg-slate-50"}`}
          >
            {row.original.status}
          </span>
        );
      },
    },
    {
      header: "Received On",
      accessorKey: "created_at",
      cell: ({ row }) => (
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
          <Calendar size={12} />
          {new Date(row.original.created_at).toLocaleDateString("en-PK", {
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleOpenInspection(row.original)}
            className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-50 transition-colors cursor-pointer"
            title="Read Message"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            onClick={() => setResolveTarget(row.original)}
            className="p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer"
            title="Update Status & Note"
          >
            <Reply size={15} />
          </button>
        </div>
      ),
    },
  ];

  const tabSchema: { key: TMessageStatus | "all"; label: string }[] = [
    { key: "new", label: "New Messages" },
    { key: "read", label: "In Review" },
    { key: "resolved", label: "Resolved Tickets" },
    { key: "all", label: "All Archives" },
  ];

  return (
    <div className="space-y-6">
      {/* Branding Header Titles */}
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Helpdesk & Contact Queries
        </h1>
        <p className="text-slate-400 text-sm">
          Review incoming public support submissions, document system updates,
          and route responses.
        </p>
      </div>

      {/* Unified Status Tab Navigation Layout */}
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
                  ? "border-primary text-primary bg-primary/[0.01]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Table Layout Stream */}
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
          <DataTable data={messageList} columns={columns} />
          {serverData?.pages > 1 && (
            <Pagination
              meta={{
                totalItems: serverData.total,
                itemCount: messageList.length,
                currentPage: serverData.page,
                totalPages: serverData.pages,
                itemsPerPage: serverData.per_page,
                hasNextPage: serverData.page < serverData.pages,
                hasPreviousPage: serverData.page > 1,
              }}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* --- MODAL 1: CLEAN VIEW INQUIRY VIEW OVERLAY (NO JSON) --- */}
      <Modal
        isOpen={!!inspectMessage}
        onClose={() => setInspectMessage(null)}
        title="Support Message Details"
      >
        {inspectMessage && (
          <div className="space-y-5 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
              <span className="text-[10px] tracking-wider text-slate-400 font-extrabold block">
                TICKET SUBJECT
              </span>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <FileText size={16} className="text-primary" />{" "}
                {inspectMessage.subject}
              </h3>
            </div>

            <div className="p-4 border border-slate-100 rounded-2xl bg-white space-y-2">
              <span className="text-[10px] tracking-wider text-slate-400 font-extrabold block">
                SUBMITTED INQUIRY MESSAGE BODY
              </span>
              <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                "{inspectMessage.message}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
              <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold leading-none">
                    EMAIL
                  </span>
                  <span>{inspectMessage.email}</span>
                </div>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-2">
                <Smartphone size={14} className="text-slate-400" />
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold leading-none">
                    PHONE
                  </span>
                  <span>{inspectMessage.phone || "Not Declared"}</span>
                </div>
              </div>
            </div>

            {inspectMessage.admin_note && (
              <div className="p-3.5 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-1">
                <span className="text-[10px] text-emerald-600 font-black block flex items-center gap-1">
                  <MessageSquareCode size={12} /> RECORDED ACTION NOTES
                </span>
                <p className="text-xs font-mono font-medium text-slate-600">
                  {inspectMessage.admin_note}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setInspectMessage(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-bold text-slate-500 transition-colors cursor-pointer"
              >
                Close Document
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* --- MODAL 2: TICKETS RE-ROUTING & RESOLUTION PORTAL --- */}
      <Modal
        isOpen={!!resolveTarget}
        onClose={() => setResolveTarget(null)}
        title="Update Ticket Parameters"
      >
        {resolveTarget && (
          <form onSubmit={handleMessageUpdate} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                SET MESSAGE CLASSIFICATION STATUS
              </label>
              <select
                value={targetStatus}
                onChange={(e) =>
                  setTargetStatus(e.target.value as TMessageStatus)
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 outline-none focus:border-primary/40 cursor-pointer"
              >
                <option value="new">New / Inbox (Keep Unresolved)</option>
                <option value="read">Mark as Read / In Review</option>
                <option value="resolved">
                  Mark as Resolved / Action Finalized
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                ADMINISTRATIVE INTERVENTIONS & NOTES
              </label>
              <textarea
                required
                rows={4}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Log internal details regarding actions taken, customer callback notes, or resolution outcomes..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-primary/40 resize-none leading-relaxed"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResolveTarget(null)}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-400 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMessageMutation.isPending}
                className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs transition-all shadow-sm"
              >
                {updateMessageMutation.isPending
                  ? "Updating System Ledger..."
                  : "Commit Update Parameters"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
});

export default ContactMessagesPage;
