
"use client";

import { Product } from "./page";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  Package, 
  AlertCircle,
  Loader2,
  Box
} from "lucide-react";

type Props = {
  products: Product[];
  loading: boolean;
  error: string | null;
  onCreateNew: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
};

export function AdminProductList({
  products,
  loading,
  error,
  onCreateNew,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <Package size={20} />
            Inventory List
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Total {products.length} Products in Catalog
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all duration-300 shadow-lg shadow-black/5"
        >
          <Plus size={14} />
          New Product
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-rose-600">
          <AlertCircle size={18} />
          <p className="text-xs font-bold uppercase tracking-wide">{error}</p>
        </div>
      )}

      {/* TABLE CONTAINER */}
      <div className="relative overflow-hidden bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Product Info</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Inventory / Size</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Pricing</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={24} className="animate-spin text-zinc-300" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Syncing Database...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Box size={48} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No products found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="group hover:bg-zinc-50/50 transition-colors">
                    {/* Product Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 border border-zinc-200">
                          {p.images[0]?.url && (
                            <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="max-w-[180px]">
                          <p className="truncate text-xs font-black uppercase tracking-tight text-black">{p.name}</p>
                          <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{p.category?.name ?? "No Category"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Size & Stock (Revisi Request) */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {p.variants && p.variants.length > 0 ? (
                          p.variants.map((v, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                              <span className="flex items-center justify-center h-6 min-w-[32px] px-1.5 rounded-md bg-white border border-zinc-200 text-[9px] font-black uppercase tracking-tighter">
                                {v.size}: {v.stock}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest italic">No Variants</span>
                        )}
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="px-6 py-4">
                      <p className="text-xs font-black italic tracking-tighter text-black">
                        Rp {p.price.toLocaleString("id-ID")}
                      </p>
                    </td>

                    {/* Status Icons */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <div title={p.isVisible ? "Visible" : "Hidden"}>
                          {p.isVisible ? (
                            <Eye size={16} className="text-emerald-500" />
                          ) : (
                            <EyeOff size={16} className="text-zinc-300" />
                          )}
                        </div>
                        <div title={p.isPopular ? "Popular Item" : "Standard"}>
                          <Star size={16} className={p.isPopular ? "fill-amber-400 text-amber-400" : "text-zinc-200"} />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-black hover:bg-black hover:text-white transition-all duration-300 shadow-sm"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}