"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Menu, Search, Bell } from "lucide-react";

import Sidebar from "@/components/common/_components/sidebar";
import { useAuthStore } from "@/stores/useAuthstore";
import { useGetMyProfile } from "@/api/user/queries";
import { BASE_URL } from "@/config/url-config";

function SellerShellClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { setAuth, logout, access_token } = useAuthStore();

  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const urlToken = searchParams.get("token");

  useEffect(() => {
    if (urlToken) {
      setAuth({ access_token: urlToken });
      router.replace(window.location.pathname);
    }
  }, [urlToken, setAuth, router]);

  const { data: user, isLoading } = useGetMyProfile({
    enabled: !!access_token || !!urlToken,
  });

  useEffect(() => {
    if (!access_token && !urlToken) {
      router.replace("/login");
      return;
    }

    if (!isLoading && !urlToken) {
      if (!user || user.role !== "seller") {
        logout();
        router.replace("/login");
      }
    }
  }, [user, isLoading, access_token, urlToken, router, logout]);

  if (isLoading || !user || user.role !== "seller") {
    return (
      <div className="h-screen flex items-center justify-center">
        Verifying seller session...
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
    <div className="flex h-screen w-screen bg-[#F8FAFC]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-white border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Menu onClick={() => setSidebarOpen(true)} />

            <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
              <Search size={16} />
              <input placeholder="Search..." />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Bell />

            <button onClick={() => router.push("/settings")}>
              {avatarUrl ? (
                <Image src={avatarUrl} alt="avatar" width={40} height={40} />
              ) : (
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                  {initials}
                </div>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default function SellerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <SellerShellClient>{children}</SellerShellClient>
    </Suspense>
  );
}
