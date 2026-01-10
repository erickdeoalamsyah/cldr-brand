"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";

type ProductVariant = {
  id: number;
  size: string;
  stock: number;
};

type ProductDetailForCart = {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: { url: string; alt?: string | null }[];
  variants: ProductVariant[];
};

type Props = {
  product: ProductDetailForCart;
};

export function AddToCart({ product }: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    product.variants[0]?.id ?? null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const token = useAuthStore((s) => s.token);
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  // Get selected variant
  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId
  );

  // Calculate current quantity in cart for this variant
  const currentQtyInCart =
    cartItems.find(
      (item) =>
        item.productId === product.id &&
        item.variantId === selectedVariantId
    )?.quantity ?? 0;

  // Available stock = total stock - already in cart
  const availableStock = selectedVariant
    ? Math.max(0, selectedVariant.stock - currentQtyInCart)
    : 0;

  // Max quantity user can add
  const maxQuantity = availableStock;

const handleAdd = async () => {
    setError(null);

    if (!selectedVariantId || !selectedVariant) {
      setError("Pilih size terlebih dahulu.");
      return;
    }

    if (selectedVariant.stock <= 0) {
      setError("Stok untuk size ini habis.");
      return;
    }

    if (quantity > availableStock) {
      setError(`Stok tersedia: ${availableStock}.`);
      return;
    }

    const qty = Math.max(1, quantity);

    try {
      setIsAdding(true);

      await addItem(
        {
          productId: product.id,
          variantId: selectedVariant.id,
          quantity: qty,
          productName: product.name,
          productSlug: product.slug,
          price: product.price,
          size: selectedVariant.size,
          imageUrl: product.images[0]?.url ?? null,
        },
        token
      );

      // --- IMPLEMENTASI SONNER TOAST ---
      toast.success("Added to Cart", {
        description: `${product.name} (Size ${selectedVariant.size}) berhasil ditambahkan.`,
        duration: 3000,
      });

      setQuantity(1);
      setError(null);
    } catch (err: any) {
      console.error(err);
      
      const errorMessage = err.message?.toLowerCase().includes("stok") 
        ? err.message 
        : "Gagal menambahkan ke keranjang.";

      // Notifikasi Error jika gagal di level API/Store
      toast.error("Gagal", {
        description: errorMessage,
      });

      setError(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  // Handle quantity change with stock limit
  const handleQuantityChange = (newQty: number) => {
    setError(null);
    const validQty = Math.max(1, Math.min(newQty, maxQuantity));
    setQuantity(validQty);
  };

  return (
    <div className="space-y-3">
      {/* Pilih size */}
      <div className="space-y-1">
        <p className="text-md text-black">Size</p>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v) => {
            const qtyInCart =
              cartItems.find(
                (item) =>
                  item.productId === product.id && item.variantId === v.id
              )?.quantity ?? 0;
            const availStock = Math.max(0, v.stock - qtyInCart);

            return (
              <button
                key={v.id}
                type="button"
                disabled={availStock <= 0}
                onClick={() => {
                  setSelectedVariantId(v.id);
                  setQuantity(1);
                  setError(null);
                }}
                className={`rounded-sm px-3 py-1.5 text-sm relative ${
                  selectedVariantId === v.id
                    ? "border-2 border-black text-black"
                    : "border-2 border-gray-300 bg-white text-black"
                } ${availStock <= 0 ? "cursor-not-allowed opacity-40" : ""}`}
              >
                {v.size}
                {availStock <= 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full">
                    Habis
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Stock info */}
        {selectedVariant && (
          <p className="text-xs text-gray-600 mt-1">
            Stok tersedia: {availableStock}
            {currentQtyInCart > 0 && (
              <span className="text-emerald-600">
                {" "}
                ({currentQtyInCart} di keranjang)
              </span>
            )}
          </p>
        )}
      </div>

      {/* Quantity */}
      <div className="mt-6 flex items-center gap-2 text-md">
        <span className="text-black">Jumlah</span>
        <button
          type="button"
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1}
          className="h-8 w-7 rounded-md border border-slate-700 text-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          -
        </button>
        <input
          type="number"
          min={1}
          max={maxQuantity}
          value={quantity}
          onChange={(e) => handleQuantityChange(Number(e.target.value) || 1)}
          className="h-8 w-12 rounded-md border border-slate-700 bg-white text-center text-xs outline-none"
        />
        <button
          type="button"
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={quantity >= maxQuantity}
          className="h-8 w-7 rounded-md border border-slate-700 text-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Add to cart button */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!selectedVariant || availableStock <= 0 || isAdding}
        className="w-full rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAdding
          ? "Menambahkan..."
          : availableStock <= 0
          ? "Stok habis"
          : "Tambah ke keranjang"}
      </button>
    </div>
  );
}
