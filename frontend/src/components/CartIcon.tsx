"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { ShoppingCart } from "lucide-react";

export function CartIcon() {
  const count = useCartStore((s) =>
    s.items.reduce((acc, item) => acc + item.quantity, 0)
  );

  return (
    <Link href="/public/cart" className="relative inline-flex items-center p-2 group">
      {/* Icon dengan transisi hover halus */}
      <ShoppingCart className="w-6 h-7 text-zinc-500 transition-transform group-hover:scale-110" />
      
      {count > 0 && (
        <span className="absolute top-2 right-2 transform translate-x-1/2 -translate-y-1/2 
                         flex items-center justify-center 
                         min-w-[20px] h-6 w-6 
                         bg-black text-white text-xs  
                         rounded-full border-2 border-white shadow-sm">
          {count > 10 ? '10+' : count}
        </span>
      )}
    </Link>
  );
}