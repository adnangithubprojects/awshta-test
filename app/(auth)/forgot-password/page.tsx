"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, Send, LifeBuoy } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/common/toast";
import TextInput from "@/components/common/_components/textInput";
import { useRouter } from "next/navigation";
import { asyncUsersForgetPassword } from "@/api/user/fetchers";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type TForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const navigate = useRouter();
  const { toast } = useToast();

  const { control, handleSubmit } = useForm<TForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const forgotMutation = useMutation({
    mutationFn: (data: TForgotPasswordForm) =>
      asyncUsersForgetPassword(data as any),
    onSuccess: () => {
      toast("Reset code sent to your email", "success");
      navigate.push("/verify-otp");
    },
    onError: (error: any) => {
      toast(error?.message || "Failed to send reset code", "error");
    },
  });

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 p-10 md:p-12 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

        <button
          type="button"
          onClick={() => navigate.push("/login")}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-secondary transition-colors mb-8 group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Login
        </button>

        <div className="mb-10">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-600 border border-amber-100">
            <LifeBuoy size={28} />
          </div>
          <h2 className="text-2xl font-black text-secondary tracking-tight">
            Recover Password
          </h2>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Don't worry, it happens. Enter your email and we'll send you a
            verification code to reset your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit((data) => forgotMutation.mutate(data))}
          className="space-y-6"
        >
          <TextInput
            name="email"
            control={control}
            label="Registered Email"
            placeholder="admin@awshta.com"
            icon={Mail}
          />

          <button
            type="submit"
            disabled={forgotMutation.isPending}
            className="w-full bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-primary transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl shadow-secondary/10 disabled:opacity-70 group cursor-pointer"
          >
            {forgotMutation.isPending ? "Sending code..." : "Send Reset Code"}
            {!forgotMutation.isPending && (
              <Send
                size={18}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-[11px] text-slate-400">
            Having trouble? Contact{" "}
            <span className="text-secondary font-bold cursor-pointer">
              awshta Support
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
