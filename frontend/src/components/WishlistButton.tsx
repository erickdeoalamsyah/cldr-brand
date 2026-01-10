"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/store/auth";
import { useWishlistStore } from "@/store/wishlist";
import { toast } from "sonner";
import { Heart } from "lucide-react";

type Props = {
  productId: number;
  size?: "sm" | "md";
};

export function WishlistButton({ productId, size = "md" }: Props) {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useWishlistStore((s) => s.items);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const inWishlist = useMemo(
    () => items.some((i) => i.product.id === productId),
    [items, productId]
  );

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !token) {
      toast.error("AKSES TERBATAS", {
        description: "Silakan login untuk menyimpan produk favorit Anda.",
        className: "border-red-500/50 bg-black/90", // Style tambahan spesifik
        duration: 4000,
      });
      return;
    }

    try {
      const currentlyInWishlist = inWishlist;
      await toggleWishlist(productId, token);

      if (!currentlyInWishlist) {
        // TAMBAH: Menggunakan warna EMERALD (Success)
        toast.success("ADDED TO WISHLIST", {
          description: "Produk berhasil dikurasi ke koleksi Anda.",
          icon: (
            <div className="bg-emerald-500/20 p-1.5 rounded-full">
              <Heart size={14} className="fill-emerald-500 text-emerald-500" />
            </div>
          ),
        });
      } else {
        // HAPUS: Menggunakan toast.error agar warna border otomatis MERAH (Rose)
        // Secara UX, menghapus sesuatu sering dikategorikan sebagai tindakan destruktif/negatif
        toast.error("REMOVED", {
          description: "Item telah dikeluarkan dari daftar keinginan.",
          icon: (
            <div className="bg-rose-500/20 p-1.5 rounded-full">
              <Heart size={14} className="text-rose-500" />
            </div>
          ),
        });
      }
    } catch (error) {
      toast.error("SYSTEM ERROR", {
        description: "Terjadi gangguan koneksi, silakan coba lagi.",
      });
    }
  };

  const sizeClass = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? 16 : 20;

  return (
    <button
      type="button"
      onClick={handleClick}
      // 3. VISUAL BEST PRACTICE: Jika belum login, buat sedikit transparan agar user tahu ada status berbeda
      className={`inline-flex items-center justify-center rounded-full transition-all duration-200 
        ${!isAuthenticated ? "opacity-60 grayscale" : "opacity-100"}
        ${inWishlist ? "bg-red-50" : "bg-white/80 backdrop-blur-sm"} 
        hover:scale-110 active:scale-95 shadow-sm border border-slate-100 ${sizeClass}`}
    >
      <Heart
        size={iconSize}
        className={`transition-colors duration-300 ${
          inWishlist
            ? "fill-red-500 text-red-500"
            : "text-slate-400 hover:text-red-400"
        }`}
      />
    </button>
  );
}
