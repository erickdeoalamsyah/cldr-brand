"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiResponse } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { AdminProductList } from "./AdminProductList";
import { AdminProductFormModal } from "../products/AdminProductFormModal";

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
  description: string | null;
  price: number;
  weight: number;
  // category: string | null;
  category?: { id: number; name: string; slug: string } | null;

  isVisible: boolean;
  isPopular: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
};

export default function AdminProductsPage() {
  const router = useRouter();
  // const initAuth = useAuthStore((s) => s.init);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Guard admin
  // useEffect(() => {
  //   initAuth();
  // }, [initAuth]);

  useEffect(() => {
    const t = setTimeout(() => {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated || !state.user || state.user.role !== "ADMIN") {
        router.replace("/");
      }
    }, 200);

    return () => clearTimeout(t);
  }, [router, isAuthenticated, user]);

  const loadProducts = async () => {
    if (!token) return;
    try {
      setLoadingList(true);
      setErrorList(null);
      const res = await api.get<ApiResponse<Product[]>>(
        "/admin/products",
        token
      );
      setProducts(res.data || []);
    } catch (err: any) {
      console.error(err);
      setErrorList(err.message || "Gagal memuat produk (admin).");
      setProducts([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreateNew = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (productId: number) => {
    if (!token) return;
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    try {
      await api.delete<ApiResponse<null>>(
        `/admin/products/${productId}`,
        token
      );
      await loadProducts();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus produk.");
    }
  };

  if (!isAuthenticated || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <p className="text-sm text-slate-400">Memuat halaman admin...</p>
      </div>
    );
  }

  return (
  <section className="space-y-4">
 

    <AdminProductList
      products={products}
      loading={loadingList}
      error={errorList}
      onCreateNew={handleCreateNew}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />

    <AdminProductFormModal
      open={modalOpen}
      token={token}
      editingProduct={editingProduct}
      onClose={() => setModalOpen(false)}
      onSaved={async () => {
        await loadProducts();
        setModalOpen(false);
        setEditingProduct(null);
      }}
    />
  </section>
);

}
