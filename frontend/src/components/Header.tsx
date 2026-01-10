"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AuthModal } from "@/components/AuthModal";
import { CartIcon } from "@/components/CartIcon";
import { useAuthStore } from "@/store/auth";
import { User2, Menu, X, ChevronRight, Circle } from "lucide-react";
import Logo from "../../public/assets/logo.png";

const navItems = [
  { href: "/public/catalog", label: "CATALOG" },
  { href: "/public/community", label: "COMMUNITY" },
  { href: "/public/about", label: "ABOUT" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const [authOpen, setAuthOpen] = useState(false);

  const handleProfileClick = () => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      setAuthOpen(true);
    } else {
      router.push("/public/account");
    }
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b-2 border-zinc-200 bg-white">
        {/* MAIN BAR - Menggunakan h-16 dengan flex items-center untuk alignment logo sempurna */}
        <div className="flex h-16 w-full items-center justify-between px-6 md:px-10">
          
          {/* LEFT: LOGO - Container logo dipastikan flex & center secara vertikal */}
          <div className="flex-1 flex items-center h-full">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-70 cursor-pointer">
              <Image
                src={Logo}
                alt="CLDR Logo"
                className="h-6 w-auto md:h-7 object-contain"
                priority
              />
            </Link>
          </div>

          {/* CENTER: NAVLINK (Desktop) */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs uppercase tracking-[0.3em] transition-all duration-200 cursor-pointer
                  ${isActive(item.href) ? "font-black italic text-black" : "font-semibold  text-black hover:underline hover:underline-offset-6"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT: ACTION ICONS */}
          <div className="flex flex-1 items-center justify-end gap-3 lg:gap-5 h-full">
            <div className="cursor-pointer transition-transform hover:scale-110 active:scale-95">
              <CartIcon />
            </div>

            {/* PROFILE ICON */}
            <button
              onClick={handleProfileClick}
              className="relative flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              {!hasHydrated ? (
                <div className="h-5 w-5 animate-pulse rounded-full bg-zinc-100" />
              ) : !isAuthenticated || !user ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-zinc-50 text-zinc-600 transition-all hover:border-black hover:bg-black hover:text-white">
                  <User2 size={18} strokeWidth={1.5} />
                </div>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-zinc-500 bg-white transition-all overflow-hidden relative">
                  <span className="text-sm font-semibold uppercase text-black">
                    {user.name?.charAt(0)}
                  </span>
                </div>
              )}
            </button>

            {/* MOBILE MENU TOGGLE (Hamburger Icon) */}
            <button 
              className="lg:hidden rounded-full transition-colors hover:bg-zinc-50 active:bg-zinc-100 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? 
                <X size={24} strokeWidth={1.5} className="text-black transition-transform hover:rotate-90 duration-300" /> : 
                <Menu size={24} strokeWidth={1.5} className="text-black transition-transform hover:scale-110" />
              }
            </button>
          </div>
        </div>

        {/* MOBILE SIDEBAR (Overlay) */}
        <div 
          className={`fixed inset-0 top-16 z-40 bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden
          ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex flex-col h-full p-8 pt-12">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group flex items-center justify-between border-b border-zinc-300 pb-3 cursor-pointer hover:pl-2 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 pb-3 ">
                    <Circle 
                      size={6} 
                      className={`transition-all duration-300 ${isActive(item.href) ? "fill-black" : "fill-transparent text-zinc-500 group-hover:text-black"}`} 
                    />
                    <span className={`text-xs tracking-[0.3em] uppercase transition-all duration-300
                      ${isActive(item.href) ? "font-black text-black translate-x-1" : "font-medium text-zinc-400 group-hover:text-black group-hover:translate-x-1"}`}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-black" />
                </Link>
              ))}
            </div>

            {/* Bottom Mobile Content */}
            <div className="mt-auto pb-12">
              <div className="p-6 rounded-2xl bg-zinc-200  shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black mb-4">Account Access</p>
                <button 
                  onClick={() => { handleProfileClick(); setIsMobileMenuOpen(false); }}
                  className="w-full bg-black text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all hover:bg-zinc-800 active:scale-[0.98]"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Sign In / Register"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}