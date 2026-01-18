"use client";

import { useEffect } from "react";
import {
  useCatalogStore,
  SORT_OPTIONS,
  PRICE_RANGES,
  SIZE_OPTIONS,
} from "@/store/catalog";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  X,
} from "lucide-react";
import {
  ProductCard,
  FilterSection,
  RadioOption,
  MobileSheet,
} from "@/components/catalog/SharedComponents";

export default function CatalogPage() {
  const {
    loading,
    error,
    search,
    productType,
    availability,
    priceRange,
    selectedSize,
    sort,
    page,
    totalPages,
    showFilterSheet,
    showSortSheet,
    setSearch,
    setProductType,
    setAvailability,
    setPriceRange,
    setSelectedSize,
    setSort,
    setPage,
    previousPage,
    nextPage,
    resetFilters,
    toggleFilterSheet,
    toggleSortSheet,
    closeFilterSheet,
    closeSortSheet,
    fetchProducts,
    getFilteredProducts,
    getActiveFiltersCount,
  } = useCatalogStore();

  const filteredProducts = getFilteredProducts();
  const activeFiltersCount = getActiveFiltersCount();

  // Fetch products on mount and when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [page, sort, selectedSize, fetchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleApplyFilters = () => {
    closeFilterSheet();
    setPage(1);
    fetchProducts();
  };

  const handleApplySort = (value: string) => {
    setSort(value as any);
    closeSortSheet();
  };

  const handleResetFilters = () => {
    resetFilters();
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Mobile filter/sort buttons */}
        <div className="mb-6 flex gap-3 lg:hidden">
          <button
            type="button"
            onClick={toggleFilterSheet}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-900 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={toggleSortSheet}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-900 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
          >
            <ArrowUpDown className="h-4 w-4" />
            Urutan
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filter - Desktop */}
          <aside className="hidden w-[280px] flex-shrink-0 lg:block">
            <div className="sticky top-8 space-y-6">
              {/* Search */}
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full cursor-default rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </form>

              {/* Tipe Produk */}
              <FilterSection title="Tipe Produk">
                <RadioOption
                  label="Semua Produk"
                  checked={productType === "all"}
                  onChange={() => setProductType("all")}
                />
                <RadioOption
                  label="Produk Unggulan"
                  checked={productType === "featured"}
                  onChange={() => setProductType("featured")}
                />
              </FilterSection>

              {/* Ketersediaan */}
              <FilterSection title="Ketersediaan">
                <RadioOption
                  label="Semua"
                  checked={availability === "all"}
                  onChange={() => setAvailability("all")}
                />
                <RadioOption
                  label="Ada Stok"
                  checked={availability === "in-stock"}
                  onChange={() => setAvailability("in-stock")}
                />
              </FilterSection>

              {/* Harga */}
              <FilterSection title="Harga">
                <RadioOption
                  label="Semua Harga"
                  checked={priceRange === ""}
                  onChange={() => setPriceRange("")}
                />
                {PRICE_RANGES.map((range) => (
                  <RadioOption
                    key={range.value}
                    label={range.label}
                    checked={priceRange === range.value}
                    onChange={() => setPriceRange(range.value)}
                  />
                ))}
              </FilterSection>

              {/* Size */}
              <FilterSection title="Size">
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(selectedSize === size ? "" : size);
                      }}
                      className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-300 bg-white text-gray-900 hover:border-gray-900"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </FilterSection>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-sm tracking-[0.2em] font-semibold uppercase text-gray-900 md:text-xl">
                {productType === "featured"
                  ? "Produk Unggulan"
                  : "Semua Produk"}
                {activeFiltersCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredProducts.length} produk)
                  </span>
                )}
              </h1>

              <div className="relative hidden lg:block">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="appearance-none rounded-md border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm font-medium text-gray-900 outline-none transition-colors hover:border-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      Urutan : {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-900" />
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="mb-3 aspect-[3/4] w-full rounded-lg bg-gray-200" />
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {!loading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-12 text-center">
                <svg
                  className="mb-4 h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Tidak ada produk ditemukan
                </h3>
                <p className="mb-4 max-w-sm text-sm text-gray-500">
                  Maaf, tidak ada produk yang sesuai dengan filter yang Anda
                  pilih. Coba ubah atau hapus beberapa filter untuk melihat
                  lebih banyak produk.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  Reset Semua Filter
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredProducts.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={previousPage}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:border-gray-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300"
                >
                  Sebelumnya
                </button>
                <span className="px-4 text-sm text-gray-600">
                  Halaman {page} dari {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={nextPage}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:border-gray-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      {showFilterSheet && (
        <MobileSheet onClose={closeFilterSheet} title="">
          <div className="space-y-6 px-4 pb-24 pt-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </form>

            {/* Tipe Produk */}
            <FilterSection title="Tipe Produk">
              <RadioOption
                label="Semua Produk"
                checked={productType === "all"}
                onChange={() => setProductType("all")}
              />
              <RadioOption
                label="Produk Unggulan"
                checked={productType === "featured"}
                onChange={() => setProductType("featured")}
              />
            </FilterSection>

            {/* Ketersediaan */}
            <FilterSection title="Ketersediaan">
              <RadioOption
                label="Semua"
                checked={availability === "all"}
                onChange={() => setAvailability("all")}
              />
              <RadioOption
                label="Ada Stok"
                checked={availability === "in-stock"}
                onChange={() => setAvailability("in-stock")}
              />
            </FilterSection>

            {/* Harga */}
            <FilterSection title="Harga">
              <RadioOption
                label="Semua Harga"
                checked={priceRange === ""}
                onChange={() => setPriceRange("")}
              />
              {PRICE_RANGES.map((range) => (
                <RadioOption
                  key={range.value}
                  label={range.label}
                  checked={priceRange === range.value}
                  onChange={() => setPriceRange(range.value)}
                />
              ))}
            </FilterSection>

            {/* Size */}
            <FilterSection title="Size">
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setSelectedSize(selectedSize === size ? "" : size)
                    }
                    className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 bg-white text-gray-900 hover:border-gray-900"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </FilterSection>
          </div>

          {/* Apply Button */}
          <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="w-full rounded-lg bg-gray-900 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800"
            >
              Apply filter
            </button>
          </div>
        </MobileSheet>
      )}

      {/* Mobile sort bottom sheet */}
      {showSortSheet && (
        <MobileSheet onClose={closeSortSheet} title="Urutan">
          <div className="space-y-2 p-4">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleApplySort(opt.value)}
                className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                  sort === opt.value
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-900 hover:bg-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </MobileSheet>
      )}
    </div>
  );
}