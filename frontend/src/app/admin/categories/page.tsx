"use client";

import { useEffect, useState } from "react";
import { api, ApiResponse } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { 
  Tag, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2, 
  Hash,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: number;
  name: string;
  slug: string;
  isVisible: boolean;
  createdAt: string;
};

export default function AdminCategoriesPage() {
  const token = useAuthStore((s) => s.token);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.get<ApiResponse<Category[]>>("/admin/categories", token);
      setCategories(res.data || []);
    } catch (err: any) {
      toast.error("Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) void loadCategories();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !nameInput.trim()) return;

    try {
      setSaving(true);
      await api.post<ApiResponse<Category>>(
        "/admin/categories",
        { name: nameInput.trim() },
        token
      );
      toast.success("Kategori berhasil ditambahkan");
      setNameInput("");
      await loadCategories();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat kategori");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisible = async (category: Category) => {
    if (!token) return;
    try {
      await api.put<ApiResponse<Category>>(
        `/admin/categories/${category.id}`,
        { isVisible: !category.isVisible },
        token
      );
      toast.success(`Kategori ${category.isVisible ? 'disembunyikan' : 'ditampilkan'}`);
      await loadCategories();
    } catch (err: any) {
      toast.error("Gagal mengubah status");
    }
  };

  const handleDelete = async (category: Category) => {
    if (!token) return;
    if (!confirm(`Hapus kategori "${category.name}"?`)) return;

    try {
      await api.delete<ApiResponse<null>>(`/admin/categories/${category.id}`, token);
      toast.success("Kategori berhasil dihapus");
      await loadCategories();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="flex-1 max-w-md">
          <form onSubmit={handleCreate} className="relative group">
            <label className="text-sm font-black uppercase tracking-[0.2em]  mb-2 block">
              Quick Create Category
            </label>
            <div className="relative flex items-center">
              <Tag className="absolute left-4 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="New category name..."
                className="w-full cursor-pointer bg-white border-2 border-gray-500 rounded-2xl py-4 pl-12 pr-32 text-sm font-bold text-zinc-900 outline-none focus:border-black focus:ring-4 focus:ring-zinc-50 transition-all caret-black"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={saving || !nameInput.trim()}
                className="absolute right-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 bg-zinc-100/50 rounded-2xl border-2 border-gray-500">
          <span className="text-xs font-black text-gray-500 uppercase tracking-widest ">
            Total {categories.length} Categories
          </span>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border-2 border-gray-500 rounded-[2rem] overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-zinc-400">
            <Loader2 size={32} className="animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Synchronizing Data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-500">
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Identity</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Routing Slug</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Visibility</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {categories.map((cat) => (
                  <tr key={cat.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-black uppercase tracking-tight">{cat.name}</span>
                    </td>
                    <td className="px-8 py-5">
                      <code className="text-[10px] font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-500">/{cat.slug}</code>
                    </td>
                    <td className="px-8 py-5">
                      <button
                        onClick={() => void handleToggleVisible(cat)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all
                          ${cat.isVisible 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                            : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                          }`}
                      >
                        {cat.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                        {cat.isVisible ? "Published" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => void handleDelete(cat)}
                        className="p-2.5 text-red-600 hover:bg-red-600/30 rounded-xl transition-all"
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-zinc-300">
                        <AlertCircle size={40} strokeWidth={1} />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">No categories found in system</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER INFO */}
   
    </div>
  );
}