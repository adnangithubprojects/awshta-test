"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthstore";
import { useToast } from "@/components/common/toast";
import { asyncAuthLogin, asyncLoginUsers } from "@/api/user/fetchers";
import { useRouter } from "next/navigation";
import TextInput from "@/components/common/_components/textInput";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password is required"),
});

type TLoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const navigate = useRouter();
  const { toast } = useToast();

  const { control, handleSubmit } = useForm<TLoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: asyncAuthLogin,
    onSuccess: (res) => {
      console.log("login res", res);
      const user = res?.data?.user;
      const accessToken = res?.data?.access_token;
      const refreshToken = res?.data?.refresh_token;
      setAuth(user, accessToken, refreshToken);
      toast("Welcome back!", "success");
      navigate.push("/dashboard");
    },
    onError: (error: any) => {
      toast(error || "Login failed. Please try again.", "error");
    },
  });

  const onSubmit = (data: TLoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 p-10 md:p-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
            <LogIn size={32} />
          </div>
          <h2 className="text-2xl font-black text-primary tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Access your awshta dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <TextInput
            name="email"
            control={control}
            label="Email Address"
            placeholder="admin@awshta.com"
            icon={Mail}
          />

          <div>
            <TextInput
              name="password"
              control={control}
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
            />
            <button
              type="button"
              onClick={() => navigate.push("/forgot-password")}
              className="text-[11px] font-bold text-primary hover:underline mt-2 block ml-auto"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-primary hover:bg-primary/80 text-white py-4 rounded-2xl font-bold  transition-all flex items-center justify-center gap-3 mt-4 active:scale-95 shadow-xl shadow-secondary/10 disabled:opacity-50 cursor-pointer"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In to awshta"}
            {!loginMutation.isPending && <ArrowRight size={18} />}
          </button>
        </form>

        {/* <p className="text-center text-xs text-slate-400 mt-8">
          New to the platform?{" "}
          <button
            type="button"
            onClick={() => navigate.push("/register")}
            className="text-primary font-bold cursor-pointer hover:text-primary/80 transition-colors"
          >
            Create an account
          </button>
        </p> */}
      </div>
    </div>
  );
}
