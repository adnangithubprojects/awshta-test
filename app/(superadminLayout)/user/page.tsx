"use client";
import { memo, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Search,
  User,
  MapPin,
  Shield,
  Users,
  Upload,
} from "lucide-react";
import { useToast } from "@/components/common/toast";
import {
  useGetAddresses,
  useGetAllUsers,
  useGetMyProfile,
  useGetUserById,
} from "@/api/user/queries";
import {
  asyncAddAddress,
  asyncDeleteAddress,
  asyncUpdateAvatar,
  asyncUpdatePassword,
  asyncUpdateProfile,
} from "@/api/user/fetchers";
import {
  AddressForm,
  PasswordForm,
  ProfileForm,
} from "@/components/common/_components/userComponents";
import { DataTable } from "@/components/common/table";
import Modal from "@/components/common/modal";
import { AddressRowActions } from "@/components/common/_components/userComponents/adressForm";

const UsersPage = memo(function UsersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Dashboard view toggle tab: 'profile' | 'addresses' | 'admin_users'
  const [activeTab, setActiveTab] = useState<
    "profile" | "addresses" | "admin_users"
  >("profile");

  // Modal states
  const [addressOpen, setAddressOpen] = useState(false);
  const [deleteAddress, setDeleteAddress] = useState<any | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // --- Fetch Queries ---
  const { data: profileData, isLoading: profileLoading } = useGetMyProfile();
  const { data: addressesData, isLoading: addressesLoading } =
    useGetAddresses();
  const { data: allUsersData, isLoading: usersLoading } = useGetAllUsers();

  // Fetch specific user on demand
  const { data: singleUserData } = useGetUserById(selectedUserId || "");

  // --- Core Cache Invalidation Hooks ---
  const invalidateAddresses = () =>
    queryClient.invalidateQueries({ queryKey: ["addresses"] });
  const invalidateProfile = () =>
    queryClient.invalidateQueries({ queryKey: ["me"] });

  // --- Mutations Matrix ---
  const addAddressMutation = useMutation({
    mutationFn: asyncAddAddress,
    onSuccess: () => {
      invalidateAddresses();
      setAddressOpen(false);
      toast("Address added successfully", "success");
    },
    onError: (e: any) =>
      toast(e?.message || "Error processing request", "error"),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: asyncDeleteAddress,
    onSuccess: () => {
      invalidateAddresses();
      setDeleteAddress(null);
      toast("Address deleted", "info");
    },
    onError: (e: any) => toast(e?.message || "Failed to remove entry", "error"),
  });

  const updateProfileMutation = useMutation({
    mutationFn: asyncUpdateProfile,
    onSuccess: () => {
      invalidateProfile();
      toast("Profile parameters updated", "success");
    },
    onError: (e: any) => toast(e?.message || "Update failure", "error"),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: asyncUpdatePassword,
    onSuccess: () => toast("Security keys renewed successfully", "success"),
    onError: (e: any) =>
      toast(e?.message || "Password structural mismatch", "error"),
  });

  const avatarMutation = useMutation({
    mutationFn: asyncUpdateAvatar,
    onSuccess: () => {
      invalidateProfile();
      toast("Avatar binary uploaded", "success");
    },
    onError: (e: any) =>
      toast(e?.message || "Upload pipeline interrupted", "error"),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      avatarMutation.mutate(formData);
    }
  };

  // --- Address Table Column Rules ---
  const addressColumns: ColumnDef<any, any>[] = [
    {
      header: "Label",
      accessorKey: "label",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-secondary text-sm">
            {row.original.label}
          </span>
          {row.original.is_default && (
            <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              DEFAULT
            </span>
          )}
        </div>
      ),
    },
    { header: "Street Matrix", accessorKey: "street" },
    { header: "City Location", accessorKey: "city" },
    { header: "Country Identity", accessorKey: "country" },
    {
      id: "actions",
      cell: ({ row }) => (
        <AddressRowActions address={row.original} onDelete={setDeleteAddress} />
      ),
    },
  ];

  // --- Global Users Column Rules (Admin Dashboard View) ---
  const globalUsersColumns: ColumnDef<any, any>[] = [
    {
      header: "User UID",
      accessorKey: "id",
      cell: ({ row }) => (
        <span className="text-xs font-mono text-slate-400">
          {row.original.id}
        </span>
      ),
    },
    {
      header: "Account Designation",
      accessorKey: "name",
      cell: ({ row }) => (
        <span className="font-bold text-secondary text-sm">
          {row.original.name || "Anonymous User"}
        </span>
      ),
    },
    {
      id: "inspect",
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedUserId(row.original.id)}
          className="text-xs text-primary font-bold hover:underline cursor-pointer"
        >
          Inspect Entity
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Header Block */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            Identity & Space Configuration
          </h1>
          <p className="text-slate-400 text-sm">
            Manage profile instances, global variables, and secure routing
            vectors.
          </p>
        </div>
      </div>

      {/* Segment Controllers (Tabs) */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${activeTab === "profile" ? "border-b-2 border-primary text-primary" : "text-slate-400 hover:text-slate-600"}`}
        >
          <User size={16} /> Personal Metrics
        </button>
        <button
          onClick={() => setActiveTab("addresses")}
          className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${activeTab === "addresses" ? "border-b-2 border-primary text-primary" : "text-slate-400 hover:text-slate-600"}`}
        >
          <MapPin size={16} /> Delivery Nodes
        </button>
        <button
          onClick={() => setActiveTab("admin_users")}
          className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${activeTab === "admin_users" ? "border-b-2 border-primary text-primary" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Users size={16} /> Global Accounts Registry
        </button>
      </div>

      {/* --- View Rendering Decision Matrix --- */}

      {activeTab === "profile" && !profileLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center space-y-4">
            <div className="relative group w-24 h-24 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
              {profileData?.data?.avatarUrl ? (
                <img
                  src={profileData.data.avatarUrl}
                  alt="Avatar Profile Vector"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={36} className="text-slate-300" />
              )}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload size={18} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="font-bold text-secondary">
                {profileData?.data?.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {profileData?.data?.phone || "No Linked Phone Line"}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <User size={18} className="text-primary" /> Profile Elements
              </h2>
              <ProfileForm
                defaultValues={profileData?.data}
                onSubmit={(d) => updateProfileMutation.mutate(d)}
                isPending={updateProfileMutation.isPending}
              />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <Shield size={18} className="text-amber-500" /> Authentication
                Keys
              </h2>
              <PasswordForm
                onSubmit={(d) => updatePasswordMutation.mutate(d)}
                isPending={updatePasswordMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "addresses" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setAddressOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all"
            >
              <Plus size={16} /> Append Location Node
            </button>
          </div>
          {addressesLoading ? (
            <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
          ) : (
            <DataTable
              data={addressesData?.data || []}
              columns={addressColumns}
            />
          )}
        </div>
      )}

      {activeTab === "admin_users" && (
        <div className="space-y-4">
          {usersLoading ? (
            <div className="h-32 bg-slate-50 animate-pulse rounded-2xl" />
          ) : (
            <DataTable
              data={allUsersData?.data || []}
              columns={globalUsersColumns}
            />
          )}
        </div>
      )}

      {/* --- Modals Portal Stack --- */}

      {/* Create Address Modal */}
      <Modal
        isOpen={addressOpen}
        onClose={() => setAddressOpen(false)}
        title="New Node Creation"
        description="Append a new spatial tracking marker onto your identity profile."
      >
        <AddressForm
          onSubmit={(d) => addAddressMutation.mutate(d)}
          isPending={addAddressMutation.isPending}
        />
      </Modal>

      {/* Delete Address Modal */}
      <Modal
        isOpen={!!deleteAddress}
        onClose={() => setDeleteAddress(null)}
        title="Deconstruct Location Node"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Confirm purge sequence for label block:{" "}
            <span className="font-bold text-secondary">
              {deleteAddress?.label}
            </span>
            ?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteAddress(null)}
              className="flex-1 py-3 border rounded-xl font-bold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteAddressMutation.mutate(deleteAddress.id)}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm"
            >
              Purge
            </button>
          </div>
        </div>
      </Modal>

      {/* Admin Inspector Node Modal */}
      <Modal
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        title="System Metadata Diagnostics"
      >
        {singleUserData ? (
          <pre className="p-4 bg-slate-900 text-emerald-400 text-xs font-mono rounded-xl overflow-auto max-h-64">
            {JSON.stringify(singleUserData.data, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-slate-400 animate-pulse">
            Running systemic read cycle...
          </p>
        )}
      </Modal>
    </div>
  );
});

export default UsersPage;
