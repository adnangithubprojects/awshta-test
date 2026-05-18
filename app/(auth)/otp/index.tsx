"use client";

import { useState, useRef } from "react";
import { ShieldCheck, RefreshCcw, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  asyncUsersForgetPassword,
  asyncUsersOtpVerification,
} from "@/api/user/fetchers";
import { useToast } from "@/components/common/toast";
import { useRouter } from "next/navigation";

export default function OtpPage() {
  const navigate = useRouter();
  const { toast } = useToast();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const email = localStorage.getItem("email") || "";
  // Using refs instead of document.getElementById for cleaner React code
  const inputRefs = useRef<any[]>([]);

  const verifyMutation = useMutation({
    mutationFn: (otpValue: string) =>
      asyncUsersOtpVerification({
        otp: otpValue,
        email,
      }),
    onSuccess: () => {
      toast("Identity verified!", "success");
      navigate.push("/reset-password");
    },
    onError: (error: any) => {
      toast(error?.message || "Invalid OTP. Please try again.", "error");
      setOtp(["", "", "", "", "", ""]); // Clear all 6
      inputRefs.current[0]?.focus();
    },
  });

  const resendMutation = useMutation({
    mutationFn: () =>
      asyncUsersForgetPassword({
        email: localStorage.getItem("email") || "",
      } as any),
    onSuccess: () => toast("A new code has been sent", "info"),
    onError: () => toast("Failed to resend code", "error"),
  });

  const handleChange = (value: string, index: number) => {
    const char = value.slice(-1);
    if (!/^\d*$/.test(char)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Move focus forward
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every((d) => d !== "")) {
      verifyMutation.mutate(newOtp.join(""));
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle Ctrl+V (Paste)
  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(data)) return;

    const newOtp = data
      .split("")
      .concat(Array(6 - data.length).fill(""))
      .slice(0, 6);
    setOtp(newOtp);

    // Focus last filled or next empty
    const nextIndex = data.length < 6 ? data.length : 5;
    inputRefs.current[nextIndex]?.focus();

    if (data.length === 6) verifyMutation.mutate(data);
  };

  const isOtpComplete = otp.every((d) => d !== "");

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 p-8 md:p-12 text-center">
        <button
          type="button"
          onClick={() => navigate.push("/forgot-password")}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-secondary transition-colors mb-8 group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back
        </button>

        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-black text-secondary tracking-tight">
          Verify Identity
        </h2>
        <p className="text-slate-500 text-sm mt-2 mb-8">
          We sent a <span className="text-primary font-bold">6-digit</span> code
          to{" "}
          <span className="font-semibold text-secondary break-all">
            {localStorage.getItem("email") || "your email"}
          </span>
        </p>

        <div className="flex justify-center gap-2 sm:gap-3 mb-10">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              value={digit}
              onPaste={handlePaste}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              maxLength={1}
              disabled={verifyMutation.isPending}
              className="w-10 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 border-slate-100 bg-slate-50 rounded-xl sm:rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all disabled:opacity-50"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => verifyMutation.mutate(otp.join(""))}
          disabled={!isOtpComplete || verifyMutation.isPending}
          className="w-full bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-primary transition-all mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {verifyMutation.isPending ? "Verifying..." : "Verify & Continue"}
        </button>

        <button
          type="button"
          onClick={() => resendMutation.mutate()}
          disabled={resendMutation.isPending}
          className="flex items-center justify-center gap-2 mx-auto text-xs font-bold text-slate-400 hover:text-secondary transition-colors disabled:opacity-50"
        >
          <RefreshCcw
            size={14}
            className={resendMutation.isPending ? "animate-spin" : ""}
          />
          {resendMutation.isPending ? "Resending..." : "Resend Code"}
        </button>
      </div>
    </div>
  );
}
