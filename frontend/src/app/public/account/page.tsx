"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Settings,
  ShoppingBag,
  Heart,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { WishlistSection } from "@/components/account/WishlistSection";
import { AccountOrdersSection } from "@/components/account/AccountOrdersSection";
import { AuthModal } from "@/components/AuthModal";

export default function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const [activeTab, setActiveTab] = useState<"orders" | "wishlist">("orders");
  const [authOpen, setAuthOpen] = useState(false);
  if (!hasHydrated) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900 mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
          Synchronizing Archive
        </p>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center border-2 border-zinc-900 p-10 rounded-[3rem] ">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">
            Denied
          </h2>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-10 leading-relaxed">
            Identity verification required to access encrypted user archives.
          </p>

          {/* GANTI LINK DENGAN BUTTON */}
          <button
            onClick={() => setAuthOpen(true)}
            className="block w-full bg-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-zinc-600 transition-all duration-300 cursor-pointer"
          >
            Initial Login
          </button>
        </div>

        {/* 3. SERTAKAN MODAL DI SINI */}
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-12 md:pb-24">
  {/* 1. BRUTALIST HEADER SECTION */}
  <section className="py-6 md:py-12 bg-zinc-50/50 border-b border-zinc-100">
    <div className="mx-auto max-w-6xl px-4 md:px-6">
      <div className="flex flex-row items-end justify-between gap-4 mb-4">
  {/* SISI KIRI: Judul & Identitas */}
  <div className="space-y-1.5 md:space-y-4 min-w-0 flex-1">
    <div className="flex items-center gap-2 md:gap-3 text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.5em] text-zinc-600 whitespace-nowrap">
      <span className="h-[1px] w-4 md:w-10 bg-zinc-600 hidden xs:block"></span>
      Authorized Identity
    </div>
    
    <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter text-black leading-none truncate">
      Hi, {user.name}
      <span className="text-black">.</span>
    </h1>
  </div>

  {/* SISI KANAN: Button tetap flex-row (Tidak Full Width di HP) */}
  <Link
    href="/public/account/profile"
    className="group relative inline-flex items-center justify-center gap-2 md:gap-3 bg-black px-4 py-3 md:px-8 md:py-5 rounded-lg md:rounded-2xl transition-all duration-500 hover:pr-8 md:hover:pr-12 shrink-0 self-end mb-1 md:mb-0"
  >
    <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-white">
      Edit Profile
      {/* <span className="hidden xs:inline"> Profile</span> */}
    </span>
    <Settings
      size={12}
      className="text-white group-hover:rotate-180 transition-all duration-700 md:w-4 md:h-4"
    />
    <ChevronRight
      className="absolute right-3 opacity-0 group-hover:opacity-100 transition-all text-white"
      size={12}
    />
  </Link>
</div>
    </div>
  </section>

  {/* 2. TAB SYSTEM & CONTENT BOX */}
  <section className="mx-auto max-w-6xl px-3 md:px-6 -mt-4 md:-mt-6 relative z-10">
    <div className="bg-white border-2 border-zinc-900 rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
      
      {/* TAB HEADERS */}
      <div className="grid grid-cols-2 border-b-2 border-zinc-900">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 py-4 md:py-7 transition-all duration-300
          ${
            activeTab === "orders"
              ? "bg-black text-white"
              : "bg-white text-zinc-400 hover:text-black hover:bg-zinc-50"
          }`}
        >
          <ShoppingBag size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
          <span className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.3em] text-center">
            Order History
          </span>
        </button>

        <button
          onClick={() => setActiveTab("wishlist")}
          className={`flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 py-4 md:py-7 transition-all duration-300
          ${
            activeTab === "wishlist"
              ? "bg-black text-white"
              : "bg-white text-zinc-400 hover:text-black hover:bg-zinc-50"
          }`}
        >
          <Heart size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
          <span className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.3em] text-center">
            Wishlist Items
          </span>
        </button>
      </div>

      {/* INTERNAL CONTENT AREA */}
      <div className="p-4 sm:p-6 md:p-10 lg:p-14 min-h-[300px] md:min-h-[400px]">
        {activeTab === "orders" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AccountOrdersSection />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <WishlistSection showTitle={true} />
          </div>
        )}
      </div>
    </div>
  </section>
</main>
  );
}
