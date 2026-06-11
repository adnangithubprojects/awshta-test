"use client";

import { memo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Trash2,
  Ban,
  Edit2,
  Mail,
  Smartphone,
} from "lucide-react";

import { useToast } from "@/components/common/toast";
import Pagination from "@/components/common/paginations";
import { DataTable } from "@/components/common/table";
import Modal from "@/components/common/modal";
import useDebounce from "@/hooks/useDebounce";
import Image from "next/image";
import { IMAGE_URL } from "@/config/url-config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  asyncDeleteUser,
  asyncToggleBlockUser,
  asyncUpdateUser,
} from "@/api/user/fetchers";
import { QUERY_KEYS } from "@/api/query-keys";
import { useGetAllUsers } from "@/api/user/queries";

export type TUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "seller" | "buyer";
  avatar: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: asyncUpdateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: asyncDeleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
    },
  });
};

export const useToggleBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: asyncToggleBlockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
    },
  });
};

const UsersPage = memo(function UsersPage() {
  const { toast } = useToast();

  // --- Search & Pagination Controls ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // --- Action Modal Targets ---
  const [inspectUser, setInspectUser] = useState<TUserRow | null>(null);
  const [editUser, setEditUser] = useState<TUserRow | null>(null);
  const [blockTarget, setBlockTarget] = useState<TUserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TUserRow | null>(null);

  // --- Form Controls state ---
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "buyer" as const,
    is_active: true,
    is_verified: true,
  });

  // Sync state values with form inputs upon edit selection
  useEffect(() => {
    if (editUser) {
      setEditForm({
        name: editUser.name,
        email: editUser.email,
        phone: editUser.phone || "",
        role: editUser.role,
        is_active: editUser.is_active,
        is_verified: editUser.is_verified,
      });
    }
  }, [editUser]);

  // Reset current view threshold to index page 1 upon filtering modifications
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedRole, selectedStatus]);

  // --- Queries & Asynchronous Mutations Layer ---
  const filtersObj = {
    page,
    per_page: 10,
    search: debouncedSearch || null,
    role: selectedRole || null,
    is_active: selectedStatus === "" ? null : selectedStatus === "active",
  };

  const { data: usersData, isLoading } = useGetAllUsers(filtersObj);

  // Directly linking up your exact custom mutations hooks
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const toggleBlockMutation = useToggleBlockUser();

  const userList: TUserRow[] = Array.isArray(usersData)
    ? usersData
    : usersData?.items || usersData?.data?.items || usersData?.data || [];

  // --- Event Execution Handlers ---
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    updateUserMutation.mutate(
      { id: editUser.id, data: editForm },
      {
        onSuccess: () => {
          setEditUser(null);
          toast("User details updated successfully", "success");
        },
        onError: (err: any) => {
          toast(
            err?.message || "Failed to alter configuration profile",
            "error",
          );
        },
      },
    );
  };

  const handleToggleBlock = () => {
    if (!blockTarget) return;

    toggleBlockMutation.mutate(blockTarget.id, {
      onSuccess: () => {
        toast(
          "Account access restriction toggle updated successfully",
          "success",
        );
        setBlockTarget(null);
      },
      onError: (err: any) => {
        toast(err?.message || "Operation restriction sync failed", "error");
      },
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    deleteUserMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast(
          "User record permanently evicted from system registry",
          "success",
        );
        setDeleteTarget(null);
      },
      onError: (err: any) => {
        toast(
          err?.message || "Failed to drop data index configuration parameters",
          "error",
        );
      },
    });
  };

  // --- Columns Configuration Architecture ---
  const columns: ColumnDef<TUserRow, any>[] = [
    {
      header: "Identity Profile",
      accessorKey: "name",
      cell: ({ row }) => {
        const completeAvatarUrl = row.original.avatar
          ? `${IMAGE_URL}/uploads/${row.original.avatar}`
          : null;
        console.log("row.original.avatar", completeAvatarUrl);
        const initials =
          row.original.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) ?? "U";

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
      header: "Access Role",
      accessorKey: "role",
      cell: ({ row }) => {
        const roleColors: Record<string, string> = {
          admin: "bg-indigo-50 text-indigo-600 border-indigo-100",
          seller: "bg-amber-50 text-amber-600 border-amber-100",
          buyer: "bg-teal-50 text-teal-600 border-teal-100",
        };
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider ${roleColors[row.original.role] || "bg-gray-50"}`}
          >
            <Shield size={10} />
            {row.original.role}
          </span>
        );
      },
    },
    {
      header: "Account State",
      accessorKey: "is_active",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-black ${row.original.is_active ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-500 border border-rose-100"}`}
          >
            {row.original.is_active ? "ACTIVE" : "BLOCKED"}
          </span>
          {row.original.is_verified && (
            <span className="bg-primary/5 text-primary text-[9px] px-1.5 py-0.5 rounded font-black border border-primary/10">
              VERIFIED
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setInspectUser(row.original)}
            className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-50 transition-colors cursor-pointer"
            title="Inspect Profile"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            onClick={() => setEditUser(row.original)}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
            title="Edit Properties"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setBlockTarget(row.original)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${row.original.is_active ? "text-slate-400 hover:text-rose-500 hover:bg-rose-50" : "text-rose-500 bg-rose-50 hover:bg-rose-100/50"}`}
            title={row.original.is_active ? "Block User" : "Unblock User"}
          >
            <Ban size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row.original)}
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Purge Record"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Structural Header Action Title Layout */}
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          User Ecosystem
        </h1>
        <p className="text-slate-400 text-sm">
          Review credentials, change authorization parameters, toggle account
          status records.
        </p>
      </div>

      {/* Advanced Filter Management Row Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus-within:border-primary/40 transition-all">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search index by account name or email profile..."
            className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 font-medium"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 outline-none focus:border-primary/40 cursor-pointer"
        >
          <option value="">All Access Roles</option>
          <option value="admin">System Administrators</option>
          <option value="seller">Vendors & Sellers</option>
          <option value="buyer">Buyers / Consumers</option>
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 outline-none focus:border-primary/40 cursor-pointer"
        >
          <option value="">Any Operation Status</option>
          <option value="active">Active Indexes Only</option>
          <option value="suspended">Blocked Only</option>
        </select>
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
          <DataTable data={userList} columns={columns} />
          {usersData?.pages > 1 && (
            <Pagination
              meta={{
                totalItems: usersData.total,
                itemCount: userList.length,
                currentPage: usersData.page,
                totalPages: usersData.pages,
                itemsPerPage: usersData.per_page,
                hasNextPage: usersData.page < usersData.pages,
                hasPreviousPage: usersData.page > 1,
              }}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* --- MODAL 1: USER DETAILS DIRECT PROFILE SHOWCASE --- */}
      <Modal
        isOpen={!!inspectUser}
        onClose={() => setInspectUser(null)}
        title="Account Profile Record Portfolio"
      >
        {inspectUser && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-xl relative overflow-hidden bg-primary/5 border border-slate-200 shrink-0">
                {inspectUser.avatar ? (
                  <Image
                    src={`${IMAGE_URL}${inspectUser.avatar}`}
                    fill
                    className="object-cover"
                    alt=""
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-black text-lg">
                    {inspectUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base leading-tight">
                  {inspectUser.name}
                </h4>
                <p className="text-xs text-slate-400 font-bold mt-1 flex items-center gap-1">
                  <Shield size={12} className="text-primary" /> Access Level
                  Role:{" "}
                  <span className="uppercase text-primary">
                    {inspectUser.role}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-white">
                <Mail size={16} className="text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block leading-none">
                    EMAIL ADDRESS
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {inspectUser.email}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-white">
                <Smartphone size={16} className="text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block leading-none">
                    PHONE NUMBER CONTACT
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {inspectUser.phone || "No contact verified"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-white">
                <Calendar size={16} className="text-slate-400" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block leading-none">
                    ONBOARDING TIMELINE
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {new Date(inspectUser.created_at).toLocaleDateString(
                      "en-PK",
                      { dateStyle: "long" },
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectUser(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-bold text-slate-500 transition-colors"
              >
                Close Profile View
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* --- MODAL 2: USER PROPERTIES UPDATE FORM --- */}
      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="Update Identity Criteria"
      >
        {editUser && (
          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                FULL NAME
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary/40 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  EMAIL ID
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary/40 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  PHONE CONTACT
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary/40 font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                AUTHORIZATION ENUM ROLE
              </label>
              <select
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value as any })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 outline-none focus:border-primary/40 cursor-pointer"
              >
                <option value="admin">
                  Administrator (Full Systems privileges)
                </option>
                <option value="seller">
                  Seller / Global Vendor distribution
                </option>
                <option value="buyer">Buyer / Client Standard Account</option>
              </select>
            </div>

            <div className="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) =>
                    setEditForm({ ...editForm, is_active: e.target.checked })
                  }
                  className="rounded text-primary focus:ring-0 w-4 h-4"
                />{" "}
                Account Active State
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editForm.is_verified}
                  onChange={(e) =>
                    setEditForm({ ...editForm, is_verified: e.target.checked })
                  }
                  className="rounded text-primary focus:ring-0 w-4 h-4"
                />{" "}
                Identity Verified Badge
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs transition-all shadow-sm"
              >
                {updateUserMutation.isPending
                  ? "Aligning Parameters..."
                  : "Save Properties"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* --- MODAL 3: TOGGLE BLOCK SECURITY RUNTIME --- */}
      <Modal
        isOpen={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        title="Modify Operation Status Layer"
        size="sm"
      >
        {blockTarget && (
          <div className="space-y-4 pt-1">
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Are you sure you want to{" "}
              {blockTarget.is_active ? "restrict" : "restore"} system entry
              access permissions for{" "}
              <span className="font-bold text-primary">{blockTarget.name}</span>
              ?
              {blockTarget.is_active
                ? " This blocks all checkouts and session authorizations until restored manually."
                : " This enables full profile marketplace interactions."}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBlockTarget(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 transition-colors"
              >
                Abort
              </button>
              <button
                type="button"
                onClick={handleToggleBlock}
                disabled={toggleBlockMutation.isPending}
                className={`flex-1 py-2.5 text-white text-xs font-bold rounded-xl transition-colors ${blockTarget.is_active ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
              >
                {toggleBlockMutation.isPending
                  ? "Processing Security Sync..."
                  : blockTarget.is_active
                    ? "Confirm Restriction"
                    : "Restore Access"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* --- MODAL 4: DELETION CONFIRMATION PORTER --- */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Permanent Record Eviction"
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4 pt-1">
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Are you absolutely sure you want to drop the user profile instance
              for{" "}
              <span className="font-bold text-primary">
                {deleteTarget.name}
              </span>
              ? This completely cleans out their authentication records. **This
              action cannot be undone.**
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 transition-colors"
              >
                Retain Record
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteUserMutation.isPending}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                {deleteUserMutation.isPending
                  ? "Evicting User..."
                  : "Confirm Purge Sequence"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
});

export default UsersPage;
