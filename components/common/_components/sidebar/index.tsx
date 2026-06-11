// "use client";

// import {
//   LayoutDashboard,
//   Store,
//   Package,
//   ShoppingCart,
//   BookOpen,
//   Settings,
//   LogOut,
//   X,
//   RefreshCw,
//   Users,
//   FolderTree,
//   Layers,
//   CreditCard,
//   Ticket,
// } from "lucide-react";
// import { useRouter, usePathname } from "next/navigation";
// import Link from "next/link";
// import { useAuthStore } from "@/stores/useAuthstore";
// import { BASE_URL } from "@/config/url-config";

// interface SidebarProps {
//   isOpen: boolean;
//   setIsOpen: (open: boolean) => void;
// }

// export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
//   const { user, clearAuth } = useAuthStore();
//   const router = useRouter();
//   const pathname = usePathname();

//   const avatarUrl = user?.profileImage
//     ? `${BASE_URL}/${user.profileImage}`
//     : null;
//   const logoUrl = user?.companyLogo ? `${BASE_URL}/${user.companyLogo}` : null;

//   const initials =
//     user?.name
//       ?.split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2) ?? "U";

//   const menuItems = [
//     { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
//     { name: "Vendors (Sellers)", icon: Store, path: "/vendors" },
//     { name: "Customers", icon: Users, path: "/customers" },
//     { name: "Categories", icon: FolderTree, path: "/category" },
//     { name: "Brands", icon: Layers, path: "/brands" },
//     { name: "Products Approval", icon: Package, path: "/product" },
//     { name: "Sales Orders", icon: ShoppingCart, path: "/orders" },
//     { name: "Payouts & Escrow", icon: CreditCard, path: "/payouts" },
//     { name: "Coupons & Offers", icon: Ticket, path: "/coupons" },
//     { name: "Reviews & Ratings", icon: BookOpen, path: "/review" },
//     { name: "System Settings", icon: Settings, path: "/settings" },
//   ];

//   const logout = () => {
//     clearAuth();
//     router.push("/login");
//   };

//   return (
//     <aside
//       className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-100 text-white transition-transform duration-300 transform
//       ${isOpen ? "translate-x-0" : "-translate-x-full"}
//       md:relative md:translate-x-0 flex flex-col shadow-2xl md:shadow-none h-screen shrink-0`}
//     >
//       {/* Logo */}
//       <div className="p-6 flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           {logoUrl ? (
//             <img
//               src={logoUrl}
//               alt="logo"
//               className="w-8 h-8 rounded-lg object-cover"
//             />
//           ) : (
//             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
//               P
//             </div>
//           )}
//           <span className="text-xl text-primary font-black tracking-tight">
//             {user?.companyName ?? "AWSHTA"}
//           </span>
//         </div>
//         <button
//           onClick={() => setIsOpen(false)}
//           className="md:hidden text-slate-400 cursor-pointer"
//         >
//           <X size={20} />
//         </button>
//       </div>

//       {/* Nav Links */}
//       <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
//         {menuItems.map((item) => {
//           const isActive = pathname === item.path;
//           return (
//             <Link
//               key={item.name}
//               href={item.path}
//               className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all group
//                 ${
//                   isActive
//                     ? "bg-primary text-white shadow-lg shadow-primary/20"
//                     : "text-slate-400 hover:bg-white/5 hover:text-gray-700 hover:shadow-md hover:shadow-gray-300 cursor-pointer"
//                 }`}
//             >
//               <item.icon
//                 size={20}
//                 className={
//                   isActive
//                     ? "text-white"
//                     : "text-slate-500 group-hover:text-primary"
//                 }
//               />
//               {item.name}
//             </Link>
//           );
//         })}
//       </nav>

//       {/* User mini-card + logout */}
//       <div className="p-4 border-t border-slate-200 space-y-3">
//         <div className="flex items-center gap-3 px-2">
//           {avatarUrl ? (
//             <img
//               src={avatarUrl}
//               alt="avatar"
//               className="w-9 h-9 rounded-xl object-cover border border-slate-200"
//             />
//           ) : (
//             <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold border border-primary/20">
//               {initials}
//             </div>
//           )}
//           <div className="overflow-hidden">
//             <p className="text-sm font-bold text-primary truncate leading-tight">
//               {user?.name}
//             </p>
//             <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide truncate">
//               {user?.role?.replace("_", " ")}
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={logout}
//           className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
//         >
//           <LogOut size={18} />
//           Logout Session
//         </button>
//       </div>
//     </aside>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  X,
  Users,
  ChevronDown,
  Percent,
  Star,
  CreditCard,
  Mail,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthstore";
import { BASE_URL } from "@/config/url-config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../toast";
import { useGetMyProfile } from "@/api/user/queries";
import { asyncLogoutUser } from "@/api/user/fetchers";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface SubMenuItem {
  name: string;
  path: string;
}

interface MenuItem {
  name: string;
  icon: any;
  path?: string;
  subMenu?: SubMenuItem[];
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { logout, refresh_token } = useAuthStore();
  const { data: user } = useGetMyProfile();
  const router = useRouter();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  // Comprehensive menu structural map based on Awshta Swagger Docs
  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "User Management",
      icon: Users,
      subMenu: [
        { name: "Administrators", path: "/user" },
        { name: "Vendors & Sellers", path: "/user/sellers" },
        { name: "Customers", path: "/user/customers" },
      ],
    },
    {
      name: "Product Catalog",
      icon: Package,
      subMenu: [
        { name: "All Products", path: "/product" },
        { name: "Categories", path: "/category" },
        { name: "Attributes & Options", path: "/product/attributes" },
        { name: "Brands", path: "/product/brands" },
      ],
    },
    {
      name: "Sales & Logistics",
      icon: ShoppingCart,
      subMenu: [
        { name: "All Orders", path: "/orders" },
        { name: "Return Orders", path: "/orders/returns" },
        { name: "Transactions & Escrow", path: "/orders/transactions" },
      ],
    },
    {
      name: "Financials",
      icon: CreditCard,
      subMenu: [
        { name: "Vendor Payouts", path: "/payments/payouts" },
        { name: "Payment Gateways", path: "/payments/methods" },
      ],
    },
    {
      name: "Marketing & Promo",
      icon: Percent,
      subMenu: [
        { name: "Flash Sales", path: "/marketing/flash-sales" },
        { name: "Coupons & Offers", path: "/marketing/coupons" },
        { name: "Hero Sliders & Banners", path: "/marketing/sliders" },
      ],
    },
    {
      name: "Customer Reviews",
      icon: Star,
      path: "/review",
    },
    {
      name: "Contact Messages",
      icon: Mail,
      path: "/contacts",
    },
    {
      name: "System Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  // Auto-expand parent menu when matching a sub-menu child route
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subMenu) {
        const hasActiveChild = item.subMenu.some(
          (sub) => pathname === sub.path,
        );
        if (hasActiveChild) {
          setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleSubMenu = (menuName: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };
  const queryClient = useQueryClient();
  const { mutate: performLogout, isPending: isLoggingOut } = useMutation({
    mutationFn: asyncLogoutUser,
    onSuccess: () => {
      logout();
      queryClient.clear();
      router.replace("/login");
      toast("Logged out successfully");
    },
    onError: () => {
      logout();
      queryClient.clear();
      router.replace("/login");
      toast("Logged out successfully");
    },
  });

  const userLogout = () => {
    performLogout(refresh_token!);
  };

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
      .slice(0, 2) ?? "AW";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-68 bg-gray-50 text-slate-800 transition-transform duration-300 transform
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      md:relative md:translate-x-0 flex flex-col shadow-xl md:shadow-none h-screen shrink-0 border-r border-slate-200/80`}
    >
      {/* Logo & Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200">
              <Image
                src={logoUrl}
                alt="Company Logo"
                fill
                className="object-cover"
                sizes="36px"
                priority
              />
            </div>
          ) : (
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center font-black text-white shadow-md shadow-primary/20">
              A
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-md font-bold tracking-tight text-slate-900 leading-tight">
              {user?.companyName ?? "AWSHTA"}
            </span>
            <span className="text-[10px] text-primary font-bold tracking-wider uppercase mt-0.5">
              Control Panel
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Links Layer */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const hasSubMenu = !!item.subMenu;
          const isMenuOpen = !!openMenus[item.name];
          const isDirectActive = item.path ? pathname === item.path : false;
          const isParentActive =
            hasSubMenu && item.subMenu!.some((sub) => pathname === sub.path);

          return (
            <div key={item.name} className="space-y-0.5">
              {hasSubMenu ? (
                // Dropdown Trigger Action Button
                <button
                  type="button"
                  onClick={() => toggleSubMenu(item.name)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group
                    ${
                      isParentActive
                        ? "bg-primary/5 text-primary"
                        : "text-slate-500 hover:bg-slate-200/60 hover:text-slate-800"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={18}
                      className={`transition-colors ${isParentActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"}`}
                    />
                    <span>{item.name}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className={
                      isParentActive
                        ? "text-primary"
                        : "text-slate-400 group-hover:text-slate-600"
                    }
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </button>
              ) : (
                // Standalone Direct App Router Link Link
                <Link
                  href={item.path!}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group
                    ${
                      isDirectActive
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-slate-500 hover:bg-slate-200/60 hover:text-slate-800"
                    }`}
                >
                  <item.icon
                    size={18}
                    className={
                      isDirectActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-slate-600"
                    }
                  />
                  <span>{item.name}</span>
                </Link>
              )}

              {/* Sub-menu Collapsible Container */}
              {hasSubMenu && (
                <AnimatePresence initial={false}>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden pl-4 pr-1"
                    >
                      <div className="mt-0.5 pl-4 border-l border-slate-200 space-y-0.5 py-1">
                        {item.subMenu!.map((sub) => {
                          const isSubActive = pathname === sub.path;
                          return (
                            <Link
                              key={sub.name}
                              href={sub.path}
                              className={`flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-100
                                ${
                                  isSubActive
                                    ? "text-primary bg-primary/5 font-bold"
                                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/40"
                                }`}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Session Footer Block */}
      <div className="p-4 border-t border-slate-200/80 bg-white space-y-3">
        <div className="flex items-center gap-3 px-1">
          {avatarUrl ? (
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200">
              <Image
                src={avatarUrl}
                alt="User Profile"
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold border border-primary/20">
              {initials}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate leading-tight">
              {user?.name ?? "Admin User"}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {user?.role?.replace("_", " ") ?? "Store Manager"}
            </p>
          </div>
        </div>

        <button
          onClick={userLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100/70 border border-red-200/40 rounded-xl transition-all duration-150 cursor-pointer"
        >
          <LogOut size={14} />
          Logout Session
        </button>
      </div>
    </aside>
  );
}
