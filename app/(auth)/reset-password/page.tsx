"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldAlert, Lock, Save, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/common/toast";
import { asyncResetUserPassword } from "@/api/user/fetchers";

const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

type TResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const navigate = useRouter();
  const { toast } = useToast();

  const { control, handleSubmit } = useForm<TResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const resetMutation = useMutation({
    mutationFn: (data: TResetForm) => asyncResetUserPassword(data.password),
    onSuccess: () => {
      toast("Password updated successfully! Please log in.", "success");
      navigate.push("/login");
    },
    onError: (error: any) => {
      toast(error?.message || "Failed to reset password", "error");
    },
  });

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 p-12">
        <button
          type="button"
          onClick={() => navigate.push("/verify-otp")}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-secondary transition-colors mb-8 group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back
        </button>

        <div className="mb-8">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 text-amber-600">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-2xl font-black text-secondary tracking-tight">
            New Password
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Ensure your new password is secure and unique.
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={handleSubmit((data) => resetMutation.mutate(data))}
        >
          <TextInput
            name="password"
            control={control}
            label="New Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
          />
          <TextInput
            name="confirmPassword"
            control={control}
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
          />

          <button
            type="submit"
            disabled={resetMutation.isPending}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 disabled:opacity-60 cursor-pointer"
          >
            {resetMutation.isPending ? "Updating..." : "Update Password"}
            {!resetMutation.isPending && <Save size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
