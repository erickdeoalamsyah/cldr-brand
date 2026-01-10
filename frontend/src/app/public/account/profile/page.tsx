"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { AccountAddressesSection } from "@/components/account/AccountAdressesSection";
import {
  User,
  MapPin,
  LogOut,
  ArrowLeft,
  Settings2,
  User2,
  ShieldCheck,
} from "lucide-react";

type SidebarKey = "profile" | "shipping";

export default function AccountProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [active, setActive] = useState<SidebarKey>("profile");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "shipping") setActive("shipping");
    if (tab === "profile") setActive("profile");
  }, [searchParams]);

  if (!hasHydrated) return null;

  if (!isAuthenticated || !user || !token) {
    return (
      <main className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-6">
        <div className="bg-white border-2 border-black p-10 rounded-[2rem] shadow-[6px_6px_0px_black] text-center w-full max-w-xs">
          <h2 className="text-xl font-black uppercase tracking-tighter italic mb-4">
            Identity Required
          </h2>
          <button
            onClick={() => router.push("/")}
            className="text-[10px] font-black underline uppercase tracking-widest"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#F8F8F8] py-6 md:py-12 px-4 md:px-6">
      <div className="mx-auto max-w-6xl">
        
        {/* TOP HEADER: Flex Row di HP agar compact */}
        <div className="mb-8 md:mb-12 flex flex-row items-center justify-between gap-4">
          <div className="space-y-1 md:space-y-2 min-w-0">
            <div className="flex items-center gap-2 text-zinc-400">
              <Settings2 size={12} className="md:w-[14px]" />
              <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
                Settings mode
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-black truncate">
              Control Panel
            </h1>
          </div>
          
          <button
            onClick={() => router.push("/public/account")}
            className="flex items-center gap-2 rounded-xl md:rounded-full bg-white border-2 border-zinc-500 px-3 py-2.5 md:px-6 md:py-3 text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-900 hover:text-white shrink-0  md:shadow-none active:scale-95"
          >
            <ArrowLeft size={14} />
            <span className="hidden xs:inline">Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* SIDEBAR: Di HP jadi Horizontal Scroll atau Grid 2 Kolom */}
          <aside className="lg:col-span-4 space-y-3 md:space-y-4">
            <div className="bg-black rounded-[1.5rem] md:rounded-[2.5rem] p-2 md:p-4 text-white">
              <nav className="flex flex-row lg:flex-col gap-2">
                <button
                  onClick={() => setActive("profile")}
                  className={`flex flex-1 items-center justify-center lg:justify-between rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-5 transition-all
                    ${active === "profile" ? "bg-white text-black" : "hover:bg-zinc-800 text-zinc-400"}`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <User size={16} className="md:w-[18px]" />
                    <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest">
                      Profile
                    </span>
                  </div>
                  <div className={`hidden lg:block h-1.5 w-1.5 rounded-full ${active === "profile" ? "bg-black" : "bg-transparent"}`} />
                </button>

                <button
                  onClick={() => setActive("shipping")}
                  className={`flex flex-1 items-center justify-center lg:justify-between rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-5 transition-all
                    ${active === "shipping" ? "bg-white text-black" : "hover:bg-zinc-800 text-zinc-400"}`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <MapPin size={16} className="md:w-[18px]" />
                    <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest">
                      Address
                    </span>
                  </div>
                  <div className={`hidden lg:block h-1.5 w-1.5 rounded-full ${active === "shipping" ? "bg-black" : "bg-transparent"}`} />
                </button>
              </nav>
            </div>

            {/* LOGOUT BUTTON: Lebih ramping di HP */}
            <button
              onClick={handleLogout}
              className="group flex w-full items-center justify-between rounded-xl md:rounded-[2rem] border-2 border-red-600 bg-white px-6 py-4 md:px-8 md:py-6 text-red-500 transition-all hover:bg-red-200 active:scale-95  md:shadow-none"
            >
              <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest">
                Logout
              </span>
              <LogOut size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </aside>

          {/* DYNAMIC CONTENT CARD */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-zinc-900 p-6 md:p-12 shadow-[8px_8px_0px_black] md:shadow-none">
              {active === "profile" && (
                <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <User2 size={20} className="md:w-[27px]" />
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                        Identity_Detailed
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-black">
                      Verified <span className="text-zinc-400 ">Member</span>
                    </h2>
                  </div>

                  <div className="grid gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2 md:ml-4">
                        Username
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          disabled
                          value={user.name}
                          className="w-full cursor-not-allowed rounded-xl md:rounded-2xl border-2 border-zinc-200 bg-zinc-50/50 px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-bold text-black outline-none"
                        />
                        <ShieldCheck className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-2 md:ml-4">
                        Auth_Email
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full cursor-not-allowed rounded-xl md:rounded-2xl border-2 border-zinc-200 bg-zinc-50/50 px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-bold text-black outline-none"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2 bg-zinc-50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-dashed border-zinc-300">
                      <div className="px-3 py-1.5 bg-black text-white rounded-lg font-black text-[9px] uppercase tracking-tighter shrink-0">
                        {user.role}
                      </div>
                      <p className="text-[9px] md:text-[10px] font-medium text-zinc-500 leading-relaxed italic">
                        Node_Active: {user.role} permissions granted. community_access: enabled.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {active === "shipping" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <AccountAddressesSection />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}