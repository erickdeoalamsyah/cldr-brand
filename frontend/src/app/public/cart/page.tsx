"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/AuthModal";
import { Plus, Minus, X, ShoppingBag, ArrowRight, Trash2, Lock } from "lucide-react";

export default function CartDrawer() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const { items, loadFromServer, updateQuantity, removeItem } = useCartStore();

  const [authOpen, setAuthOpen] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      void loadFromServer(token);
    }
  }, [isAuthenticated, token, loadFromServer]);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  const keyOf = (productId: number, variantId: number | null) =>
    `${productId}:${variantId ?? "null"}`;

  const canIncrease = (variantStock: number | null | undefined, qty: number) => {
    if (!isAuthenticated) return true;
    if (variantStock === null || variantStock === undefined) return true;
    return qty < variantStock;
  };

  const handleDecrease = async (
    productId: number,
    variantId: number | null,
    currentQty: number
  ) => {
    if (currentQty <= 1 || busyKey) return; // Guard agar tidak double click saat busy

    const k = keyOf(productId, variantId);
    setBusyKey(k);

    try {
      await updateQuantity({ productId, variantId, quantity: currentQty - 1, token });
    } catch (err: any) {
      toast.error("Gagal mengurangi quantity", {
        description: err?.message ?? "Terjadi kesalahan.",
      });
      if (isAuthenticated && token) { await loadFromServer(token); }
    } finally {
      setBusyKey(null);
    }
  };

  const handleIncrease = async (
    productId: number,
    variantId: number | null,
    currentQty: number,
    variantStock: number | null | undefined
  ) => {
    if (!canIncrease(variantStock, currentQty) || busyKey) return;

    const k = keyOf(productId, variantId);
    setBusyKey(k);

    try {
      await updateQuantity({ productId, variantId, quantity: currentQty + 1, token });
    } catch (err: any) {
      toast.error("Tidak bisa menambah quantity", {
        description: err?.message ?? "Terjadi kesalahan.",
      });
      if (isAuthenticated && token) { await loadFromServer(token); }
    } finally {
      setBusyKey(null);
    }
  };

  const handleRemove = async (productId: number, variantId: number | null) => {
    const k = keyOf(productId, variantId);
    setBusyKey(k);

    try {
      await removeItem({ productId, variantId, token });
      toast.success("Item dihapus");
    } catch (err: any) {
      toast.error("Gagal menghapus item", {
        description: err?.message ?? "Terjadi kesalahan.",
      });
      if (isAuthenticated && token) { await loadFromServer(token); }
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden bg-black/40 backdrop-blur-sm">
      {/* DRAWER PANEL: Responsive w-full on mobile, max-w-md on desktop */}
      <div className="h-full w-full sm:max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col border-l border-zinc-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b-2 border-zinc-300 p-6">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-black" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest leading-none">Your Bag</h2>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                {items.length} Unique Items
              </p>
            </div>
          </div>

          <button
            onClick={() => router.back()}
            className="rounded-full p-2 hover:bg-zinc-100 transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* CART ITEMS (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-4">
              <div className="mb-4 rounded-full bg-zinc-50 p-6">
                <ShoppingBag size={32} className="text-zinc-200" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Archive is empty
              </p>
              <Link
                href="/public/catalog"
                className="mt-4 text-[10px] font-black uppercase tracking-widest underline underline-offset-4"
              >
                Start Curating
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const itemKey = keyOf(item.productId, item.variantId);
              const isBusy = busyKey === itemKey;
              const plusEnabled = canIncrease(item.variantStock ?? null, item.quantity);

              return (
                <div key={itemKey} className="group flex gap-4 sm:gap-5">
                  {/* Image Container */}
                  <div className="relative h-24 w-20 sm:h-28 sm:w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-110 ${isBusy ? 'opacity-50 grayscale' : 'opacity-100'}`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between py-1 min-w-0">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight leading-tight truncate">
                          {item.productName}
                        </h3>
                        <button
                          onClick={() => void handleRemove(item.productId, item.variantId)}
                          disabled={isBusy}
                          className="text-red-600 hover:scale-110 transition-all disabled:opacity-20"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {item.size && (
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                          Size: {item.size}
                        </p>
                      )}

                      <p className="text-xs font-black italic tracking-tighter">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    {/* Qty Controls - FIX: Menghilangkan 'kilat' disabled saat busy */}
                    <div className="flex items-center justify-between mt-3 sm:mt-4">
                      <div className="flex items-center border border-zinc-200 rounded-full p-0.5">
                        <button
                          onClick={() => void handleDecrease(item.productId, item.variantId, item.quantity)}
                          disabled={item.quantity <= 1} 
                          className={`p-1 transition-colors ${item.quantity <= 1 ? 'text-zinc-200 cursor-not-allowed' : 'text-zinc-400 hover:text-black'}`}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>

                        <span className={`w-8 text-center text-[10px] font-black ${isBusy ? 'animate-pulse text-zinc-300' : 'text-black'}`}>
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => void handleIncrease(item.productId, item.variantId, item.quantity, item.variantStock ?? null)}
                          disabled={!plusEnabled}
                          className={`p-1 transition-colors ${!plusEnabled ? 'text-zinc-200 cursor-not-allowed' : 'text-zinc-400 hover:text-black'}`}
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <p className="text-[10px] sm:text-[11px] font-black tracking-tighter italic">
                        Sub: Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t border-zinc-100 p-6 sm:p-8 space-y-6 bg-zinc-50/50">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              <span>Total Value</span>
              <span className="text-black">Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900">
                Final Amount
              </span>
              <span className="text-xl font-black italic tracking-tighter text-black">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {isAuthenticated ? (
              <button
                onClick={() => router.push("/public/checkout")}
                disabled={items.length === 0}
                className="group w-full bg-black py-4 sm:py-5 flex items-center justify-center gap-3 rounded-full hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-20"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                  Continue to Checkout
                </span>
                <ArrowRight size={16} className="text-white transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                disabled={items.length === 0}
                className="group w-full bg-white border-2 border-zinc-200 py-4 sm:py-5 flex items-center justify-center gap-3 rounded-full hover:border-black transition-all active:scale-[0.98] disabled:opacity-20"
              >
                <Lock size={14} className="text-zinc-400 group-hover:text-black transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black">
                  Login to Checkout
                </span>
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              <Lock size={10} />
              <span>Encrypted Secure Payment</span>
            </div>
          </div>

          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </div>
      </div>
    </div>
  );
}