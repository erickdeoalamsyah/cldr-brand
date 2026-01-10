"use client";

import { Product } from "./page";
import { AdminProductForm } from "./AdminProductForm";
import { X, Edit3, PlusCircle, Package } from "lucide-react";

type Props = {
  open: boolean;
  token: string | null;
  editingProduct: Product | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

export function AdminProductFormModal({
  open,
  token,
  editingProduct,
  onClose,
  onSaved,
}: Props) {
  if (!open) return null;

  const mode: "create" | "edit" = editingProduct ? "edit" : "create";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* 1. BACKDROP OVERLAY with Blur */}
      <div
        className="absolute inset-0 bg-white/60 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />

      {/* 2. MODAL CONTAINER */}
      <div className="relative z-10 flex h-full max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] border border-zinc-100 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in-95 duration-300">
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between border-b border-zinc-50 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg shadow-zinc-200">
              {mode === "create" ? (
                <PlusCircle size={22} />
              ) : (
                <Edit3 size={22} />
              )}
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-black">
                {mode === "create"
                  ? "Add New Collection"
                  : "Edit Item Specification"}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {mode === "create"
                  ? "Define your product parameters"
                  : `Identity Ref: ${editingProduct?.name}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 transition-all hover:bg-black hover:text-white"
          >
            <X
              size={18}
              className="transition-transform group-hover:rotate-90"
            />
          </button>
        </div>

        {/* 3. FORM AREA (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-hide">
          <div className="mx-auto max-w-xl">
            {/* Visual Guide / Step Indicator (Optional Style) */}
            <div className="mb-10 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-emerald-700">
              <Package size={16} className="flex-shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Pastikan data yang dimasukkan sudah sesuai dengan inventory
                gudang.
              </p>
            </div>

            <AdminProductForm
              token={token}
              editingProduct={editingProduct}
              onSaved={onSaved}
              onCancel={onClose}
            />
          </div>
        </div>

        {/* FOOTER DECORATION (Optional) */}
        <div className="h-6 bg-gradient-to-t from-zinc-50/50 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
