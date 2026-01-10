"use client";

import { create } from "zustand";
import { api, ApiResponse } from "@/lib/api";
import { persist, createJSONStorage } from "zustand/middleware";

export type WishlistProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: { url: string }[];
};

export type WishlistItem = {
  id: number;
  product: WishlistProduct;
};

type WishlistState = {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;

  setItems: (items: WishlistItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;

  fetchWishlist: (token: string) => Promise<void>;
  toggleWishlist: (productId: number, token: string) => Promise<void>;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      setItems: (items) => set({ items }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      async fetchWishlist(token: string) {
        if (!token) return;
        set({ loading: true });
        try {
          const res = await api.get<ApiResponse<WishlistItem[]>>("/wishlist", token);
          set({ items: Array.isArray(res.data) ? res.data : [] });
        } catch (err: any) {
          set({ error: err?.message });
        } finally {
          set({ loading: false });
        }
      },

      async toggleWishlist(productId: number, token: string) {
        if (!token) return;
        try {
          const res = await api.post<ApiResponse<WishlistItem[]>>(
            "/wishlist/toggle",
            { productId },
            token
          );
          set({ items: Array.isArray(res.data) ? res.data : [] });
        } catch (err: any) {
          throw err;
        }
      },
    }),
    {
      name: "wishlist-storage", // Nama key di localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);