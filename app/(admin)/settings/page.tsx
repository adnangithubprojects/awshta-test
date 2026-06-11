"use client";

import { memo, useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Smartphone,
  Lock,
  Camera,
  ShieldCheck,
  RefreshCw,
  Save,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/components/common/toast";
import Image from "next/image";
import { IMAGE_URL } from "@/config/url-config";
import {
  asyncGetMyProfile,
  asyncUpdateAvatar,
  asyncUpdatePassword,
  asyncUpdateProfile,
} from "@/api/user/fetchers";

const SettingsPage = memo(function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Form States ---
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // --- 1. Get Core Profile Profile Data ---
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["MY_PROFILE"],
    queryFn: asyncGetMyProfile,
  });

  // Safe runtime normalization helper
  const profile = profileData?.data || profileData || null;

  // Sync state when profile payload downloads from backend
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  // --- 2. Direct Mutation Pipeline Hooks ---

  const updateProfileMutation = useMutation({
    mutationFn: asyncUpdateProfile,
    onSuccess: () => {
      toast("Profile details updated successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["MY_PROFILE"] });
    },
    onError: (error: any) => {
      toast(error || error || "Failed to update text profile fields.", "error");
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: asyncUpdateAvatar,
    onSuccess: () => {
      toast("Avatar picture uploaded successfully", "success");
      setAvatarPreview(null);
      queryClient.invalidateQueries({ queryKey: ["MY_PROFILE"] });
    },
    onError: (error: any) => {
      toast(error || error || "Failed to route image transfer file.", "error");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: asyncUpdatePassword,
    onSuccess: () => {
      toast("Security credential updated successfully", "success");
      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    },
    onError: (error: any) => {
      toast(
        error || error || "Failed to verify update credential schema.",
        "error",
      );
    },
  });

  // --- 3. Event Handlers ---

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim())
      return toast("Name field cannot be left blank", "error");
    updateProfileMutation.mutate(profileForm);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast(
        "Image target cannot exceed a maximum capacity boundary of 2MB",
        "error",
      );
    }

    // Set local binary preview string
    setAvatarPreview(URL.createObjectURL(file));

    // Package to native multipart Form payload stream
    const formData = new FormData();
    formData.append("file", file);

    updateAvatarMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return toast(
        "Validation mismatch: confirmation input parameters do not sync",
        "error",
      );
    }
    if (passwordForm.new_password.length < 6) {
      return toast(
        "Security compliance error: password length index must be >= 6 parameters",
        "error",
      );
    }

    updatePasswordMutation.mutate({
      old_password: passwordForm.old_password || undefined,
      new_password: passwordForm.new_password,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-100 rounded-2xl md:col-span-2" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const liveAvatarUrl =
    avatarPreview ||
    (profile?.avatar ? `${IMAGE_URL}/uploads/${profile.avatar}` : null);
  const userInitials =
    profile?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <div className="max-w-4xl space-y-8">
      {/* Structural Action Branding Block Header */}
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Account Parameters & Configuration
        </h1>
        <p className="text-slate-400 text-sm">
          Configure security credentials, amend system metadata identifiers, and
          update avatar assets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: PRIMARY PROFILE INFORMATION CARD */}
        <div className="lg:col-span-2 space-y-6">
          {/* PROFILE FORM COMPONENT BLOCK */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-primary uppercase tracking-wider mb-5 flex items-center gap-2">
              <User size={16} className="text-slate-400" /> Identity Matrix
              Indices
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">
                    FULL LEGAL NAME
                  </label>
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-primary/40 transition-colors">
                    <User size={15} className="text-slate-400" />
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      placeholder="Enter legal profile text name indices..."
                      className="w-full bg-transparent outline-none text-xs text-slate-700 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">
                    VERIFIED CONTACT NUMBER
                  </label>
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-primary/40 transition-colors">
                    <Smartphone size={15} className="text-slate-400" />
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder="e.g. 03331234567"
                      className="w-full bg-transparent outline-none text-xs text-slate-700 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 select-none">
                  EMAIL ACCOUNT (IMMUTABLE GLOBAL ROUTE)
                </label>
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl cursor-not-allowed">
                  <Mail size={15} className="text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="w-full bg-transparent outline-none text-xs text-slate-400 font-bold select-none cursor-not-allowed"
                  />
                  <ShieldCheck
                    size={14}
                    className="text-emerald-500 shrink-0"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {updateProfileMutation.isPending ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  {updateProfileMutation.isPending
                    ? "Syncing Identity Registers..."
                    : "Save Identity Records"}
                </button>
              </div>
            </form>
          </div>

          {/* PASSWORD RETARGETING FORM CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-primary uppercase tracking-wider mb-5 flex items-center gap-2">
              <Lock size={16} className="text-slate-400" /> Security Token
              Re-Verification
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  CURRENT ACCESS CREDEENTIAL KEY
                </label>
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-primary/40 transition-colors">
                  <Lock size={15} className="text-slate-400" />
                  <input
                    type="password"
                    value={passwordForm.old_password}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        old_password: e.target.value,
                      })
                    }
                    placeholder="Provide active operational password key..."
                    className="w-full bg-transparent outline-none text-xs text-slate-700 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">
                    NEW ENCRYPTED ACCESS KEY
                  </label>
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-primary/40 transition-colors">
                    <Lock size={15} className="text-slate-400" />
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password: e.target.value,
                        })
                      }
                      placeholder="Minimum 6 characters secure matrix..."
                      className="w-full bg-transparent outline-none text-xs text-slate-700 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">
                    CONFIRM NEW ENCRYPTED ACCESS KEY
                  </label>
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-primary/40 transition-colors">
                    <Lock size={15} className="text-slate-400" />
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirm_password: e.target.value,
                        })
                      }
                      placeholder="Repeat exact parameter array..."
                      className="w-full bg-transparent outline-none text-xs text-slate-700 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {updatePasswordMutation.isPending ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <CheckCircle size={13} />
                  )}
                  {updatePasswordMutation.isPending
                    ? "Validating Cryptography..."
                    : "Execute Token Reset"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: INDEPENDENT AVATAR OPERATIONAL INTERFACE CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
          <h3 className="text-sm font-black text-primary uppercase tracking-wider mb-6 self-start flex items-center gap-2">
            <Camera size={16} className="text-slate-400" /> Media Layer Asset
          </h3>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          <div className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden mb-4 group">
            {liveAvatarUrl ? (
              <Image
                src={liveAvatarUrl}
                fill
                sizes="112px"
                alt="Account Identity Avatar"
                className="object-cover group-hover:opacity-70 transition-opacity"
              />
            ) : (
              <div className="text-primary font-black text-xl tracking-tight select-none">
                {userInitials}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={updateAvatarMutation.isPending}
              className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold gap-1"
            >
              <Camera size={16} />
              Swap Resource
            </button>
          </div>

          <p className="text-xs font-bold text-slate-700 leading-tight mb-1">
            {profile?.name}
          </p>
          <span className="bg-primary/5 border border-primary/10 text-primary text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mb-4">
            {profile?.role || "USER SYSTEM OPERATOR"}
          </span>

          <p className="text-[10px] text-slate-400 font-medium max-w-[180px] leading-relaxed mb-4">
            Supports JPEG, PNG or WEBP binary assets. Payload constraint: max
            2MB spatial layout size.
          </p>

          <button
            type="button"
            disabled={updateAvatarMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 border border-slate-200 hover:border-primary/30 text-slate-600 hover:text-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer bg-white"
          >
            {updateAvatarMutation.isPending ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Uploading Byte Channels...</span>
              </>
            ) : (
              <>
                <Camera size={13} />
                <span>Select Brand Image File</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default SettingsPage;
