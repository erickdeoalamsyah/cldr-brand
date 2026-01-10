"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, ApiResponse, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export type ServerCartItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    images: { url: string }[];
  };
  variant: {
    id: number;
    size: string;
  } | null;
};

export type ServerCart = {
  cartId: number;
  items: ServerCartItem[];
};

export type CartItemLocal = {
  productId: number;
  variantId: number | null;
  quantity: number;

  productName: string;
  productSlug: string;
  price: number;
  size?: string | null;
  imageUrl?: string | null;

  serverItemId?: number;
};

type CartMode = "guest" | "user";

type CartState = {
  items: CartItemLocal[];
  mode: CartMode;

  setFromServer: (cart: ServerCart) => void;

  addItem: (
    item: Omit<CartItemLocal, "serverItemId">,
    token?: string | null
  ) => Promise<void>;

  updateQuantity: (params: {
    productId: number;
    variantId: number | null;
    quantity: number;
    token?: string | null;
  }) => Promise<void>;

  removeItem: (params: {
    productId: number;
    variantId: number | null;
    token?: string | null;
  }) => Promise<void>;

  clearLocal: () => void;

  syncAfterLogin: (token: string) => Promise<void>;
  loadFromServer: (token: string) => Promise<void>;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      mode: "guest",

      setFromServer: (serverCart) => {
        const mapped: CartItemLocal[] = serverCart.items.map((ci) => ({
          productId: ci.product.id,
          variantId: ci.variant?.id ?? null,
          quantity: ci.quantity,
          productName: ci.product.name,
          productSlug: ci.product.slug,
          price: ci.product.price,
          size: ci.variant?.size,
          imageUrl: ci.product.images?.[0]?.url ?? null,
          serverItemId: ci.id,
        }));

        set({
          items: mapped,
          mode: "user",
        });
      },

      addItem: async (item, token) => {
  const state = get();

  // ------- Guest (tanpa token) -> simpan lokal -------
  if (!token) {
    const items = [...state.items];
    const idx = items.findIndex(
      (i) =>
        i.productId === item.productId &&
        (i.variantId ?? null) === (item.variantId ?? null)
    );

    if (idx === -1) {
      items.push(item);
    } else {
      items[idx] = {
        ...items[idx],
        quantity: items[idx].quantity + item.quantity,
      };
    }

    set({ items, mode: "guest" });
    return;
  }

  // ------- User login -> kirim ke backend -------
  try {
    const res = await api.post<ApiResponse<ServerCart>>(
      "/cart/item",
      {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      },
      token
    );

    if (res.data) {
      get().setFromServer(res.data);
    }
  } catch (err) {
    console.error(err);

    if (err instanceof ApiError && err.status === 401) {
      // token sudah expired -> paksa logout & simpan cart sebagai guest
      const { clearAuth } = useAuthStore.getState();
      clearAuth();

      await get().addItem(item, undefined);
      return;
    }

    throw err;
  }
},


     
      updateQuantity: async ({ productId, variantId, quantity, token }) => {
  const state = get();

  // ------- Guest (tanpa token) -------
  if (!token) {
    let items = [...state.items];
    const idx = items.findIndex(
      (i) =>
        i.productId === productId &&
        (i.variantId ?? null) === (variantId ?? null)
    );
    if (idx === -1) return;

    if (quantity <= 0) {
      items.splice(idx, 1);
    } else {
      items[idx] = { ...items[idx], quantity };
    }

    set({ items, mode: "guest" });
    return;
  }

  // ------- User login -------
  try {
    const res = await api.post<ApiResponse<ServerCart>>(
      "/cart/item",
      {
        productId,
        variantId,
        quantity,
      },
      token
    );

    if (res.data) {
      get().setFromServer(res.data);
    }
  } catch (err) {
    console.error(err);

    if (err instanceof ApiError && err.status === 401) {
      const { clearAuth } = useAuthStore.getState();
      clearAuth();

      // fallback ke logika guest
      let items = [...state.items];
      const idx = items.findIndex(
        (i) =>
          i.productId === productId &&
          (i.variantId ?? null) === (variantId ?? null)
      );
      if (idx === -1) return;

      if (quantity <= 0) {
        items.splice(idx, 1);
      } else {
        items[idx] = { ...items[idx], quantity };
      }

      set({ items, mode: "guest" });
      return;
    }

    throw err;
  }
},


    
      removeItem: async ({ productId, variantId, token }) => {
  const state = get();

  // ------- Guest -------
  if (!token) {
    const filtered = state.items.filter(
      (i) =>
        !(
          i.productId === productId &&
          (i.variantId ?? null) === (variantId ?? null)
        )
    );
    set({ items: filtered, mode: "guest" });
    return;
  }

  // ------- User login -------
  const item = state.items.find(
    (i) =>
      i.productId === productId &&
      (i.variantId ?? null) === (variantId ?? null)
  );
  if (!item?.serverItemId) return;

  try {
    const res = await api.delete<ApiResponse<ServerCart>>(
      `/cart/item/${item.serverItemId}`,
      token
    );

    if (res.data) {
      get().setFromServer(res.data);
    }
  } catch (err) {
    console.error(err);

    if (err instanceof ApiError && err.status === 401) {
      const { clearAuth } = useAuthStore.getState();
      clearAuth();

      // fallback ke guest: hapus saja dari local
      const filtered = state.items.filter(
        (i) =>
          !(
            i.productId === productId &&
            (i.variantId ?? null) === (variantId ?? null)
          )
      );
      set({ items: filtered, mode: "guest" });
      return;
    }

    throw err;
  }
},


      clearLocal: () => {
        set({ items: [], mode: "guest" });
      },

      // dipanggil SETELAH user login untuk merge guest cart -> server cart
      syncAfterLogin: async (token: string) => {
        const state = get();

        const res = await api.post<ApiResponse<ServerCart>>(
          "/cart/sync",
          {
            items: state.items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              quantity: i.quantity,
            })),
          },
          token
        );

        if (res.data) {
          get().setFromServer(res.data);
        }
      },

   
      loadFromServer: async (token: string) => {
  try {
    const res = await api.get<ApiResponse<ServerCart>>("/cart", token);
    if (res.data) {
      get().setFromServer(res.data);
    }
  } catch (err) {
    console.error(err);

    if (err instanceof ApiError && err.status === 401) {
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      set({ mode: "guest" });
      return;
    }

    throw err;
  }
},

    }),
    {
      name: "clrd_cart", // key di localStorage
    }
  )
);
