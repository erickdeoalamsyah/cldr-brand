"use client";

import { useEffect, useState } from "react";
import { api, ApiResponse, API_BASE_URL } from "@/lib/api";
import { Product } from "./page";
import {
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Layers,
  Info,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type ProductImageInput = { url: string; alt?: string };
type VariantInput = { size: string; stock: string };
type CategoryOption = { id: number; name: string; slug: string };

type Props = {
  token: string | null;
  editingProduct: Product | null;
  onSaved: () => Promise<void> | void;
  onCancel: () => void;
};

export function AdminProductForm({
  token,
  editingProduct,
  onSaved,
  onCancel,
}: Props) {
  const mode: "create" | "edit" = editingProduct ? "edit" : "create";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [images, setImages] = useState<ProductImageInput[]>([{ url: "" }]);
  const [variants, setVariants] = useState<VariantInput[]>([
    { size: "M", stock: "0" },
    { size: "L", stock: "0" },
  ]);

  const [formLoading, setFormLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      try {
        const res = await api.get<ApiResponse<CategoryOption[]>>(
          "/admin/categories",
          token
        );
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    void fetchCategories();
  }, [token]);

  useEffect(() => {
    if (!editingProduct) {
      setName("");
      setDescription("");
      setCategoryId(null);
      setWeight("");
      setPrice("");
      setIsVisible(true);
      setIsPopular(false);
      setImages([{ url: "" }]);
      setVariants([
        { size: "M", stock: "0" },
        { size: "L", stock: "0" },
      ]);
      return;
    }
    setName(editingProduct.name);
    setDescription(editingProduct.description || "");
    setCategoryId(editingProduct.category?.id ?? null);
    setWeight(String(editingProduct.weight));
    setPrice(String(editingProduct.price));
    setIsVisible(editingProduct.isVisible);
    setIsPopular(editingProduct.isPopular);
    setImages(
      editingProduct.images.length > 0
        ? editingProduct.images.map((img) => ({
            url: img.url,
            alt: img.alt || "",
          }))
        : [{ url: "" }]
    );
    setVariants(
      editingProduct.variants.length > 0
        ? editingProduct.variants.map((v) => ({
            size: v.size,
            stock: String(v.stock),
          }))
        : [{ size: "", stock: "0" }]
    );
  }, [editingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormError(null);
    setFormMessage(null);

    const preparedImages = images
      .filter((img) => img.url.trim() !== "")
      .map((img, index) => ({
        url: img.url.trim(),
        alt: img.alt?.trim() || undefined,
        position: index,
      }));
    const preparedVariants = variants
      .filter((v) => v.size.trim() !== "")
      .map((v) => ({
        size: v.size.trim(),
        stock: Number(v.stock) || 0,
      }));

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId: categoryId ?? undefined,
      weight: Number(weight),
      price: Number(price),
      isVisible,
      isPopular,
      images: preparedImages,
      variants: preparedVariants,
    };

    try {
      setFormLoading(true);
      if (mode === "create") {
        await api.post("/admin/products", payload, token);
      } else {
        await api.put(`/admin/products/${editingProduct?.id}`, payload, token);
      }
      setFormMessage("Data synchronization successful.");
      setTimeout(() => onSaved(), 800);
    } catch (err: any) {
      setFormError(err.message || "Failed to save product.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUploadImageFile = async (file: File, index: number) => {
    if (!token || !API_BASE_URL) return;
    try {
      setUploadingIndex(index);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE_URL}/admin/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data?.success)
        throw new Error(data?.message || "Upload failed");
      setImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, url: data.data.url } : img
        )
      );
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 pb-10">
      {/* STATUS ALERTS */}
      {(formError || formMessage) && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-[11px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2 ${
            formError
              ? "bg-rose-50 text-rose-600 border border-rose-100"
              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
          }`}
        >
          {formError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {formError || formMessage}
        </div>
      )}

      {/* SECTION 1: PRIMARY DETAILS */}
      <section className="space-y-8 ">
        <div className="flex items-center gap-2 text-black mb-6">
          <div className="h-2 w-2 bg-black rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">
            Identity & Narrative
          </h3>
        </div>

        <div className="space-y-8">
          {/* Product Name - Minimalist & Functional */}
          <div className="relative group">
            <label className="text-[9px] font-bold uppercase  tracking-widest text-zinc-400 mb-1 block">
              Product Name
            </label>
            <input
              type="text"
              required
              // MENGGUNAKAN border-zinc-200 daripada bg-slate-950
              // Memastikan background murni transparan atau putih agar kursor I-Beam default ke hitam
              className="w-full bg-white border-b border-zinc-200 py-3 text-sm cursor-pointer font-bold text-zinc-900 placeholder:text-zinc-300 outline-none focus:border-black transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Signature Oversized Hoodie"
            />
          </div>

          {/* Description - Standard Best Practice for Textarea */}
          <div className="relative group">
            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">
              Product Description
            </label>
            <textarea
              className="w-full bg-white border border-zinc-200 cursor-pointer rounded-xl p-4 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-black transition-all min-h-[120px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Crafted from premium heavy-weight cotton..."
            />
          </div>

          {/* Grid System - Category, Weight, Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col">
              <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Category
              </label>
              <select
                className="bg-white border-b border-zinc-200 py-3 text-xs font-bold text-zinc-900 outline-none focus:border-black transition-all cursor-pointer"
                value={categoryId ?? ""}
                onChange={(e) =>
                  setCategoryId(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Weight (Grams)
              </label>
              <input
                type="number"
                required
                className="bg-white border-b border-zinc-200 py-3 text-sm font-bold text-zinc-900 cursor-pointer outline-none focus:border-black transition-all"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Price (IDR)
              </label>
              <div className="relative">
                <span className="absolute left-0 bottom-3 text-xs font-bold text-zinc-400">
                  Rp
                </span>
                <input
                  type="number"
                  required
                  className="w-full cursor-pointer bg-white border-b border-zinc-200 pl-6 py-3 text-sm font-bold text-zinc-900 outline-none focus:border-black transition-all"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: INVENTORY & VISIBILITY */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-black mb-4">
          <Layers size={16} />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">
            Inventory & Logic
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Variants */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                Size Variants
              </label>
              <button
                type="button"
                onClick={() =>
                  setVariants([...variants, { size: "", stock: "0" }])
                }
                className="text-[9px] font-black uppercase text-emerald-600 hover:underline"
              >
                + Add Size
              </button>
            </div>
            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 items-center animate-in slide-in-from-left-2 duration-300"
                >
                  <input
                    placeholder="Size"
                    className="w-20 bg-white cursor-pointer border border-zinc-200 rounded-lg px-3 py-2 text-[10px] font-black text-center"
                    value={v.size}
                    onChange={(e) =>
                      setVariants(
                        variants.map((pv, i) =>
                          i === idx ? { ...pv, size: e.target.value } : pv
                        )
                      )
                    }
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    className="flex-1 bg-white cursor-pointer border border-zinc-200 rounded-lg px-3 py-2 text-[10px] font-bold"
                    value={v.stock}
                    onChange={(e) =>
                      setVariants(
                        variants.map((pv, i) =>
                          i === idx ? { ...pv, stock: e.target.value } : pv
                        )
                      )
                    }
                  />
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setVariants(variants.filter((_, i) => i !== idx))
                      }
                      className="text-zinc-300 hover:text-rose-500"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Checks */}
          <div className="bg-zinc-50 rounded-3xl p-6 space-y-4 border border-zinc-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black">
                Visible in Catalog
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-black">
                Feature as Popular
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* SECTION 3: MEDIA ASSETS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-black">
            <ImageIcon size={16} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">
              Media Assets
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setImages([...images, { url: "" }])}
            className="text-[9px] font-black uppercase text-emerald-600 hover:underline"
          >
            + New Slot
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="group relative bg-white border border-zinc-100 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center"
            >
              <div className="h-20 w-16 bg-zinc-50 rounded-lg flex-shrink-0 overflow-hidden border border-zinc-100 relative">
                {img.url ? (
                  <img
                    src={img.url}
                    className="h-full w-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-zinc-300">
                    <Upload size={16} />
                  </div>
                )}
                {uploadingIndex === idx && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 size={16} className="text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex gap-2">
                  <label className="cursor-pointer bg-zinc-900 text-white px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-black transition-colors">
                    Upload File
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleUploadImageFile(e.target.files[0], idx)
                      }
                    />
                  </label>
                  <input
                    className="flex-1 bg-zinc-50 px-3 py-1.5 rounded-md text-[10px] outline-none focus:ring-1 focus:ring-black"
                    placeholder="or paste external URL"
                    value={img.url}
                    onChange={(e) =>
                      setImages(
                        images.map((p, i) =>
                          i === idx ? { ...p, url: e.target.value } : p
                        )
                      )
                    }
                  />
                </div>
                <input
                  className="w-full bg-transparent border-b border-zinc-100 py-1 text-[10px] outline-none focus:border-black"
                  placeholder="Alt text (SEO)"
                  value={img.alt || ""}
                  onChange={(e) =>
                    setImages(
                      images.map((p, i) =>
                        i === idx ? { ...p, alt: e.target.value } : p
                      )
                    )
                  }
                />
              </div>

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="text-zinc-200 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-zinc-100">
        <button
          type="button"
          disabled={formLoading}
          onClick={onCancel}
          className="px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black hover:bg-zinc-50 transition-all"
        >
          Discard Changes
        </button>
        <button
          type="submit"
          disabled={formLoading}
          className="flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:bg-zinc-800 disabled:opacity-50 transition-all"
        >
          {formLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {mode === "create" ? "Initialize Product" : "Commit Updates"}
        </button>
      </div>
    </form>
  );
}
