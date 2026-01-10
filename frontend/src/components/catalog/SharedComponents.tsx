"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";
import type { Product } from "@/store/catalog";

// ====== Filter Section Component ======

export function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-200 pb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mb-3 flex w-full items-center justify-between text-sm font-bold text-gray-900"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="space-y-2">{children}</div>}
    </div>
  );
}

// ====== Radio Option Component ======

export function RadioOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-900">
      <div className="relative flex items-center">
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border-2 border-gray-300 transition-colors checked:border-gray-900"
        />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-900 opacity-0 transition-opacity peer-checked:opacity-100" />
      </div>
      {label}
    </label>
  );
}

// ====== Product Card Component ======

export function ProductCard({ product }: { product: Product }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const primary = product.images?.[0]?.url;
  const secondary = product.images?.[1]?.url || primary;
  const hasStock = product.variants?.some((v) => v.stock > 0) ?? false;

  return (
    <div
      className={`group relative scroll-smooth ${
        !hasStock ? "opacity-50" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/public/catalog/${product.slug}`} className="block">
        <div className="relative mb-3 aspect-[1/1] w-full overflow-hidden rounded-lg bg-gray-100">
          {/* Primary Image */}
          {primary && (
            <>
              <img
                src={primary}
                alt={product.name}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                } ${isHovered ? "opacity-0" : "opacity-100"}`}
              />
              {/* Secondary Image on Hover */}
              {secondary && (
                <img
                  src={secondary}
                  alt={product.name}
                  loading="lazy"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}
            </>
          )}

          {/* Sold Out Badge */}
          {!hasStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-md bg-black px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                Stok Habis
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-black md:text-sm">
              <h3 className="font-medium uppercase">{product.name}</h3>
              <p>Rp. {product.price.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <WishlistButton productId={product.id} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ====== Mobile Sheet Component ======

export function MobileSheet({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  useEffect(() => {
    // Prevent body scroll when sheet is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white shadow-xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4">
          {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
          {!title && <div />}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-900" />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </>
  );
}