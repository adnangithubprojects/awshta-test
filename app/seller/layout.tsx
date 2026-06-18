"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Menu, Search, Bell } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthstore";
import { BASE_URL } from "@/config/url-config";
import Sidebar from "@/components/common/_components/sidebar";
import { useGetMyProfile } from "@/api/user/queries";

function SellerLayoutInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setAuth, logout, access_token } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // 1. Ingest cross-domain URL token parameter immediately if present
  const urlToken = searchParams.get("token");

  useEffect(() => {
    if (urlToken) {
      setAuth({ access_token: urlToken });
      // Clear query params completely so token isn't sitting raw in address bar
      router.replace(window.location.pathname);
    }
  }, [urlToken, setAuth, router]);

  // 2. Fetch profile metrics (Only runs automatically if access_token is set)
  const { data: user, isLoading } = useGetMyProfile({
    enabled: !!access_token || !!urlToken,
  });

  // 3. Security Role and Session Verification Loop
  useEffect(() => {
    // If we aren't extracting a urlToken and no local token exists, bounce to login
    if (!access_token && !urlToken) {
      router.replace("/login");
      return;
    }

    if (!isLoading && !urlToken) {
      if (!user || user.role !== "seller") {
        console.warn(
          "Access denied: User is not a verified seller or session has dropped.",
        );
        logout();
        router.replace("/login");
      }
    }
  }, [user, isLoading, router, logout, access_token, urlToken]);

  // Loading skeleton layout guard
  if (isLoading || urlToken || !user || user.role !== "seller") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400 tracking-wide">
            Verifying Merchant Permissions...
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
      .slice(0, 2) ?? "SL";

  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] overflow-hidden font-sans select-none">
      {/* Dynamic Sidebar Component Wrapper */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      {/* --- MAIN APP WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Unified Header View */}
        <header className="h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 md:px-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className={`md:hidden p-2 rounded-lg bg-slate-50 text-slate-600 ${isSidebarOpen ? "hidden" : "block"} cursor-pointer`}
            >
              <Menu size={20} />
            </button>

            {/* Context Merchant Store Search Interface */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-80 group focus-within:bg-white focus-within:border-primary/40 transition-all">
              <Search
                size={16}
                className="text-slate-400 group-focus-within:text-primary shrink-0"
              />
              <input
                type="text"
                placeholder="Search store inventory, orders, SKUs..."
                className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Store Notifications Action */}
            <button
              type="button"
              className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-primary hover:bg-white hover:border-primary/30 transition-all cursor-pointer"
            >
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Merchant Shop Profile Action */}
            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group text-left"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors">
                  {user?.name ?? "Store Partner"}
                </p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">
                  {user?.companyName ?? "Merchant Center"}
                </p>
              </div>

              {avatarUrl ? (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 group-hover:border-primary/40 transition-all shadow-sm">
                  <Image
                    src={avatarUrl}
                    alt="Store Avatar"
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

        {/* Rendered Next.js Page View Children */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

// useSearchParams() requires a Suspense boundary under `output: export` (all pages
// are prerendered). Wrapping the layout body here satisfies the CSR-bailout requirement.
export default function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-400 tracking-wide">
              Verifying Merchant Permissions...
            </p>
          </div>
        </div>
      }
    >
      <SellerLayoutInner>{children}</SellerLayoutInner>
    </Suspense>
  );
}
