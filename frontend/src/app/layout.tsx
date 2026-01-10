import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { useAuthStore } from "@/store/auth";
import { useWishlistStore } from "@/store/wishlist";
import { Toaster } from "sonner";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CLRD Store",
  description: "Simple fashion commerce",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "w-full flex items-center gap-4 p-4 rounded-xl border backdrop-blur-md transition-all duration-500 shadow-2xl",
              // Status Success: Border Hijau Emerald halus + Glow Hijau
              success:
                "bg-black/90 border-emerald-500/50 text-white shadow-emerald-500/10",
              // Status Error/Remove: Border Merah Rose halus + Glow Merah
              error:
                "bg-black/90 border-rose-500/50 text-white shadow-rose-500/10",
              // Status Info: Border Biru/Zinc
              info: "bg-black/90 border-zinc-700 text-white shadow-white/5",
              title: "text-[13px] font-bold tracking-[0.1em] uppercase",
              description: "text-[11px] text-zinc-400 font-medium",
            },
          }}
        />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
