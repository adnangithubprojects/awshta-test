"use client";

import { memo } from "react";
import {
  Briefcase,
  Mail,
  Lock,
  Phone,
  User,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/useAuthstore";
import { useToast } from "@/components/common/toast";
import { useRouter } from "next/navigation";
import { asyncRegisterUser } from "@/api/user/fetchers";
import TextInput from "@/components/common/_components/textInput";
import ImageFile from "@/components/common/_components/imageFileInput";

const registerSchema = z
  .object({
    name: z.string().min(3, "Full name must be at least 3 characters"),
    companyName: z.string().min(2, "Company name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    logo: z.any().optional(),
    profileImage: z.any().optional(),
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

type TRegisterForm = z.infer<typeof registerSchema>;

const RegisterCompany = memo(function RegisterCompany() {
  const { setAuth } = useAuthStore();
  const navigate = useRouter();
  const { toast } = useToast();

  const { handleSubmit, control } = useForm<TRegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      companyName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      logo: null,
      profileImage: null,
    },
  });
  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return fallback;
  };

  const registerUserMutation = useMutation({
    mutationFn: asyncRegisterUser,
    onSuccess: (res) => {
      const payload = res?.data?.data || res?.data;
      setAuth(payload?.user, payload?.access_token, payload?.refresh_token);
      toast("Registration successful! ", "success");
      navigate.push("/dashboard");
    },
    onError: (error) => {
      toast(getErrorMessage(error, "Registration failed. Please try again."), "error");
    },
  });

  const onSubmit = (data: TRegisterForm) => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("companyName", data.companyName);
    formData.append("email", data.email);
    formData.append("phone", data.phone || "");
    formData.append("password", data.password);

    if (data.logo) formData.append("companyLogo", data.logo);
    if (data.profileImage) formData.append("profileImage", data.profileImage);

    registerUserMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] flex flex-col items-center py-12 px-4 overflow-y-auto select-none">
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col md:flex-row my-auto overflow-hidden">
        <div className="flex-1 p-8 md:p-14">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-primary text-[10px] font-bold uppercase tracking-widest mb-4 border border-emerald-100">
              awshta Hub Setup
            </div>
            <h2 className="text-3xl font-black text-primary tracking-tight">
              Create Admin Profile
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              Establish your awshta and administrator credentials.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
          >
            <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-primary/40 transition-colors group">
                <Controller
                  name="profileImage"
                  control={control}
                  render={({ field }) => (
                    <ImageFile
                      onChange={(file: File) => field.onChange(file)}
                      value={field.value}
                    />
                  )}
                />
                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} /> Admin Photo
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-primary/40 transition-colors group">
                <Controller
                  name="logo"
                  control={control}
                  render={({ field }) => (
                    <ImageFile
                      onChange={(file: File) => field.onChange(file)}
                      value={field.value}
                    />
                  )}
                />
                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={12} /> awshta Logo
                </p>
              </div>
            </div>

            <TextInput
              name="name"
              control={control}
              label="Admin Name"
              placeholder="e.g. Mudassir Shah"
              icon={User}
            />
            <TextInput
              name="companyName"
              control={control}
              label="awshta Name"
              placeholder="e.g. LifeCare Pharma"
              icon={Briefcase}
            />
            <TextInput
              name="email"
              control={control}
              label="Email Address"
              type="email"
              placeholder="admin@awshta.com"
              icon={Mail}
            />
            <TextInput
              name="phone"
              control={control}
              label="Phone Number"
              placeholder="+92 300 0000000"
              icon={Phone}
            />
            <TextInput
              name="password"
              control={control}
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
            />
            <TextInput
              name="confirmPassword"
              control={control}
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={ShieldCheck}
            />

            <div className="col-span-full pt-6">
              <button
                type="submit"
                disabled={registerUserMutation.isPending}
                className="w-full bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-primary transition-all shadow-xl shadow-secondary/10 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 cursor-pointer group"
              >
                {registerUserMutation.isPending
                  ? "Syncing..."
                  : "Register & Launch"}
                {!registerUserMutation.isPending && (
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>
            </div>
            <div className="col-span-full pt-2 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate.push("/login")}
                  className="text-primary font-semibold hover:text-primary/80 transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export default RegisterCompany;
