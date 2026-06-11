"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Menu, Search, Bell } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthstore";
import { BASE_URL } from "@/config/url-config";
import Sidebar from "@/components/common/_components/sidebar";
import { useGetMyProfile } from "@/api/user/queries";

export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: user, isLoading } = useGetMyProfile();
  const { logout, access_token } = useAuthStore();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!access_token) {
      router.replace("/login");
      return;
    }

    if (!isLoading) {
      if (!user || user.role !== "admin") {
        console.warn(
          "Access denied: User is not an admin or profile fetch failed.",
        );
        logout();
        router.replace("/login");
      }
    }
  }, [user, isLoading, router, logout, access_token]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400 tracking-wide">
            Verifying Permissions...
          </p>
        </div>
      </div>
    );
  }

  const avatarUrl = user?.avatar ? `${BASE_URL}/uploads/${user.avatar}` : null;
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "AW";

  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] overflow-hidden font-sans select-none">
      {/* 1. Dynamic Sidebar Component Wrapper */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      {/* --- MAIN APP WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 2. Unified Header View */}
        <header className="h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 md:px-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className={`md:hidden p-2 rounded-lg bg-slate-50 text-slate-600 ${isSidebarOpen ? "hidden" : "block"} cursor-pointer`}
            >
              <Menu size={20} />
            </button>

            {/* Context Global Search Interface */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-80 group focus-within:bg-white focus-within:border-primary/40 transition-all">
              <Search
                size={16}
                className="text-slate-400 group-focus-within:text-primary shrink-0"
              />
              <input
                type="text"
                placeholder="Search orders, shops, stock..."
                className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {/* System Notifications Action */}
            <button
              type="button"
              className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-primary hover:bg-white hover:border-primary/30 transition-all cursor-pointer"
            >
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Admin Profile Routing Action */}
            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group text-left"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors">
                  {user?.name ?? "Admin User"}
                </p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">
                  {user?.companyName ?? "AWSHTA"}
                </p>
              </div>

              {avatarUrl ? (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 group-hover:border-primary/40 transition-all shadow-sm">
                  <Image
                    src={avatarUrl}
                    alt="User Avatar"
                    fill
                    className="object-cover"
                    sizes="40px"
                    priority
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shadow-sm flex items-center justify-center text-primary text-sm font-bold group-hover:bg-primary/20 transition-all">
                  {initials}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* 3. Rendered Next.js Page View Children */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
