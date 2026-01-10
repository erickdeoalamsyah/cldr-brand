// src/store/orders.ts
"use client";

import { create } from "zustand";
import { api, ApiResponse } from "@/lib/api";

export type OrderItemSummary = {
  id: number;
  productName: string;
  productSlug: string;
  size: string | null;
  quantity: number;
  price: number;
  imageUrl: string | null;
};

export type OrderSummary = {
  orderNumber: string;
  totalAmount: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";  // sesuaikan enum
  orderStatus:
    | "AWAITING_PAYMENT"
    | "PROCESSING"
    | "PACKED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  shippingTrackingNumber: string | null;
  createdAt: string;
  items: OrderItemSummary[];
};

type OrdersResponse = ApiResponse<OrderSummary[]>;

type OrdersState = {
  orders: OrderSummary[];
  loading: boolean;
  error: string | null;

  fetchOrders: (token: string | null) => Promise<void>;
  reset: () => void;
};

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async (token) => {
    if (!token) return; // kalau belum login, biarin saja

    set({ loading: true, error: null });

    try {
      const res = await api.get<OrdersResponse>("/orders", token);
      set({
        orders: res.data ?? [],
        loading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || "Gagal memuat riwayat pesanan.",
      });
    }
  },

  reset: () =>
    set({
      orders: [],
      loading: false,
      error: null,
    }),
}));
