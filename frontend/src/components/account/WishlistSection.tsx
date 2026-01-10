"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth"
import { useWishlistStore } from "@/store/wishlist"
import { Heart } from "lucide-react"

type WishlistSectionProps = {
  showTitle?: boolean
}

export function WishlistSection({ showTitle = true }: WishlistSectionProps) {
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const items = useWishlistStore((s) => s.items)
  const loading = useWishlistStore((s) => s.loading)
  const error = useWishlistStore((s) => s.error)
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist)

  useEffect(() => {
    if (isAuthenticated && token) {
      void fetchWishlist(token)
    }
  }, [isAuthenticated, token, fetchWishlist])

  // THIS IS THE TITLE DESIGN FROM YOUR IMAGE
  const RenderHeader = () => (
    <div className="flex flex-col gap-2 sm:gap-3 ">
        <h2 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter leading-none">Saved Items</h2>
        <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-[8px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] whitespace-nowrap">Wishlist Archive</span>
            <div className="h-px flex-1 bg-zinc-200"></div>
        </div>
      </div>
  )

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        {showTitle && <RenderHeader />}
        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-16 px-4">
          <Heart className="mb-3 h-10 w-10 text-slate-300" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Login_Required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showTitle && <RenderHeader />}

      {loading && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 py-16">
          <Heart className="mb-3 h-12 w-12 text-slate-200" />
          <p className="text-sm font-bold uppercase text-slate-400 italic">Archive_Is_Empty</p>
          <Link href="/public/catalog" className="mt-6 text-[10px] font-black uppercase underline tracking-widest">
            Back_To_Catalog
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {items.map((item) => (
            <Link key={item.id} href={`/public/catalog/${item.product.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                {item.product.images[0]?.url ? (
                  <img
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-slate-400 font-bold uppercase">No_Asset</div>
                )}
              </div>
              <div className="mt-3 px-1">
                <h3 className="line-clamp-1 text-xs md:text-sm font-semibold uppercase text-slate-900">
                  {item.product.name}
                </h3>
                <p className="text-xs md:text-sm font-semibold text-black mt-0.5">
                  Rp {item.product.price.toLocaleString("id-ID")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}