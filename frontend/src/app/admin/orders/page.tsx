"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, ApiResponse } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner"; // Import toast dari sonner
import { 
  Search, RefreshCcw, Package, Truck, 
  X, CheckCircle2, Clock, AlertCircle, 
  MapPin, Hash, User, Save, ChevronRight
} from "lucide-react";

type OrderStatus = "AWAITING_PAYMENT" | "PROCESSING" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  AWAITING_PAYMENT: { label: "Waiting", color: "bg-amber-500", icon: Clock },
  PROCESSING: { label: "Process", color: "bg-blue-600", icon: Package },
  PACKED: { label: "Packed", color: "bg-cyan-600", icon: Package },
  SHIPPED: { label: "Shipped", color: "bg-black", icon: Truck },
  DELIVERED: { label: "Done", color: "bg-emerald-600", icon: CheckCircle2 },
  CANCELLED: { label: "Void", color: "bg-red-600", icon: AlertCircle },
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuthStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  
  const [selected, setSelected] = useState<any | null>(null);
  const [tempStatus, setTempStatus] = useState<OrderStatus | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADMIN") router.replace("/");
  }, [isAuthenticated, user, router]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<any[]>>("/admin/orders", token);
      setOrders(res.data || []);
    } catch (err) { 
      toast.error("FETCH_FAILED", { description: "Gagal mengambil data dari server." });
    }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openManageModal = (order: any) => {
    setSelected(order);
    setTempStatus(order.orderStatus);
    setTrackingInput(order.shippingTrackingNumber || "");
  };

  const handleApplyChanges = async () => {
    if (!selected || !token || !tempStatus) return;

    // Ganti alert dengan toast.error
    if (tempStatus === "SHIPPED" && !trackingInput.trim()) {
      toast.error("MISSING_TRACKING_ID", { 
        description: "Nomor resi wajib diisi sebelum status diubah ke SHIPPED." 
      });
      return;
    }

    setIsUpdating(true);
    try {
      if (tempStatus !== selected.orderStatus) {
        await api.patch(`/admin/orders/${selected.orderNumber}/status`, { status: tempStatus }, token);
      }
      
      if (trackingInput !== selected.shippingTrackingNumber) {
        await api.patch(`/admin/orders/${selected.orderNumber}/tracking`, { trackingNumber: trackingInput }, token);
      }

      await fetchOrders();
      setSelected(null);
      
      // Toast sukses yang estetik
      toast.success("ORDER_SYNCED", { 
        description: `Order #${selected.orderNumber} berhasil diperbarui.` 
      });

    } catch (err: any) {
      toast.error("UPDATE_ERROR", { 
        description: err.message || "Terjadi kesalahan saat sinkronisasi data." 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = query.toLowerCase();
    return orders.filter(o => 
      o.orderNumber.toLowerCase().includes(q) || 
      o.shippingName?.toLowerCase().includes(q) ||
      o.user?.email.toLowerCase().includes(q)
    );
  }, [orders, query]);

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-black antialiased font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-black px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">Command_Center</h1>
            <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest leading-none">Order Management</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find ID or Name..."
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-100 rounded-xl text-xs font-bold outline-none border-2 border-transparent focus:border-black transition-all"
              />
            </div>
            <button onClick={fetchOrders} className="p-2.5 bg-black text-white rounded-xl active:scale-90 transition-transform shadow-[4px_4px_0px_#e2e2e2]">
              <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Mobile List View */}
        <div className="md:hidden space-y-3">
          {filteredOrders.map(o => (
            <div key={o.orderNumber} className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_black] active:scale-[0.98] transition-all" onClick={() => openManageModal(o)}>
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">#{o.orderNumber}</span>
                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-white ${STATUS_CONFIG[o.orderStatus as OrderStatus]?.color}`}>
                  {o.orderStatus}
                </div>
              </div>
              <p className="text-xs font-black uppercase truncate tracking-tight">{o.shippingName || o.user?.name}</p>
              <div className="mt-3 pt-3 border-t border-dashed border-zinc-200 flex justify-between items-center">
                <p className="font-bold text-sm font-mono italic">Rp{o.totalAmount.toLocaleString()}</p>
                <div className="text-[10px] font-black uppercase flex items-center gap-1">Manage <ChevronRight size={12}/></div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block bg-white border-2 border-black rounded-3xl overflow-hidden shadow-[10px_10px_0px_rgba(0,0,0,0.05)]">
          <table className="w-full text-left">
            <thead className="bg-black text-white text-[10px] uppercase font-bold tracking-[0.2em]">
              <tr>
                <th className="p-5">Order_ID</th>
                <th className="p-5">Client_Identity</th>
                <th className="p-5">Status_State</th>
                <th className="p-5">Valuation</th>
                <th className="p-5 text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.map(o => (
                <tr key={o.orderNumber} className="hover:bg-zinc-50 transition-colors group">
                  <td className="p-5 font-mono font-bold text-xs">#{o.orderNumber}</td>
                  <td className="p-5">
                    <p className="text-xs font-black uppercase tracking-tighter">{o.shippingName}</p>
                    <p className="text-[10px] text-zinc-400 font-mono italic">{o.user?.email}</p>
                  </td>
                  <td className="p-5">
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black text-white ${STATUS_CONFIG[o.orderStatus as OrderStatus]?.color}`}>
                        {o.orderStatus}
                     </span>
                  </td>
                  <td className="p-5 font-bold text-xs italic font-mono">Rp{o.totalAmount.toLocaleString()}</td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => openManageModal(o)} 
                      className="bg-black text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[4px_4px_0px_#e2e2e2]"
                    >
                      Process
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Detail */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-4">
          <div className="bg-white w-full max-w-2xl h-[95vh] md:h-auto md:max-h-[92vh] overflow-hidden flex flex-col rounded-t-[2.5rem] md:rounded-[3rem] border-t-4 border-x-4 md:border-4 border-black animate-in slide-in-from-bottom duration-300">
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b-2 border-zinc-100 flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <h2 className="text-2xl font-black uppercase italic leading-none tracking-tighter">Manifest_Review</h2>
                <p className="text-[10px] font-mono text-zinc-400 mt-1 truncate">Unique_Hash: {selected.orderNumber}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all shrink-0">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              
              {/* Shipping Address Section */}
              <section className="space-y-4">
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em]">
                  <MapPin size={14} /> Logistics_Consignee
                </h4>
                <div className="bg-zinc-50 border-2 border-zinc-100 p-6 rounded-3xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="min-w-0">
                      <p className="text-sm font-black uppercase italic truncate">{selected.shippingName}</p>
                      <p className="text-xs font-bold text-zinc-500 font-mono tracking-tighter">{selected.shippingPhone}</p>
                    </div>
                    <div className="bg-black text-white px-3 py-1 rounded-lg shrink-0">
                      <p className="text-[9px] font-black uppercase tracking-widest italic">
                        {selected.shippingCourier} // {selected.shippingService}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-[11px] leading-relaxed text-zinc-600 font-medium border-t-2 border-white pt-4">
                    <p className="mb-1">{selected.shippingAddress}</p>
                    <p className="font-black uppercase text-black tracking-tight">
                      {selected.shippingSubdistrictName}, {selected.shippingCityName}
                    </p>
                    <p className="uppercase text-zinc-400 text-[10px] tracking-widest mt-0.5 font-bold">
                      {selected.shippingProvinceName} // {selected.shippingPostalCode}
                    </p>
                  </div>
                </div>
              </section>

              {/* Action Panel - Black & White High Contrast */}
              <section className="bg-white border-4 border-black p-6 md:p-8 rounded-[2.5rem] shadow-[10px_10px_0px_#f0f0f0] mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2 border-b-2 border-black pb-3">
                  <Save size={14} /> Admin_Terminal_Execution
                </h4>

                <div className="space-y-8">
                  {/* Status Selection */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-[0.2em]">Update_Progress_Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["PROCESSING", "PACKED", "SHIPPED", "DELIVERED"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setTempStatus(st as OrderStatus)}
                          className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2
                            ${tempStatus === st 
                              ? "bg-black text-white border-black scale-[1.02] shadow-lg shadow-black/10" 
                              : "bg-white text-black border-zinc-200 hover:border-black active:scale-95"}`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Waybill Input */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-[0.2em]">Waybill_Reference (Resi)</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={16} />
                      <input 
                        type="text"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        placeholder="INPUT_ID_TRACKING_HERE..."
                        className="w-full bg-zinc-50 border-2 border-black rounded-[1.2rem] pl-12 pr-4 py-5 text-xs font-mono font-bold uppercase focus:ring-8 focus:ring-zinc-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t-2 border-zinc-100 flex flex-col sm:flex-row gap-6 items-center justify-between">
                    <div className="text-center sm:text-left">
                      <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">Total_Billable</p>
                      <p className="text-3xl font-black italic tracking-tighter leading-none">Rp{selected.totalAmount.toLocaleString()}</p>
                    </div>
                    <button 
                      disabled={isUpdating}
                      onClick={handleApplyChanges}
                      className="w-full sm:w-auto bg-black text-white px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] hover:invert active:scale-95 transition-all shadow-[8px_8px_0px_#e2e2e2] disabled:opacity-50"
                    >
                      {isUpdating ? "SYNCHRONIZING..." : "Apply_Changes"}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}