"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiResponse } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { 
  Search, RefreshCcw, Package, Truck, 
  ExternalLink, X, Clipboard, CheckCircle2, 
  Clock, AlertCircle, MapPin, Hash, User,
  ChevronRight, ArrowRight
} from "lucide-react";

// ==========================================
// 1. TYPES & CONSTANTS
// ==========================================

type OrderStatus = "AWAITING_PAYMENT" | "PROCESSING" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  AWAITING_PAYMENT: { label: "Waiting Payment", color: "bg-amber-500", icon: Clock },
  PROCESSING: { label: "Processing", color: "bg-blue-500", icon: Package },
  PACKED: { label: "Ready to Ship", color: "bg-cyan-500", icon: Package },
  SHIPPED: { label: "On Delivery", color: "bg-indigo-500", icon: Truck },
  DELIVERED: { label: "Success", color: "bg-emerald-500", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "bg-zinc-500", icon: AlertCircle },
};

// ... (Types OrderItem, AdminOrderListRow, AdminOrderDetail sama seperti sebelumnya)

// ==========================================
// 2. HELPER COMPONENTS
// ==========================================

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.CANCELLED;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${cfg.color}`}>
      <Icon size={12} strokeWidth={3} />
      {cfg.label}
    </span>
  );
}

// ==========================================
// 3. MAIN PAGE COMPONENT
// ==========================================

export default function AdminOrdersPage() {
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuthStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Guard Admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADMIN") router.replace("/");
  }, [isAuthenticated, user, router]);

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<any[]>>("/admin/orders", token);
      setOrders(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [token]);

  const filteredOrders = useMemo(() => {
    const q = query.toLowerCase();
    return orders.filter(o => 
      o.orderNumber.toLowerCase().includes(q) || 
      o.shippingName?.toLowerCase().includes(q) ||
      o.user?.email.toLowerCase().includes(q)
    );
  }, [orders, query]);

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selected || !token) return;
    
    // Validasi Resi jika mau set ke SHIPPED
    if (newStatus === "SHIPPED" && !trackingInput.trim()) {
      alert("⚠️ Masukkan nomor resi sebelum set status ke SHIPPED!");
      return;
    }

    setIsUpdating(true);
    try {
      // 1. Update Status
      await api.patch(`/admin/orders/${selected.orderNumber}/status`, { status: newStatus }, token);
      
      // 2. Update Resi (jika ada input)
      if (trackingInput.trim()) {
        await api.patch(`/admin/orders/${selected.orderNumber}/tracking`, { trackingNumber: trackingInput }, token);
      }

      await fetchOrders();
      setSelected(null); // Close modal on success
      setTrackingInput("");
    } catch (err: any) {
      alert(err.message || "Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header Area */}
      <div className="sticky top-0 z-30 bg-white border-b-4 border-black p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Command_Center</h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Orders & Logistics Management</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH_BY_ORDER_OR_NAME..."
                className="w-full pl-10 pr-4 py-3 bg-zinc-100 rounded-xl text-xs font-bold uppercase tracking-widest focus:ring-2 ring-black outline-none transition-all"
              />
            </div>
            <button 
              onClick={fetchOrders}
              className="p-3 bg-black text-white rounded-xl hover:scale-105 active:scale-95 transition-all"
            >
              <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-hidden bg-white border-4 border-black rounded-[2rem] shadow-[10px_10px_0px_rgba(0,0,0,0.05)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-white text-[10px] uppercase tracking-[0.2em]">
                <th className="p-6">Order_ID</th>
                <th className="p-6">Client</th>
                <th className="p-6">Payment</th>
                <th className="p-6">Status</th>
                <th className="p-6">Amount</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-zinc-100">
              {filteredOrders.map(o => (
                <tr key={o.orderNumber} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-6">
                    <span className="font-black font-mono text-sm">{o.orderNumber}</span>
                    <p className="text-[9px] text-zinc-400 mt-1 uppercase">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-6">
                    <p className="font-bold text-xs uppercase">{o.shippingName || o.user?.name}</p>
                    <p className="text-[10px] text-zinc-400">{o.user?.email}</p>
                  </td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded text-[9px] font-black border-2 ${o.paymentStatus === 'PAID' ? 'border-emerald-500 text-emerald-600' : 'border-zinc-200 text-zinc-400'}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="p-6"><StatusBadge status={o.orderStatus} /></td>
                  <td className="p-6 font-black text-sm italic">Rp{o.totalAmount.toLocaleString()}</td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => { setSelected(o); setTrackingInput(o.shippingTrackingNumber || ""); }}
                      className="bg-black text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4">
          {filteredOrders.map(o => (
            <div key={o.orderNumber} className="bg-white border-2 border-black rounded-3xl p-5 shadow-[4px_4px_0px_black]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{new Date(o.createdAt).toLocaleDateString()}</p>
                  <h3 className="font-black text-lg italic tracking-tighter">#{o.orderNumber}</h3>
                </div>
                <StatusBadge status={o.orderStatus} />
              </div>
              <div className="space-y-1 mb-6">
                <p className="text-xs font-bold uppercase">{o.shippingName || o.user?.name}</p>
                <p className="text-[10px] text-zinc-500 font-mono tracking-tighter">{o.user?.email}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-zinc-100">
                <p className="font-black text-sm italic">Rp{o.totalAmount.toLocaleString()}</p>
                <button 
                   onClick={() => { setSelected(o); setTrackingInput(o.shippingTrackingNumber || ""); }}
                   className="bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
                >
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ==========================================
          MODAL DETAIL (The Control Panel)
      ========================================== */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-6">
          <div className="bg-white w-full max-w-4xl max-h-[100vh] md:max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] md:rounded-[3rem] border-x-4 border-t-4 md:border-4 border-black animate-in slide-in-from-bottom duration-300">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b-2 border-zinc-100 p-6 md:p-8 flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter">Order_Manifest</h2>
                  <StatusBadge status={selected.orderStatus} />
                </div>
                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Hash: {selected.orderNumber}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side: Client & Logistics */}
              <div className="space-y-8">
                <section>
                  <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">
                    <User size={14} /> Consignee_Information
                  </h4>
                  <div className="bg-zinc-50 rounded-3xl p-6 border-2 border-zinc-100 space-y-3">
                    <p className="text-sm font-black uppercase italic tracking-tight">{selected.shippingName}</p>
                    <p className="text-xs font-bold text-zinc-600 tracking-widest">{selected.shippingPhone}</p>
                    <div className="pt-3 border-t border-zinc-200">
                      <p className="text-[11px] font-medium leading-relaxed text-zinc-500 italic">
                        {selected.shippingAddress}, {selected.shippingSubdistrictName}, {selected.shippingCityName}, {selected.shippingProvinceName}, {selected.shippingPostalCode}
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">
                    <Truck size={14} /> Logistics_Manifest
                  </h4>
                  <div className="flex items-center gap-4 bg-black text-white p-6 rounded-3xl">
                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Package className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Courier Service</p>
                      <p className="text-sm font-black uppercase italic">{selected.shippingCourier} // {selected.shippingService}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Item_Breakdown</h4>
                  <div className="space-y-3">
                    {/* Placeholder for items if AdminOrderDetail is used */}
                    {/* Disini kita bisa iterasi items dari order detail */}
                    <div className="p-4 border-2 border-zinc-100 rounded-2xl flex justify-between items-center">
                       <span className="text-[10px] font-black uppercase tracking-widest">Total Items</span>
                       <span className="font-mono font-bold">{selected.items?.length || 0} Unit(s)</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Side: Admin Actions */}
              <div className="space-y-8">
                <div className="bg-zinc-900 text-white p-8 rounded-[2rem] shadow-xl">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Execution_Panel</h4>
                  
                  <div className="space-y-6">
                    {/* Update Status Dropdown */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Update Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["PROCESSING", "PACKED", "SHIPPED", "DELIVERED"].map((st) => (
                          <button
                            key={st}
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(st as OrderStatus)}
                            className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-tighter border-2 transition-all
                              ${selected.orderStatus === st 
                                ? "bg-white text-black border-white" 
                                : "border-zinc-700 text-zinc-500 hover:border-zinc-500"}`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tracking Number Input */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Waybill_Number (Resi)</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input 
                          type="text"
                          value={trackingInput}
                          onChange={(e) => setTrackingInput(e.target.value)}
                          placeholder="INPUT_TRACKING_ID..."
                          className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl pl-10 pr-4 py-4 text-xs font-mono uppercase focus:border-white outline-none transition-all"
                        />
                      </div>
                      <p className="text-[8px] text-zinc-500 italic mt-2 uppercase tracking-tight">*Required for SHIPPED status</p>
                    </div>

                    <div className="pt-6 border-t border-zinc-800 flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-black uppercase text-zinc-500 mb-1 tracking-widest">Total Transaction</p>
                        <p className="text-2xl font-black italic tracking-tighter">Rp{selected.totalAmount.toLocaleString()}</p>
                      </div>
                      <button 
                         disabled={isUpdating}
                         onClick={() => handleUpdateStatus(selected.orderStatus)}
                         className="bg-white text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_rgba(255,255,255,0.2)] active:scale-95 transition-all"
                      >
                        {isUpdating ? "SYNCING..." : "Apply_Changes"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}