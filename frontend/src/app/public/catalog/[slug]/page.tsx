"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { api, type ApiResponse } from "@/lib/api"
import { AddToCart } from "@/components/AddToCart"
import { WishlistButton } from "@/components/WishlistButton"

type ProductImage = {
  id: number
  url: string
  alt: string | null
  position: number
}

type ProductVariant = {
  id: number
  size: string
  stock: number
}

type ProductDetail = {
  id: number
  name: string
  slug: string
  description: string | null
  category?: { id: number; name: string; slug: string } | null
  price: number
  weight: number
  images: ProductImage[]
  variants: ProductVariant[]
}

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await api.get<ApiResponse<ProductDetail>>(`/products/${slug}`)

        setProduct(res.data)
        setActiveImageIndex(0)
      } catch (err: any) {
        console.error(err)
        setError(err.message || "Gagal memuat detail produk.")
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchDetail()
    }
  }, [slug])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="space-y-3 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900 mx-auto" />
          <p className="text-sm text-gray-600">Memuat produk...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <p className="mb-4 text-sm text-red-600">{error || "Produk tidak ditemukan."}</p>
        <Link href="/catalog" className="text-sm font-medium text-gray-900 hover:underline">
          Kembali ke catalog
        </Link>
      </div>
    )
  }

  const images = product.images ?? []
  const activeImage = images[activeImageIndex]?.url
  const hasStock = product.variants?.some((v) => v.stock > 0) ?? false

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image with Zoom */}
            <div
              className="relative aspect-[1/1] w-full overflow-hidden rounded-lg bg-gray-100"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {activeImage && (
                <img
                  src={activeImage || "/placeholder.svg"}
                  alt={product.name}
                  className={`h-full w-full object-cover transition-transform duration-300 ease-out ${isHovering ? "scale-150" : ""}`}
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

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => {
                const thumbnailClass = `h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-24 sm:w-24 ${
                  idx === activeImageIndex ? "border-gray-400" : "border-gray-200 hover:border-gray-400"
                }`

                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={thumbnailClass}
                  >
                    <img
                      src={img.url || "/placeholder.svg"}
                      alt={img.alt || product.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="space-y-3">
            {/* Stock Badge */}
            {hasStock && (
              <div className="inline-block">
                <span className="rounded bg-gray-900 px-3 py-1 text-xs font-semibold text-white">Ada Stok</span>
              </div>
            )}

            {/* Product Title & Price */}
            <div>
              <h1 className="text-xl font-semibold uppercase text-gray-900 sm:text-3xl">{product.name}</h1>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xl font-semibold text-gray-900">Rp {product.price.toLocaleString("id-ID")}</p>
                <WishlistButton productId={product.id} />
              </div>
            </div>

            {/* Add to Cart Component */}
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
              <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 text-center">
                <p className="text-sm font-medium text-red-600">Stok produk ini sedang habis.</p>
              </div>
            )}

            {/* Product Description */}
            {product.description && (
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm leading-relaxed text-gray-700">{product.description}</p>
              </div>
            )}

            {/* Additional Info */}
            <div className="space-y-2 border-t border-gray-200 pt-6 text-sm text-gray-600">
              <p>
                <span className="font-medium">Berat:</span> {product.weight} gr
              </p>
              {product.category && typeof product.category !== "string" && (
                <p>
                  <span className="font-medium">Kategori:</span> {product.category.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
