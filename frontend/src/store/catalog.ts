import { create } from "zustand";
import { api, type ApiResponse } from "@/lib/api";

// ====== Types ======

export type ProductImage = {
  id: number;
  url: string;
  alt: string | null;
  position: number;
};

export type ProductVariant = {
  id: number;
  size: string;
  stock: number;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  isPopular: boolean;
  isVisible: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
};

type ProductListData = {
  items: Product[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type SortOption = "newest" | "popular" | "price_asc" | "price_desc";
export type ProductType = "all" | "featured";
export type AvailabilityFilter = "all" | "in-stock";

// ====== Constants ======

export const SORT_OPTIONS = [
  { value: "newest" as const, label: "Terbaru" },
  { value: "popular" as const, label: "Unggulan" },
  { value: "price_asc" as const, label: "Harga Terendah" },
  { value: "price_desc" as const, label: "Harga Tertinggi" },
];

export const PRICE_RANGES = [
  { value: "0-180000", label: "Di bawah Rp 180,000" },
  { value: "180000-250000", label: "Rp 180,000 - Rp 250,000" },
  { value: "250000-400000", label: "Rp 250,000 - Rp 400,000" },
  { value: "400000-plus", label: "Rp 400,000 +" },
];

export const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL", "XXXL"];

// ====== Store Interface ======

interface CatalogStore {
  // Products state
  products: Product[];
  loading: boolean;
  error: string | null;

  // Filter state
  search: string;
  productType: ProductType;
  availability: AvailabilityFilter;
  priceRange: string;
  selectedSize: string;
  sort: SortOption;

  // Pagination state
  page: number;
  totalPages: number;

  // UI state
  showFilterSheet: boolean;
  showSortSheet: boolean;

  // Wishlist state
  wishlist: Set<number>;

  // Actions - Products
  fetchProducts: () => Promise<void>;
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions - Filters
  setSearch: (search: string) => void;
  setProductType: (type: ProductType) => void;
  setAvailability: (availability: AvailabilityFilter) => void;
  setPriceRange: (range: string) => void;
  setSelectedSize: (size: string) => void;
  setSort: (sort: SortOption) => void;
  resetFilters: () => void;

  // Actions - Pagination
  setPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;

  // Actions - UI
  toggleFilterSheet: () => void;
  toggleSortSheet: () => void;
  closeFilterSheet: () => void;
  closeSortSheet: () => void;

  // Actions - Wishlist
  toggleWishlist: (productId: number) => void;

  // Computed
  getFilteredProducts: () => Product[];
  getActiveFiltersCount: () => number;
}

// ====== Initial State ======

const initialState = {
  products: [],
  loading: true,
  error: null,
  search: "",
  productType: "all" as ProductType,
  availability: "all" as AvailabilityFilter,
  priceRange: "",
  selectedSize: "",
  sort: "popular" as SortOption,
  page: 1,
  totalPages: 1,
  showFilterSheet: false,
  showSortSheet: false,
  wishlist: new Set<number>(),
};

// ====== Store Implementation ======

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  ...initialState,

  // Products actions
  fetchProducts: async () => {
    const { search, sort, selectedSize, page } = get();

    try {
      set({ loading: true, error: null });

      const query = new URLSearchParams();
      query.set("page", String(page));
      query.set("pageSize", "12");
      if (search) query.set("search", search);
      if (sort) query.set("sort", sort);
      if (selectedSize) query.set("size", selectedSize);

      const res = await api.get<ApiResponse<ProductListData>>(
        `/products?${query.toString()}`
      );

      set({
        products: res.data.items,
        totalPages: res.data.pagination.totalPages || 1,
        loading: false,
      });
    } catch (err: any) {
      console.error(err);
      set({
        error: err.message || "Gagal memuat produk.",
        products: [],
        totalPages: 1,
        loading: false,
      });
    }
  },

  setProducts: (products) => set({ products }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Filter actions
  setSearch: (search) => {
    set({ search, page: 1 });
  },

  setProductType: (productType) => {
    set({ productType });
  },

  setAvailability: (availability) => {
    set({ availability });
  },

  setPriceRange: (priceRange) => {
    set({ priceRange });
  },

  setSelectedSize: (selectedSize) => {
    set({ selectedSize, page: 1 });
  },

  setSort: (sort) => {
    set({ sort, page: 1 });
  },

  resetFilters: () => {
    set({
      search: "",
      productType: "all",
      availability: "all",
      priceRange: "",
      selectedSize: "",
      page: 1,
    });
  },

  // Pagination actions
  setPage: (page) => {
    set({ page });
  },

  nextPage: () => {
    const { page, totalPages } = get();
    if (page < totalPages) {
      set({ page: page + 1 });
    }
  },

  previousPage: () => {
    const { page } = get();
    if (page > 1) {
      set({ page: page - 1 });
    }
  },

  // UI actions
  toggleFilterSheet: () => {
    set((state) => ({ showFilterSheet: !state.showFilterSheet }));
  },

  toggleSortSheet: () => {
    set((state) => ({ showSortSheet: !state.showSortSheet }));
  },

  closeFilterSheet: () => {
    set({ showFilterSheet: false });
  },

  closeSortSheet: () => {
    set({ showSortSheet: false });
  },

  // Wishlist actions
  toggleWishlist: (productId) => {
    set((state) => {
      const newWishlist = new Set(state.wishlist);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return { wishlist: newWishlist };
    });
  },

  // Computed values
  getFilteredProducts: () => {
    const { products, productType, availability, priceRange } = get();
    let filtered = [...products];

    // Filter by product type (featured)
    if (productType === "featured") {
      filtered = filtered.filter((p) => p.isPopular);
    }

    // Filter by availability
    if (availability === "in-stock") {
      filtered = filtered.filter((p) => p.variants?.some((v) => v.stock > 0));
    }

    // Filter by price range
    if (priceRange) {
      const [min, max] = priceRange.split("-");
      if (max === "plus") {
        filtered = filtered.filter((p) => p.price >= Number(min));
      } else {
        filtered = filtered.filter(
          (p) => p.price >= Number(min) && p.price <= Number(max)
        );
      }
    }

    // Sort sold out products to the bottom
    filtered.sort((a, b) => {
      const aHasStock = a.variants?.some((v) => v.stock > 0) ?? false;
      const bHasStock = b.variants?.some((v) => v.stock > 0) ?? false;

      if (aHasStock && !bHasStock) return -1;
      if (!aHasStock && bHasStock) return 1;
      return 0;
    });

    return filtered;
  },

  getActiveFiltersCount: () => {
    const { productType, availability, priceRange, selectedSize } = get();
    return [
      productType !== "all",
      availability !== "all",
      priceRange !== "",
      selectedSize !== "",
    ].filter(Boolean).length;
  },
}));