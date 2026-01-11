"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, type ApiResponse } from "@/lib/api";
import { AddToCart } from "@/components/AddToCart";
import { WishlistButton } from "@/components/WishlistButton";
import { Lock, Check } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get<ApiResponse<any>>(`/products/${slug}`);
        setProduct(res.data);
      } catch (err: any) {
        setError(err.message || "Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchDetail();
  }, [slug]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-black" />
      </div>
    );

  if (error || !product)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-4">
          {error || "Product Not Found"}
        </p>
        <Link
          href="/public/catalog"
          className="text-[10px] font-black uppercase underline tracking-tighter"
        >
          Back to Catalog
        </Link>
      </div>
    );

  const images = product.images ?? [];
  const activeImage = images[activeImageIndex]?.url;
  const hasStock = product.variants?.some((v: any) => v.stock > 0) ?? false;

  return (
    <main className="min-h-screen bg-white pb-20">
      <section className="mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-12">
          {/* LEFT: GALLERY */}
          <div className="lg:col-span-7 w-full space-y-4">
            {/* Main Image - FIX: Added max-h for mobile to prevent offside */}
            <div
              className="relative aspect-[4/3] w-full max-h-[50vh] sm:max-h-none overflow-hidden rounded-[2rem] bg-zinc-50 border border-zinc-100"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {activeImage && (
                <img
                  src={activeImage}
                  alt={product.name}
                  className={`h-full w-full object-cover transition-transform duration-500 ease-out ${
                    isHovering ? "scale-150" : "scale-100"
                  }`}
                  style={
                    isHovering
                      ? {
                          transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                        }
                      : undefined
                  }
                />
              )}
            </div>

            {/* Thumbnails - FIX: Mobile friendly scroll & size */}
            <div className="flex gap-3 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {product.images.map((img: any, idx: number) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    // snap-start: agar saat di-scroll otomatis berhenti pas di kotak thumbnail
                    // Ukuran h-16 w-16 di mobile (HP) dan h-20 w-20 di Desktop
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 snap-start overflow-hidden rounded-2xl transition-all duration-300 ${
                      isActive ? " shadow-lg" : "opacity-100 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={img.url}
                      className="h-full w-full object-cover"
                      alt="thumb"
                    />

                    {/* Centang Overlay saat Aktif */}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px]">
                        <div className="bg-emerald-400 rounded-full p-1 shadow-xl animate-in zoom-in-50 duration-300">
                          <Check
                            size={12}
                            className="text-emerald-800 sm:size-[14px]"
                            strokeWidth={4}
                          />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="lg:col-span-5 flex flex-col gap-6 sm:gap-8 mt-4 lg:mt-0">
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                  {product.category?.name}
                </span>
                {hasStock ? (
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-600 px-2 py-1 bg-green-50 rounded-md">
                    In_Stock
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-600 px-2 py-1 bg-red-50 rounded-md">
                    Sold_Out
                  </span>
                )}
              </div>

              <h1 className="text-lg md:text-2xl uppercase  text-zinc-600">
                {product.name}
              </h1>

              <div className="flex items-center justify-between ">
                <p className=" text-lg md:text-2xl font-semibold tracking-tighter text-zinc-900">
                  Rp {product.price.toLocaleString("id-ID")}
                </p>
                <WishlistButton productId={product.id} />
              </div>
            </div>

            {/* ADD TO CART COMPONENT */}
            <div className="w-full ">
              {hasStock ? (
                <AddToCart
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    images: product.images,
                    variants: product.variants || [],
                  }}
                />
              ) : (
                <div className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-2xl text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">
                    Inventory_Depleted
                  </p>
                </div>
              )}
            </div>

            {/* INFO SECTION */}
            <div className="border-t-2 border-zinc-300 pt-8 space-y-6">
              <div className="grid grid-cols-2 gap-8 border-t border-zinc-50">
                <div className="space-y-1">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    Unit_Weight
                  </h4>
                  <p className="text-xs font-bold">{product.weight} GR</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    Security
                  </h4>
                  <div className="flex items-center gap-1 text-xs font-bold uppercase">
                    <Lock size={10} /> Verified
                  </div>
                </div>
              </div>
              {product.description && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900">
                    Description
                  </h4>
                  <p className="text-[11px] font-black leading-relaxed text-zinc-500 ">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
