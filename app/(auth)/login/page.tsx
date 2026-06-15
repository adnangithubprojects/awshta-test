"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthstore";
import { useToast } from "@/components/common/toast";
import { asyncAuthLogin } from "@/api/user/fetchers";
import { useRouter, useSearchParams } from "next/navigation";
import TextInput from "@/components/common/_components/textInput";
import { Suspense, useEffect } from "react";
import { useGetMyProfile } from "@/api/user/queries"; // Integrated profile query hook

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password is required"),
});

type TLoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const { setAuth, access_token } = useAuthStore();
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // 1. Fetch profile automatically only when access_token becomes available
  const { data: user, isLoading: isProfileLoading } = useGetMyProfile({
    enabled: !!access_token,
  });

  const { control, handleSubmit } = useForm<TLoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: asyncAuthLogin,
    onSuccess: (res) => {
      // Triggers access_token updates which wakes up useGetMyProfile
      setAuth(res.data);
    },
    onError: (error: string) => {
      toast(error || "Login failed. Please try again.", "error");
    },
  });

  const onSubmit = (data: TLoginForm) => {
    loginMutation.mutate(data);
  };

  // 2. Centralized router logic watching for incoming tokens or active user states
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setAuth({ access_token: tokenFromUrl });
      // return;
    }

    if (access_token && !isProfileLoading && user) {
      toast("Welcome back!", "success");
      // Conditional Routing Strategy
      if (user.role === "seller") {
        navigate.replace("/seller");
      } else if (user.role === "admin") {
        navigate.replace("/dashboard");
      } else {
        // Fallback or generic role fallback route
        navigate.replace("/dashboard");
      }
    }
  }, [
    access_token,
    user,
    isProfileLoading,
    navigate,
    searchParams,
    setAuth,
    toast,
  ]);

  // Combined permission verification flag
  const isAuthenticating =
    loginMutation.isPending || (access_token && isProfileLoading);

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
            disabled={isAuthenticating}
          />

          <div>
            <TextInput
              name="password"
              control={control}
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              disabled={isAuthenticating}
            />
            <button
              type="button"
              disabled={isAuthenticating}
              onClick={() => navigate.push("/forgot-password")}
              className="text-[11px] font-bold text-primary hover:underline mt-2 block ml-auto disabled:opacity-40"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating!}
            className="w-full bg-primary hover:bg-primary/80 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 mt-4 active:scale-95 shadow-xl shadow-secondary/10 disabled:opacity-50 cursor-pointer"
          >
            {loginMutation.isPending
              ? "Signing in..."
              : access_token && isProfileLoading
                ? "Verifying Workspace Permissions..."
                : "Sign In to awshta"}
            {!isAuthenticating && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <LoginPage />
    </Suspense>
  );
}
