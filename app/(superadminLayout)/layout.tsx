"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthstore";
import { BASE_URL } from "@/config/url-config";
import Sidebar from "@/components/common/_components/sidebar";

export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  const avatarUrl = user?.profileImage
    ? `${BASE_URL}/${user.profileImage}`
    : null;
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] overflow-hidden font-sans select-none">
      {/* 1. Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      {/* --- MAIN APP WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 2. Unified Header */}
        <header className="h-20 bg-gray-100 border-b border-slate-200 flex items-center justify-between px-6 md:px-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`md:hidden p-2 rounded-lg bg-slate-50 text-slate-600 ${isSidebarOpen ? "hidden" : "block"} cursor-pointer`}
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl w-80 group focus-within:border-primary/40 transition-all">
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
            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/30 transition-all cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-100" />
            </button>

            {/* Profile trigger */}
            <button
              onClick={() => router.push("/dashboard/settings")}
              className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-primary leading-tight group-hover:text-primary/90 transition-colors">
                  {user?.name ?? "User"}
                </p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                  {user?.companyName ?? ""}
                </p>
              </div>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md group-hover:border-primary/30 transition-all"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-white shadow-md flex items-center justify-center text-primary text-sm font-bold group-hover:border-primary/30 transition-all">
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
