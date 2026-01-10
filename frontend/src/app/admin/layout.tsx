"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth";
import { 
  LayoutDashboard, Package, Tag, ShoppingCart, 
  LogOut, Menu, X, User, ChevronRight, Settings,
  ChevronLeft
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // STATE BARU: Untuk Collapse Sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!user || user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-zinc-50/50 text-black font-sans">
      
      {/* SIDEBAR (Desktop) */}
      <aside 
        className={`hidden md:flex flex-col border-r border-zinc-200 bg-white transition-all duration-500 sticky top-0 h-screen z-50
          ${isCollapsed ? "w-24" : "w-72"}`}
      >
        {/* Toggle Button (YouTube Style) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-10 bg-black text-white rounded-full p-1 border-4 border-zinc-50 hover:scale-110 transition-transform"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Brand Logo */}
        <div className={`mb-12 flex items-center gap-3 transition-all duration-500 ${isCollapsed ? "px-6 justify-center" : "px-8 pt-10"}`}>
          <div className="bg-black p-2 rounded-xl shrink-0">
            <Settings size={20} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-500">
              <p className="text-sm font-black uppercase tracking-[0.2em]">CLRD</p>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Management</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center rounded-2xl transition-all duration-300 relative
                  ${isCollapsed ? "justify-center py-4" : "justify-between px-5 py-4"}
                  ${active ? "bg-black text-white shadow-lg shadow-black/10" : "text-zinc-400 hover:bg-zinc-50 hover:text-black"}`}
              >
                <div className="flex items-center gap-4">
                  <Icon size={18} className={active ? "text-emerald-400" : "text-zinc-400 group-hover:text-black"} />
                  {!isCollapsed && (
                    <span className="text-[11px] font-black uppercase tracking-[0.15em] animate-in fade-in duration-500">
                      {item.label}
                    </span>
                  )}
                </div>
                
                {/* Tooltip saat collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-black text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity uppercase tracking-widest z-[60] whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </Link>
              
            );
          })}
           {/* Logout */}
        <div className=" border-t border-zinc-100">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-4 rounded-2xl text-zinc-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300
              ${isCollapsed ? "justify-center py-4 w-full" : "px-5 py-4 w-full"}`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-[0.15em]">Logout</span>}
          </button>
        </div>
        </nav>

       
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 p-6 md:p-10 lg:p-12 transition-all duration-500">
          <div className="mx-auto max-w-7xl">
            {/* Dynamic Page Title */}
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                  {navItems.find((n) => n.exact ? pathname === n.href : pathname.startsWith(n.href))?.label ?? "Overview"}
                </h1>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-2">
                  System Context / {user?.email}
                </p>
              </div>
            </div>

            {/* Content Slot */}
            <div className="bg-white rounded-[2.5rem] border-2 border-gray-500 p-8 shadow-sm min-h-[70vh]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}