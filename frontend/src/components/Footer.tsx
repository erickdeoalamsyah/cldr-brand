"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Globe, Plus } from "lucide-react";
import logo from "../../public/assets/logo.png"; // Pastikan path benar

export function Footer() {
  const year = new Date().getFullYear();

  const payments = ["QRIS", "VISA", "MASTERCARD", "VA_MANDIRI"];
  const logistics = ["JNE_REG", "DHL_EXP", "GO_SEND"];

  return (
    <footer className="relative bg-[#0a0a0a] text-[#e5e5e5] pt-20 pb-10 overflow-hidden font-sans">
      
      {/* BACKGROUND GRID PATTERN (Inspired by OneWorld) */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`, backgroundSize: '60px 60px' }}>
        {/* Opsional: Jika ingin persis seperti gambar menggunakan icon Plus */}
        <div className="grid grid-cols-6 md:grid-cols-12 gap-10 p-10">
            {Array.from({ length: 48 }).map((_, i) => (
                <Plus key={i} size={12} className="text-zinc-500" />
            ))}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* TOP SECTION: SUMMARY & STATS */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-24 gap-12">
          <div className="max-w-md">
            <h2 className="text-4xl md:text-6xl font-serif italic leading-tight text-white mb-6">
              1 Store, 4 Services, 1 Creative Hub.
            </h2>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-mono">
              Operational Archive • Bandung, Indonesia
            </p>
          </div>

          {/* NEWSLETTER BOX - Refined */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-full flex items-center pr-6 w-full md:w-auto">
            <input 
              type="email" 
              placeholder="Newsletter" 
              className="bg-transparent px-6 py-2 outline-none text-sm w-full font-mono uppercase tracking-widest"
            />
            <button className="bg-white text-black p-2 rounded-full hover:scale-105 transition-transform">
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>

        {/* MIDDLE SECTION: DATA GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 border-t border-white/10 pt-12 mb-32">
          
          {/* COLUMN 1: FOLLOW */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-500 underline decoration-zinc-800 underline-offset-8">Follow Us</h4>
            <ul className="space-y-3 font-mono text-sm tracking-tighter">
              <li><Link href="https://www.instagram.com/coldlogicdrivenriot/" className="hover:text-white transition-colors flex items-center gap-2">Instagram <ArrowUpRight size={12}/></Link></li>
              <li><Link href="#" className="hover:text-white transition-colors flex items-center gap-2">TikTok <ArrowUpRight size={12}/></Link></li>
              <li><Link href="#" className="hover:text-white transition-colors flex items-center gap-2">WhatsApp <ArrowUpRight size={12}/></Link></li>
            </ul>
          </div>

          {/* COLUMN 2: STORE LOCATION */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-500 underline decoration-zinc-800 underline-offset-8">Coordinates</h4>
            <p className="text-sm font-mono leading-relaxed tracking-tighter uppercase italic">
              Jl. Gudang Selatan No. 22<br />
              Bandung, West Java<br />
              Indonesia, 40113
            </p>
          </div>

          {/* COLUMN 3: PAYMENTS */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-500 underline decoration-zinc-800 underline-offset-8">Payment Protocol</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2 opacity-60">
                {payments.map(p => (
                    <span key={p} className="text-[11px] font-mono tracking-tighter">{p}</span>
                ))}
            </div>
          </div>

          {/* COLUMN 4: LOGISTICS & LEGAL */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-500 underline decoration-zinc-800 underline-offset-8">Transmission</h4>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-4 text-[11px] font-mono italic opacity-60">
                    {logistics.map(l => <span key={l}>{l}</span>)}
                </div>
                <div className="flex gap-4 pt-4 border-t border-white/5">
                    <Link href="#" className="text-[10px] uppercase font-mono text-zinc-500 hover:text-white">Privacy</Link>
                    <Link href="#" className="text-[10px] uppercase font-mono text-zinc-500 hover:text-white">Terms</Link>
                </div>
            </div>
          </div>
        </div>

        {/* BOTTOM LOGO SECTION (OneWorld Inspired) */}
        <div className="relative pt-10">
          <div className="flex items-center gap-4 mb-4 opacity-50 overflow-hidden whitespace-nowrap">
             {Array.from({length: 10}).map((_, i) => (
                <span key={i} className="text-[10px] font-mono uppercase tracking-[0.5em] shrink-0">
                    CLXDR_ARCHIVE // {year} • DEPLOYMENT_ACTIVE •
                </span>
             ))}
          </div>
          
          {/* RAKSASA LOGO YANG MEMOTONG BAWAH */}
          <div className="relative h-[20vh] md:h-[35vh] w-full flex items-end">
            <div className="relative h-full w-full opacity-[0.9] grayscale invert brightness-200 contrast-200">
               <Image 
                src={logo}
                alt="Big Logo"
                fill
                className="object-contain object-bottom select-none translate-y-[20%]"
               />
            </div>
          </div>
        </div>

        {/* FINAL BAR */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[9px] font-mono uppercase tracking-widest text-zinc-600">
          <p>© {year} — Developed by CLXDR Engineering</p>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Globe size={10} />
            <span>ID_NODE_40113</span>
          </div>
        </div>
      </div>
    </footer>
  );
}