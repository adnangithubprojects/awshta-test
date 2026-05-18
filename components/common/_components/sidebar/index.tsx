"use client";

import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  BookOpen,
  Settings,
  LogOut,
  X,
  RefreshCw,
  Users,
  FolderTree,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthstore";
import { BASE_URL } from "@/config/url-config";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const avatarUrl = user?.profileImage
    ? `${BASE_URL}/${user.profileImage}`
    : null;
  const logoUrl = user?.companyLogo ? `${BASE_URL}/${user.companyLogo}` : null;

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "User", icon: Users, path: "/user" },
    { name: "Category", icon: FolderTree, path: "/category" },
    { name: "Product", icon: Package, path: "/product" },
    { name: "Sales Orders", icon: ShoppingCart, path: "/orders" },
    // { name: "Shops & Clients", icon: Store, path: "/shops" },
    // { name: "Return", icon: RefreshCw, path: "/dashboard/returns" },
    { name: "Review", icon: BookOpen, path: "/review" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-100 text-white transition-transform duration-300 transform 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} 
      md:relative md:translate-x-0 flex flex-col shadow-2xl md:shadow-none h-screen shrink-0`}
    >
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="logo"
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
              P
            </div>
          )}
          <span className="text-xl text-primary font-black tracking-tight">
            {user?.companyName ?? "AWSHTA"}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden text-slate-400 cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all group
                ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-gray-700 hover:shadow-md hover:shadow-gray-300 cursor-pointer"
                }`}
            >
              <item.icon
                size={20}
                className={
                  isActive
                    ? "text-white"
                    : "text-slate-500 group-hover:text-primary"
                }
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User mini-card + logout */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center gap-3 px-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-9 h-9 rounded-xl object-cover border border-slate-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold border border-primary/20">
              {initials}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-primary truncate leading-tight">
              {user?.name}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide truncate">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Logout Session
        </button>
      </div>
    </aside>
  );
}
